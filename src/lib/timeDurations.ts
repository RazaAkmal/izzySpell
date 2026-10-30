import OpenAI from "openai";
import prisma from "@/lib/prisma";

// Quiz timer suggestions (AI). Plain server module on purpose: these functions are NOT
// server actions, so the browser cannot call them. Callers (save-words route and
// generateAiSuggestionsForList) check the signed-in user and list ownership first.

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const getTimeDurationSuggestions = async (
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

const saveTimeDurationsToList = async (
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
