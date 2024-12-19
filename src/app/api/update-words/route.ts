import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from 'next/cache'

export async function PATCH(req: Request) {
  try {
    // Parse the request body
    const { userId, listId, listName, words } = await req.json();

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
      where: {
        id: listId,
        userId: userId,
      },
      include: { words: true },
    });

    if (!spellingList) {
      return NextResponse.json({ error: "Spelling list not found." }, { status: 404 });
    }

    // Update the spelling list name
    await prisma.spellingList.update({
      where: { id: listId },
      data: { listName: listName },
    });

    // Track updated words
    const updatedWords = [];

    // Iterate through the provided words to update them
    for (const word of words) {
      if (word.id && word.word) {
        const existingWord = spellingList.words.find((w) => w.id === word.id);

        if (existingWord && existingWord.word !== word.word) {
          // Update the word if it has changed
          const updatedWord = await prisma.word.update({
            where: { id: word.id },
            data: { word: word.word },
          });

          updatedWords.push(updatedWord);
        }
      }
    }

    // Revalidate the path after the update
    revalidatePath('/lists')

    // Return the response with updated list and words
    return NextResponse.json(
      { message: "Spelling list and words updated successfully!" },
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
