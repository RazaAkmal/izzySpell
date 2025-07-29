'use server'
import OpenAI from "openai";
import { responseSchema } from "@/lib/defination";
import prisma from '@/lib/prisma';


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

export const getTimeDurationSuggestions = async (
  grade: string,
  age: string,
  spellingList: string[],
) => {
  try {
    const systemPrompt = `You are an expert in spelling education and U.S. spelling bee competitions. Based on the student's grade, age, and a provided spelling list, suggest three appropriate time durations (in seconds) PER WORD. Your suggestions should reflect the average pace of spelling in U.S. competitions, considering age-appropriate speed, word difficulty, and typical time constraints in spelling activities.

Instructions:
- Younger students (grades 1–3 or ages 6–9) typically need more time per word than older students.
- U.S. spelling bee competitions often allow 20–30 seconds per word in early rounds, though this can vary.
- Consider the difficulty and length of words in the provided list.
- Return only three durations in seconds PER WORD, labeled as:

Short pace: (fast and challenging)
Medium pace: (balanced for typical practice)
Generous pace: (slower and supportive)

Example output:
Short pace: 15 seconds
Medium pace: 25 seconds
Generous pace: 35 seconds`
      ;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Student Grade: ${grade}
Student Age: ${age}
Spelling List: ${spellingList.join(', ')}

Please provide three time duration suggestions for this spelling list.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = gptResponse.choices[0]?.message?.content;
    console.log('AI response:', response);
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the response to extract the durations
    const shortMatch = response.match(/Short pace:\s*(\d+)\s*seconds?/i);
    const mediumMatch = response.match(/Medium pace:\s*(\d+)\s*seconds?/i);
    const generousMatch = response.match(/Generous pace:\s*(\d+)\s*seconds?/i);

    if (!shortMatch || !mediumMatch || !generousMatch) {
      throw new Error("Could not parse time duration suggestions from AI response");
    }

    const suggestions = {
      shortPace: parseInt(shortMatch[1], 10),
      mediumPace: parseInt(mediumMatch[1], 10),
      generousPace: parseInt(generousMatch[1], 10),
    };

    return { success: true, data: suggestions };
  } catch (error) {
    console.error("AI Time Duration Suggestion Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error getting time duration suggestions"
    };
  }
};

export const saveTimeDurationsToList = async (
  listId: number,
  shortPace: number,
  mediumPace: number,
  generousPace: number
) => {
  try {
    console.log('saveTimeDurationsToList called with:', {
      listId,
      shortPace,
      mediumPace,
      generousPace
    });

    // First check if the list exists
    const existingList = await prisma.spellingList.findUnique({
      where: { id: listId },
      select: { id: true, listName: true }
    });

    if (!existingList) {
      throw new Error(`Spelling list with ID ${listId} not found`);
    }

    console.log('Updating spelling list:', existingList.listName);

    // Update the spelling list with Prisma ORM
    await prisma.spellingList.update({
      where: { id: listId },
      data: {
        shortPaceDuration: shortPace,
        mediumPaceDuration: mediumPace,
        generousPaceDuration: generousPace,
      }
    });

    return { success: true, message: "Time durations saved successfully" };
  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error saving time durations"
    };
  }
};

export const getTimeDurationsForList = async (listId: number) => {
  try {
    const list = await prisma.spellingList.findUnique({
      where: { id: listId },
      select: {
        shortPaceDuration: true,
        mediumPaceDuration: true,
        generousPaceDuration: true,
      }
    });

    if (!list) {
      throw new Error("Spelling list not found");
    }

    return { success: true, data: list };
  } catch (error) {
    console.error("Error getting time durations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error getting time durations"
    };
  }
};

export const generateAndSaveTimeDurations = async (
  listId: number,
  grade: string,
  age: string,
  spellingList: string[]
) => {
  try {
    console.log('generateAndSaveTimeDurations called with:', {
      listId,
      grade,
      age,
      spellingListLength: spellingList?.length,
      firstFewWords: spellingList?.slice(0, 3)
    });

    const suggestionsResult = await getTimeDurationSuggestions(grade, age, spellingList);

    if (!suggestionsResult.success || !suggestionsResult.data) {
      return {
        success: false,
        error: suggestionsResult.error || "Failed to get AI suggestions"
      };
    }

    const { shortPace, mediumPace, generousPace } = suggestionsResult.data;

    console.log('Saving suggestions to database:', {
      listId,
      shortPace,
      mediumPace,
      generousPace
    });

    // Save the suggestions to the database
    const saveResult = await saveTimeDurationsToList(listId, shortPace, mediumPace, generousPace);

    console.log('Save result:', {
      success: saveResult.success,
      error: saveResult.error
    });

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error || "Failed to save AI suggestions"
      };
    }

    return {
      success: true,
      data: {
        shortPace,
        mediumPace,
        generousPace
      },
      message: "Time durations saved successfully"
    };
  } catch (error) {
    console.error("Error generating and saving time durations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generating time durations"
    };
  }
};
