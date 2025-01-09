'use server'
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const processFileWithAI = async (content: string) => {
  try {
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
    if (!extractedWords.OriginalWords) {
      return { success: false, error: "OriginalWords field is missing in the response." };
    }

    return { success: true, data: extractedWords };
  } catch (error) {
    console.log(error);
    return { success: false, error: `Error processing file with AI` };
  }
};
