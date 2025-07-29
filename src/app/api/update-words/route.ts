import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request) {
  try {
    const { userId, listId, listName, words, extractedWords } = await req.json();

    // Validate the input
    if (!userId || !listId || !listName || !Array.isArray(words)) {
      return NextResponse.json(
        { error: "Invalid input: 'userId', 'listId', 'listName', and 'words' are required." },
        { status: 400 }
      );
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

    // Check if the list name has changed
    const hasListNameChanged = spellingList.listName !== listName;

    // Check if the words have changed

    const hasWordsChanged = words === null || words.length === 0
      ? false : true;

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
      // Update the spelling list name if it has changed
      if (hasListNameChanged) {
        await prisma.spellingList.update({
          where: { id: listId },
          data: { 
            listName,
            shortPaceDuration: null,
            mediumPaceDuration: null,
            generousPaceDuration: null 
          },
        });
      } else {
        await prisma.spellingList.update({
          where: { id: listId },
          data: { 
            shortPaceDuration: null,
            mediumPaceDuration: null,
            generousPaceDuration: null 
          },
        });
      }

      // Delete existing related data (syllableWords, groupedWords)
      await prisma.syllableWord.deleteMany({ where: { listId } });
      await prisma.groupedWord.deleteMany({ where: { listId } });

      // Update or create words
      const updatedWords = [];
      for (const word of words) {
        if (word.id) {
          // Update existing word if changed
          const existingWord = spellingList.words.find((w) => w.id === word.id);
          if (existingWord && existingWord.word !== word.word) {
            const updatedWord = await prisma.word.update({
              where: { id: word.id },
              data: { word: word.word },
            });
            updatedWords.push(updatedWord);
          }
        } else if (word.word) {
          // Create new word
          const newWord = await prisma.word.create({
            data: {
              word: word.word,
              listId,
              type: "original",
            },
          });
          updatedWords.push(newWord);
        }
      }
      // Validate extractedWords before using it
      if (
        extractedWords &&
        Array.isArray(extractedWords.SyllabusWords) &&
        Array.isArray(extractedWords.OriginalWords) &&
        extractedWords.GroupedWords &&
        typeof extractedWords.GroupedWords === "object"
      ) {
        // Explicitly type extractedWords.GroupedWords as a Record<string, string[]>
        const groupedWords = extractedWords.GroupedWords as Record<string, string[]>;

        // Generate and save new syllable words
        const newSyllableWords = await prisma.syllableWord.createMany({
          data: extractedWords.SyllabusWords.map((syllableWord: any) => ({
            word: syllableWord.Word, // Map "Word" to "word"
            options: syllableWord.Options, // Map "Options" to "options"
            answer: syllableWord.Answer, // Map "Answer" to "answer"
            listId,
          })),
          skipDuplicates: true, // Avoid duplicate entries
        });

        // Generate and save new grouped words
        const newGroupedWords = await prisma.groupedWord.createMany({
          data: Object.entries(groupedWords).flatMap(
            ([groupName, groupWords]) =>
              groupWords.map((word: string) => ({
                groupName,
                word,
                listId,
              }))
          ),
          skipDuplicates: true, // Avoid duplicate entries
        });

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
      } else {
        console.warn("Invalid or missing extractedWords:", extractedWords);
      }
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
