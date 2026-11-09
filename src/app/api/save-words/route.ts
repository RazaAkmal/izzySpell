import { NextResponse, after } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from "next/cache";
import { generateAndSaveTimeDurations } from "@/lib/timeDurations";
import { getSessionUserId } from "@/lib/requireSession";
import { MAX_WORDS_PER_LIST, MAX_WORDS_ERROR } from "@/lib/limits";
import { generateListExercises } from "@/app/actions/AiService";

// TODO: add per-user rate limiting to cap uploads per day.

export async function POST(req: Request) {
  try {
    // The owner is ALWAYS the signed-in user; a userId in the body is ignored
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { words, listName } = await req.json();

    if (
      !listName ||
      !Array.isArray(words) ||
      words.length === 0 ||
      !words.every((w: unknown) => typeof w === "string")
    ) {
      return NextResponse.json(
        { error: "Invalid input: 'listName' and a non-empty 'words' list are required." },
        { status: 400 }
      );
    }
    if (words.length > MAX_WORDS_PER_LIST) {
      return NextResponse.json({ error: MAX_WORDS_ERROR }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Only the list and its words: saving never depends on the AI. The syllable and group
    // exercises are generated in the background below.
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
      },
    });

    // Quiz timer suggestions are started WITHOUT await on purpose: the save response must
    // not wait for an extra AI call. They are a nice-to-have (QuizTimerModal can still
    // generate them on demand). On Vercel serverless the function may be stopped as soon
    // as the response is sent, so this can be cut off before it finishes - that is accepted.
    if (user.grade && user.age && user.grade.trim() && user.age.trim() && words.length > 0) {
      generateAndSaveTimeDurations(spellingList.id, user.grade, user.age, words).catch(
        (error) => {
          console.error("Error generating AI suggestions:", error);
        }
      );
    }

    // Runs after the response is sent, so the user does not wait for the AI. If it fails or
    // is cut off, the practice page prepares the exercises when the list is opened.
    after(() => generateListExercises(spellingList.id));

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
