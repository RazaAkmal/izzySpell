import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    // Parse the request body to extract the userId and file content
    const { userId, words, extractedWords, listName } = await req.json();

  
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Create the SpellingList and associated entries
    const spellingList = await prisma.spellingList.create({
      data: {
        listName,
        userId,
        words: {
          create: words.map((word: string) => ({
            word,
            type: "original",
          })),
        },
        syllableWords: {
          create: extractedWords.SyllabusWords.map((syllableWord: string, index: number) => ({
            syllables: syllableWord,
            word: extractedWords.OriginalWords[index],
          })),
        },
        groupedWords: {
          create: Object.entries(extractedWords.GroupedWords as Record<string, string[]>).flatMap(
            ([groupName, groupWords]) =>
              groupWords.map((word: string) => ({
                groupName,
                word,
              }))
          ),
        },
      },
      include: {
        words: true,
        syllableWords: true,
        groupedWords: true,
      },
    });
    revalidatePath('/dashboard')
    return NextResponse.json(
      { message: "Spelling list created successfully!", spellingList },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in Saving:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
