'use server'
import OpenAI from "openai";
import { responseSchema } from "@/lib/defination";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const processFileWithAI = async (content: any) => {
  try {
    // Read the system prompt from the file
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/prompts/systempromt.txt`);
    const systemPrompt = await res.text();


    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt, // Use the content from the file
        },
        {
          role: "user",
          content: `Analyze this spelling list and return a JSON object with EXACTLY this structure (no additional fields):
{
  "ListName": "<name of list>",
  "OriginalWords": [<array of valid English words>],
  "SyllableWords": [
    {
      "Word": "<original word>",
      "Options": ["<correct division>", "<incorrect 1>", "<incorrect 2>", "<incorrect 3>"],
      "Answer": "<correct division>"
    }
  ],
  "GroupedWords": {
    "Group 1": [<related words>],
    "Group 2": [<related words>]
  },
  "SightWords": [<sight words or empty array>]
}

Spelling List: ${content}

Requirements:
1. Follow the exact JSON structure above
2. Each SyllableWords entry must have exactly 4 options
3. The correct syllable division must be both in Options[0] and Answer
4. GroupedWords must group similar spelling patterns
5. Return valid JSON that can be parsed`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3, // Reduced temperature for more consistent output
    });

    const response = gptResponse.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const extractedWords = JSON.parse(response);
    
    // Validate the response against our schema
    const validatedData = responseSchema.parse(extractedWords);

    // Additional validation to ensure Options[0] matches Answer
    const isValid = validatedData.SyllableWords.every(
      word => word.Options[0] === word.Answer
    );

    if (!isValid) {
      throw new Error("Syllable options validation failed");
    }

    return { success: true, data: validatedData };
  } catch (error) {
    console.error("AI Processing Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error processing file with AI"
    };
  }
};
