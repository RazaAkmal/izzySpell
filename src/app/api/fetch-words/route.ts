import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { getSessionUserId } from "@/lib/requireSession";

export async function GET(req: Request) {
  try {
    // The owner is ALWAYS the signed-in user; a userId in the query is ignored
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const spellingListId = searchParams.get("spellingListId");
    if (!spellingListId) {
      return NextResponse.json(
        { error: "Invalid input: 'spellingListId' is required." },
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
    // Only the signed-in user's own list is returned (someone else's list looks "not found")
    const spellingListWithWords = await prisma.spellingList.findFirst({
      where: { id: spellingListIdInt, userId },
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
