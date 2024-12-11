import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance

export async function GET(req: Request) {
  try {
    // Get the userId and spellingListId from the request query
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const spellingListId = searchParams.get("spellingListId");
    // Validate the userId and spellingListId
    if (!userId || !spellingListId) {
      return NextResponse.json(
        { error: "Invalid input: 'userId' and 'spellingListId' are required." },
        { status: 400 }
      );
    }

    const spellingListIdInt = parseInt(spellingListId);

    if (isNaN(spellingListIdInt)) {
      return NextResponse.json(
        { error: "'spellingListId' must be a valid number." },
        { status: 400 }
      );
    }

    // Fetch the spelling list and associated words based on spellingListId
    const spellingListWithWords = await prisma.spellingList.findUnique({
      where: { id: spellingListIdInt },  // Use the converted integer
      include: {
        words: true,  // Assuming there is a 'words' relation in your schema
      },
    });

    // Check if the spelling list exists
    if (!spellingListWithWords) {
      return NextResponse.json(
        { message: "Spelling list not found." },
        { status: 404 }
      );
    }

    // Respond with the spelling list and associated words
    return NextResponse.json(
      { message: "Spelling list and words fetched successfully!", spellingListWithWords },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching spelling list and words:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
