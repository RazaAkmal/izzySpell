import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { userId, listName, words } = await req.json();

    // Validate the input
    if (!userId || !listName || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "Invalid input: 'userId', 'listName', and 'words' are required." },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Create the SpellingList and associated Words
    const spellingList = await prisma.spellingList.create({
      data: {
        listName,
        userId, // Associate the spelling list with the user
        words: {
          create: words.map((word: string) => ({
            word,
          })),
        },
      },
      include: {
        words: true, // Include the related words in the response
      },
    });

    // Respond with the created data
    return NextResponse.json(
      { message: "Spelling list created successfully!", spellingList },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving spelling list:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
