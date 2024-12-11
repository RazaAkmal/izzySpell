import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance

export async function GET(req: Request) {
  try {
    // Get the userId from the request query (or body depending on your use case)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Validate the userId
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid input: 'userId' is required." },
        { status: 400 }
      );
    }

    // Fetch only the spelling list details for the user without associated words or groupedWords
    const spellingLists = await prisma.spellingList.findMany({
      where: { userId: userId }, 
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if the user has spelling lists
    if (spellingLists.length === 0) {
      return NextResponse.json(
        { message: "No spelling lists found for this user." },
        { status: 404 }
      );
    }

    // Respond with the spelling lists
    return NextResponse.json(
      { message: "Spelling lists fetched successfully!", spellingLists },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching spelling lists:", error);

    // Return an error response
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
