import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/requireSession";
import { isValidExtractedWords } from "@/lib/extractedWords";
import { MAX_WORDS_PER_LIST, MAX_WORDS_ERROR } from "@/lib/limits";

export async function PATCH(req: Request) {
  try {
    // The caller is ALWAYS the signed-in user; a userId in the body is ignored
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { listId, listName, words, extractedWords } = await req.json();

    // Validate the input
    if (!listId || !listName || !Array.isArray(words)) {
      return NextResponse.json(
        { error: "Invalid input: 'listId', 'listName', and 'words' are required." },
        { status: 400 }
      );
    }
    if (words.length > MAX_WORDS_PER_LIST) {
      return NextResponse.json({ error: MAX_WORDS_ERROR }, { status: 400 });
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const spellingList = await prisma.spellingList.findUnique({
      where: { id: listId, userId },
      include: { words: true },
    });

    if (!spellingList) {
      return NextResponse.json({ error: "Spelling list not found." }, { status: 404 });
    }

    // `words` holds only the edited and new words, so also cap the size the list would
    // end up with (the words already in the database + the new ones)
    const newWordCount = words.filter((w: any) => !w.id && w.word).length;
    if (spellingList.words.length + newWordCount > MAX_WORDS_PER_LIST) {
      return NextResponse.json({ error: MAX_WORDS_ERROR }, { status: 400 });
    }

    // Check if the list name has changed
    const hasListNameChanged = spellingList.listName !== listName;

    // The client sends AI data only when words were added, edited or deleted
    // (a delete-only edit has no entries in `words`, but does carry extractedWords)
    const hasExtractedWords =
      !!extractedWords &&
      typeof extractedWords === "object" &&
      Object.keys(extractedWords).length > 0;
    const hasWordsChanged = words.length > 0 || hasExtractedWords;

    // If only the list name has changed, update it and skip other operations
    if (hasListNameChanged && !hasWordsChanged) {
      await prisma.spellingList.update({
        where: { id: listId },
        data: { listName },
      });

      // Revalidate the path after the update
      revalidatePath("/lists");

      return NextResponse.json(
        { message: "List name updated successfully!" },
        { status: 200 }
      );
    }

    // If words have changed, perform word-related operations
    if (hasWordsChanged) {
      // Validate BEFORE touching the database: if the AI data is missing or bad,
      // the existing words, syllable words and grouped words stay exactly as they are
      if (!isValidExtractedWords(extractedWords)) {
        console.warn("Invalid or missing extractedWords:", extractedWords);
        return NextResponse.json(
          { error: "The processed word data was invalid. Your list was not changed. Please try saving again." },
          { status: 400 }
        );
      }

      const groupedWords = extractedWords.GroupedWords as Record<string, string[]>;

      // Word edits/creates, the list update and the exercise replacement run as ONE
      // atomic call, so a partial failure can never leave the list without exercises
      const wordOperations = [];
      for (const word of words) {
        if (word.id) {
          // Update existing word if changed
          const existingWord = spellingList.words.find((w) => w.id === word.id);
          if (existingWord && existingWord.word !== word.word) {
            wordOperations.push(
              prisma.word.update({
                where: { id: word.id },
                data: { word: word.word },
              })
            );
          }
        } else if (word.word) {
          // Create new word
          wordOperations.push(
            prisma.word.create({
              data: { word: word.word, listId, type: "original" },
            })
          );
        }
      }

      const results = await prisma.$transaction([
        prisma.spellingList.update({
          where: { id: listId },
          data: {
            ...(hasListNameChanged ? { listName } : {}),
            shortPaceDuration: null,
            mediumPaceDuration: null,
            generousPaceDuration: null,
          },
        }),
        // Flash cards and scramble words are built from the old words: drop them so
        // they are regenerated from the new words the next time they are opened
        prisma.flashCard.deleteMany({ where: { listId } }),
        prisma.scrambleWord.deleteMany({ where: { listId } }),
        ...wordOperations,
        prisma.syllableWord.deleteMany({ where: { listId } }),
        prisma.syllableWord.createMany({
          data: extractedWords.SyllableWords.map((syllableWord: any) => ({
            word: syllableWord.Word, // Map "Word" to "word"
            options: syllableWord.Options, // Map "Options" to "options"
            answer: syllableWord.Answer, // Map "Answer" to "answer"
            listId,
          })),
        }),
        prisma.groupedWord.deleteMany({ where: { listId } }),
        prisma.groupedWord.createMany({
          data: Object.entries(groupedWords).flatMap(([groupName, groupWords]) =>
            groupWords.map((word: string) => ({
              groupName,
              word,
              listId,
            }))
          ),
        }),
      ]);

      // results: [list update, flash delete, scramble delete, ...word operations, syllable delete, syllable create, group delete, group create]
      const updatedWords = results.slice(3, 3 + wordOperations.length);
      const newSyllableWords = results[results.length - 3];
      const newGroupedWords = results[results.length - 1];

      // Revalidate the path after the update
      revalidatePath("/lists");

      // Return the response with updated list and words
      return NextResponse.json(
        {
          message: "Spelling list, grouped words, and syllable words updated successfully!",
          updatedWords,
          newSyllableWords,
          newGroupedWords,
        },
        { status: 200 }
      );
    }

    // If no changes were detected, we don't reset the AI timer suggestions
    return NextResponse.json(
      { message: "No changes detected." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating spelling list:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
