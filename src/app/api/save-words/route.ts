import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Import your Prisma client instance
import { revalidatePath } from 'next/cache'
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    // Parse the request body to extract the userId and file content
    const { userId, content, listName } = await req.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: "Invalid input: 'userId' and 'content' are required." },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Call OpenAI to process the content
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "./systemprompt.txt",
        },
        {
          role: "user",
          content: `I have a spelling list that I need structured into a JSON format. Please perform the following tasks:
                    Extract all the words from the list and exclude any subtitles, phrases, or non-word elements.
                    Organize the output into the following JSON structure:

                    ListName: The name of the spelling list (e.g., "Level 2 - Master Spelling List").
                    OriginalWords: A flat list of all valid words extracted from the list.
                    SyllabusWords: The same words as in "OriginalWords," but with syllables separated by hyphens (e.g., "syllabus" → "syl-la-bus"). If dictionary-based syllable splitting is unavailable, use heuristic methods to approximate the syllables.
                    GroupedWords: Group the words logically based on spelling patterns (e.g., words with common suffixes like "-ing," "-ed," or blends like "ch," "sh," or vowel sounds). Create groups as "Group 1," "Group 2," etc.
                    SightWords: Include only explicitly labeled sight words from the list. If no sight words are found, this field should be empty.
                    Ensure that the final JSON is well-structured, with meaningful grouping and accurate syllable separation.

                    Here is the spelling list: ${content}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    });

    const extractedWords = JSON.parse(gptResponse.choices[0]?.message?.content || "{}");

    if (!extractedWords.OriginalWords || !extractedWords.ListName) {
      return NextResponse.json({ error: "Invalid AI response." }, { status: 500 });
    }

    // Create the SpellingList and associated entries
    const spellingList = await prisma.spellingList.create({
      data: {
        listName,
        userId,
        words: {
          create: extractedWords.OriginalWords.map((word: string) => ({
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
