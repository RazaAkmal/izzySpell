'use server'
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const processFileWithAI = async (content: any) => {
  try {
    // Read the system prompt from the file
    const systemPrompt = fs.readFileSync(
      path.join(process.cwd(), "src/app/actions/systempromt.txt"),
      "utf-8"
    );

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt, // Use the content from the file
        },
        {
          role: "user",
          content: `I have the below spelling list that I need structured into a JSON format.

SpellingList: ${content}

Please perform the following tasks:

1. Extract only valid English words from the list. Exclude any random strings, abbreviations, or meaningless characters (e.g., "TT", "oN", "Fo", "fF").
2. Organize the output into the following JSON structure:
   - ListName: The name of the spelling list.
   - OriginalWords: A flat list of all valid words extracted from the list.
   - SyllabusWords: A list of objects, where each object represents a single word. Each object has three properties:
     - Word: The original word.
     - Options: A list of four possible syllable divisions for the word, including one correct division and three incorrect options.
     - Answer: The correct syllable division for the word.
   - GroupedWords: Group the words logically based on spelling patterns (e.g., words with common suffixes like "-ing," "-ed," or blends like "ch," "sh," or vowel sounds). Create groups as "Group 1," "Group 2," etc.
   - SightWords: A list of words that are considered "sight words" (words that should be recognized immediately by sight). If no sight words are found in the list, this will be an empty list.

**Important Notes:**
- For "SyllabusWords", generate three plausible incorrect syllable divisions along with the correct one.
- Group "GroupedWords" logically based on spelling patterns (e.g., suffixes, blends, vowel sounds).
- If no sight words are found, the "SightWords" field should be an empty array (e.g., "SightWords": []).`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.5,
    });
    const extractedWords = JSON.parse(gptResponse.choices[0]?.message?.content || "{}");
    if (!extractedWords.OriginalWords) {
      return { success: false, error: "OriginalWords field is missing in the response." };
    }

    return { success: true, data: extractedWords };
  } catch (error) {
    console.log(error);
    return { success: false, error: `Error processing file with AI` };
  }
};
