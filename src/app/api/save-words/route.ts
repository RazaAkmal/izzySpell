import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from "next/cache";
import { generateAndSaveTimeDurations } from "@/app/actions/AiService";

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
          create: extractedWords.SyllableWords.map((syllableWord: any) => ({
            word: syllableWord.Word,
            answer: syllableWord.Answer,
            options: syllableWord.Options,
          })),
        },
        groupedWords: {
          create: Object.entries(
            extractedWords.GroupedWords as Record<string, string[]>
          ).flatMap(([groupName, groupWords]) =>
            groupWords.map((word: string) => ({
              groupName,
              word,
            }))
          ),
        },
      },
    });

    // Generate AI time duration suggestions if user has grade and age info
    if (user.grade && user.age && user.grade.trim() && user.age.trim()) {
      try {
        console.log(`Generating AI time suggestions for list ${spellingList.id}`, {
          userId: user.id,
          grade: user.grade,
          age: user.age,
          wordCount: words.length
        });
        
        // Validate that we have proper words array
        if (!Array.isArray(words) || words.length === 0) {
          console.warn('No words available for AI suggestions');
        } else {
           await generateAndSaveTimeDurations(
            spellingList.id,
            user.grade,
            user.age,
            words // Use the original words array
          );
          
        }
      } catch (error) {
        console.error("Error generating AI suggestions:", error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        // Continue without AI suggestions - not a critical failure
      }
    } else {
      console.log("User grade/age not available or empty, skipping AI time suggestions", {
        hasGrade: !!user.grade,
        hasAge: !!user.age,
        grade: user.grade,
        age: user.age
      });
    }

    revalidatePath("/dashboard");
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
