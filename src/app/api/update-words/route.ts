import { NextResponse, after } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/requireSession";
import { MAX_WORDS_PER_LIST, MAX_WORDS_ERROR } from "@/lib/limits";
import { generateListExercises } from "@/app/actions/AiService";

export async function PATCH(req: Request) {
  try {
    // The caller is ALWAYS the signed-in user; a userId in the body is ignored
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { listId, listName, words, wordsChanged } = await req.json();

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

    // A delete-only edit has no entries in `words`, so the client also sends `wordsChanged`
    const hasWordsChanged = words.length > 0 || wordsChanged === true;

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
      // Word edits/creates, the list update and clearing the old exercises run as ONE atomic
      // call. Saving never depends on the AI: the new exercises are generated in the background.
      // Each database call is a network round trip, so all edited words are updated in one
      // statement and all new words are inserted in one, however many there are.
      const edited: { id: number; word: string }[] = [];
      const added: string[] = [];
      for (const word of words) {
        if (word.id) {
          const existingWord = spellingList.words.find((w) => w.id === word.id);
          if (existingWord && existingWord.word !== word.word) {
            edited.push({ id: word.id, word: word.word });
          }
        } else if (word.word) {
          added.push(word.word);
        }
      }

      const [, , , createdWords] = await prisma.$transaction([
        prisma.spellingList.update({
          where: { id: listId },
          data: {
            ...(hasListNameChanged ? { listName } : {}),
            shortPaceDuration: null,
            mediumPaceDuration: null,
            generousPaceDuration: null,
          },
        }),
        // Every exercise is built from the old words: drop them so they are regenerated
        prisma.flashCard.deleteMany({ where: { listId } }),
        prisma.scrambleWord.deleteMany({ where: { listId } }),
        prisma.word.createManyAndReturn({
          data: added.map((word) => ({ word, listId, type: "original" })),
        }),
        ...(edited.length > 0
          ? [
              prisma.$executeRaw`
                UPDATE words AS w SET word = v.word
                FROM unnest(${edited.map((e) => e.id)}::int[], ${edited.map((e) => e.word)}::text[])
                  AS v(id, word)
                WHERE w.id = v.id AND w."listId" = ${listId}`,
            ]
          : []),
        prisma.syllableWord.deleteMany({ where: { listId } }),
        prisma.groupedWord.deleteMany({ where: { listId } }),
      ]);

      const updatedWords = [
        ...edited.map((e) => ({ ...spellingList.words.find((w) => w.id === e.id)!, word: e.word })),
        ...createdWords,
      ];

      // Same as save-words: after the response, with the practice page as the fallback
      after(() => generateListExercises(listId));

      // Revalidate the path after the update
      revalidatePath("/lists");

      // Return the response with updated list and words
      return NextResponse.json(
        {
          message: "Spelling list updated successfully!",
          updatedWords,
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
