import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request) {
  try {
    // Parse the request body
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

    // Verify the spelling list exists for the user
    const spellingList = await prisma.spellingList.findUnique({
      where: { id: listId, userId },
      include: { words: true, syllableWords: true, groupedWords: true },
    });

    if (!spellingList) {
      return NextResponse.json({ error: "Spelling list not found." }, { status: 404 });
    }

    // Update the spelling list name
    await prisma.spellingList.update({
      where: { id: listId },
      data: { listName },
    });

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

    // Generate and save new syllable words
    const newSyllableWords = await prisma.syllableWord.createMany({
      data: extractedWords.SyllabusWords.map((syllableWord: string, index: number) => ({
        syllables: syllableWord,
        word: extractedWords.OriginalWords[index],
        listId,
      })),
    });

    // Generate and save new grouped words
    const newGroupedWords = await prisma.groupedWord.createMany({
      data: Object.entries(extractedWords.GroupedWords as Record<string, string[]>).flatMap(
        ([groupName, groupWords]) =>
          groupWords.map((word: string) => ({
            groupName,
            word,
            listId,
          }))
      ),
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
  } catch (error) {
    console.error("Error updating spelling list:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
