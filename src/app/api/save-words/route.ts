import { NextResponse, after } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from "next/cache";
import { generateAndSaveTimeDurations } from "@/lib/timeDurations";
import { getSessionUserId } from "@/lib/requireSession";
import { MAX_WORDS_PER_LIST, MAX_WORDS_ERROR } from "@/lib/limits";
import { generateListExercises } from "@/app/actions/AiService";

// TODO: add per-user rate limiting to cap uploads per day.

async function suggestQuizTimes(userId: string, listId: number, words: string[]) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { grade: true, age: true },
    });
    if (user?.grade?.trim() && user.age?.trim()) {
      await generateAndSaveTimeDurations(listId, user.grade, user.age, words);
    }
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
  }
}

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

    // Only the list and its words: saving never depends on the AI. Each database call is a
    // network round trip, so the words go in as ONE insert (createMany) rather than one each.
    const spellingList = await prisma.spellingList.create({
      data: {
        listName,
        userId,
        words: {
          createMany: {
            data: words.map((word: string) => ({ word, type: "original" })),
          },
        },
      },
    });

    // Runs after the response is sent, so the user does not wait for the AI. If the exercises
    // fail or are cut off, the practice page prepares them when the list is opened. The quiz
    // timer suggestions are a nice-to-have (QuizTimerModal can generate them on demand), and
    // the user's grade and age they need are read here too, keeping that read off the save.
    after(() =>
      Promise.all([
        generateListExercises(spellingList.id),
        suggestQuizTimes(userId, spellingList.id, words),
      ])
    );

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
