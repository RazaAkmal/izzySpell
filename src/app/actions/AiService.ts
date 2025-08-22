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

export const generateFlashCards = async (words: string[]) => {
  try {
    const systemPrompt = `You are a tool for a children's spelling practice app called IzzySpell.

Your task is to generate multiple-choice spelling challenges from a given list of words. For each word, provide:

1. The original word.
2. A list of 4 spelling options:
   - Exactly one must be the correct spelling (the original word).
   - The other three must be common misspellings or believable errors a child might make. These can include:
     - Missing letters
     - Extra letters
     - Phonetic errors
     - Letter swaps
     - Incorrect but similar-looking spellings
   - All 4 options must be different from each other and appear in **random order**.
3. The index (0–3) of the correct option.
4. A **simple definition** of the word, suitable for children aged 6–10.
5. A short **example sentence** using the word in context. Keep it age-appropriate and easy to understand.

Output Format:
A JSON array where each item follows this schema:

{
  "original_word": "string",
  "options": ["string", "string", "string", "string"],
  "correct_index": number (0 to 3),
  "definition": "string",
  "example_sentence": "string"
}`;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Generate flash cards for these words: ${JSON.stringify(words)}`
        }
      ],
      temperature: 0.7,
    });

    const content = gptResponse.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Clean and validate the content before parsing
    const cleanedContent = content.trim();
    if (!cleanedContent) {
      throw new Error("Empty response from OpenAI");
    }

    let flashCardsData;
    try {
      flashCardsData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Content received:", cleanedContent);
      throw new Error("Invalid JSON response from AI");
    }
    
    if (!Array.isArray(flashCardsData)) {
      throw new Error("Response is not an array");
    }

    if (flashCardsData.length === 0) {
      throw new Error("No flash cards generated");
    }

    return {
      success: true,
      data: flashCardsData
    };

  } catch (error) {
    console.error("Error generating flash cards:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generating flash cards"
    };
  }
};

export const generateAndSaveFlashCards = async (listId: number, words: string[]) => {
  try {
    // Check if flash cards already exist for this list
    const existingFlashCards = await prisma.flashCard.findMany({
      where: { listId }
    });

    if (existingFlashCards.length > 0) {
      return {
        success: true,
        data: existingFlashCards,
        message: "Flash cards already exist for this list"
      };
    }

    // Generate flash cards using AI
    const generationResult = await generateFlashCards(words);
    
    if (!generationResult.success) {
      throw new Error(generationResult.error);
    }

    const flashCardsData = generationResult.data;

    if (!flashCardsData || flashCardsData.length === 0) {
      throw new Error('No flash cards data generated');
    }

    // Save flash cards to database
    const savedFlashCards = await prisma.flashCard.createMany({
      data: flashCardsData.map((card: any) => ({
        listId,
        originalWord: card.original_word,
        options: card.options,
        correctIndex: card.correct_index,
        definition: card.definition,
        exampleSentence: card.example_sentence
      }))
    });

    // Fetch the saved flash cards to return them
    const flashCards = await prisma.flashCard.findMany({
      where: { listId }
    });

    return {
      success: true,
      data: flashCards,
      message: `Generated and saved ${savedFlashCards.count} flash cards`
    };

  } catch (error) {
    console.error("Error generating and saving flash cards:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generating flash cards"
    };
  }
};

// Scramble Words Generation Functions

export const generateScrambleWords = async (words: string[]) => {
  try {
    const systemPrompt = `You are a tool for a children's spelling practice web application. Your task is to generate scrambled word challenges for each word in a given spelling list.

CRITICAL REQUIREMENT: For each word, create exactly 4 options where ONLY ONE is a valid anagram of the original word.

For each word in the input list:
- Generate four scrambled options with EXACTLY the same number of letters as the original word.
- Exactly ONE must be a valid anagram: a correct rearrangement of all the original letters with no additions, omissions, or substitutions.
- The remaining THREE must be INVALID anagrams: they must use the SAME NUMBER of letters but with 1-2 letter substitutions that make them NOT valid anagrams.

ANAGRAM VALIDATION RULE:
- Before finalizing your response, sort the letters of each option alphabetically
- Sort the letters of the original word alphabetically  
- ONLY ONE option should have the exact same sorted letters as the original word
- The other three options must have different sorted letters (proving they are not anagrams)

INCORRECT OPTION CREATION STRATEGY:
1. Start with the original word's letters
2. Replace 1-2 letters with similar letters (visually or phonetically similar)
3. Scramble the result to look like a potential anagram
4. VERIFY it's not actually an anagram by comparing sorted letters

LETTER SUBSTITUTION EXAMPLES:
- A ↔ E, O ↔ U, B ↔ P, M ↔ N, C ↔ G, V ↔ W, I ↔ L
- For "WARM": correct anagram might be "MRAW", incorrect options could be "MRAW" → "NRAW", "PARM", "WARB"

STEP-BY-STEP VALIDATION PROCESS:
1. Create the 4 options
2. For each option, sort its letters: option.split('').sort().join('')
3. Sort the original word's letters: original.split('').sort().join('')
4. Count how many options match the sorted original - MUST BE EXACTLY 1
5. If more than 1 matches, replace the extras with different letter substitutions

Return your result as a JSON array. Each item in the array must include the original word and its four scrambled options.

IMPORTANT: Return ONLY the JSON array. Do not include any explanatory text, validation examples, or additional commentary before or after the JSON.

Output Schema:
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "original_word": {
        "type": "string",
        "description": "The original word from the spelling list."
      },
      "scrambled_options": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "minItems": 4,
        "maxItems": 4,
        "description": "Four scrambled versions: ONE correct anagram and THREE incorrect with letter substitutions, in random order."
      }
    },
    "required": ["original_word", "scrambled_options"]
  }
}

Example Output for "warm":
[
  {
    "original_word": "warm",
    "scrambled_options": ["rmaw", "parm", "warb", "narm"]
  }
]

Remember: Only "rmaw" is a valid anagram of "warm" (both sort to "armw"). The others have letter substitutions.

FINAL VALIDATION CHECKLIST:
1. Each word has exactly 4 scrambled options
2. All options have the same number of letters as the original word  
3. CRITICAL: When you sort the letters of each option, only ONE should match the sorted original word
4. Three options are incorrect with believable letter substitutions
5. Options are in random order
6. Keep scrambled words age-appropriate for children

Remember: Return ONLY JSON array format. No additional text or explanations.`;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Generate scrambled word challenges for these words: ${JSON.stringify(words)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = gptResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Clean and validate the content before parsing
    const cleanedContent = content.trim();
    if (!cleanedContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Extract JSON part only (remove any extra text after JSON)
    let jsonContent = cleanedContent;
    
    // Find the end of the JSON array
    const jsonStart = cleanedContent.indexOf('[');
    if (jsonStart === -1) {
      throw new Error("No JSON array found in AI response");
    }
    
    // Find the matching closing bracket
    let bracketCount = 0;
    let jsonEnd = jsonStart;
    
    for (let i = jsonStart; i < cleanedContent.length; i++) {
      if (cleanedContent[i] === '[') bracketCount++;
      if (cleanedContent[i] === ']') bracketCount--;
      if (bracketCount === 0) {
        jsonEnd = i;
        break;
      }
    }
    
    // Extract only the JSON part
    jsonContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
    
    console.log("Extracted JSON content:", jsonContent);

    let scrambleWordsData;
    try {
      scrambleWordsData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Original content received:", cleanedContent);
      console.error("Extracted JSON content:", jsonContent);
      throw new Error("Invalid JSON response from AI");
    }
    
    if (!Array.isArray(scrambleWordsData)) {
      throw new Error("Response is not an array");
    }

    if (scrambleWordsData.length === 0) {
      throw new Error("No scramble words generated");
    }

    // Server-side validation to ensure only one correct anagram per word
    const validatedData = scrambleWordsData.map((wordData: any) => {
      const originalSorted = wordData.original_word.split('').sort().join('').toLowerCase();
      
      // Find all correct anagrams
      const correctIndices = wordData.scrambled_options
        .map((option: string, index: number) => ({
          index,
          option,
          sorted: option.split('').sort().join('').toLowerCase(),
          isCorrect: option.split('').sort().join('').toLowerCase() === originalSorted
        }))
        .filter((item: any) => item.isCorrect);

      if (correctIndices.length === 0) {
        console.warn(`No correct anagram found for "${wordData.original_word}". Adding one.`);
        // Replace first option with a correct anagram
        const letters = wordData.original_word.split('');
        const shuffled = [...letters].sort(() => Math.random() - 0.5).join('');
        wordData.scrambled_options[0] = shuffled;
      } else if (correctIndices.length > 1) {
        console.warn(`Multiple anagrams detected for "${wordData.original_word}":`, correctIndices.map((item: any) => item.option));
        
        // Keep only the first correct anagram, replace others with letter substitutions
        for (let i = 1; i < correctIndices.length; i++) {
          const indexToReplace = correctIndices[i].index;
          const originalWord = wordData.original_word.toLowerCase();
          
          // Create a new incorrect option with letter substitution
          const letters = originalWord.split('');
          // Replace 1-2 letters with similar ones
          if (letters.includes('a')) letters[letters.indexOf('a')] = 'e';
          else if (letters.includes('e')) letters[letters.indexOf('e')] = 'a';
          else if (letters.includes('o')) letters[letters.indexOf('o')] = 'u';
          else if (letters.includes('m')) letters[letters.indexOf('m')] = 'n';
          else if (letters.includes('w')) letters[letters.indexOf('w')] = 'v';
          else letters[0] = letters[0] === 'z' ? 'a' : String.fromCharCode(letters[0].charCodeAt(0) + 1);
          
          // Scramble the modified letters
          const incorrectOption = [...letters].sort(() => Math.random() - 0.5).join('').toUpperCase();
          wordData.scrambled_options[indexToReplace] = incorrectOption;
        }
      }

      return wordData;
    });

    return {
      success: true,
      data: validatedData
    };

  } catch (error) {
    console.error("Error generating scramble words:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generating scramble words"
    };
  }
};

export const generateAndSaveScrambleWords = async (listId: number, words: string[]) => {
  try {
    // Check if scramble words already exist for this list
    const existingScrambleWords = await prisma.scrambleWord.findMany({
      where: { listId }
    });

    if (existingScrambleWords.length > 0) {
      return {
        success: true,
        data: existingScrambleWords,
        message: "Scramble words already exist for this list"
      };
    }

    console.log(`Generating scramble words for list ${listId} with ${words.length} words`);
    
    // Generate scramble words using AI
    const generationResult = await generateScrambleWords(words);
    
    if (!generationResult.success) {
      throw new Error(generationResult.error);
    }

    const scrambleWordsData = generationResult.data;

    if (!scrambleWordsData || scrambleWordsData.length === 0) {
      throw new Error('No scramble words data generated');
    }

    // Save scramble words to database
    const savedScrambleWords = await prisma.scrambleWord.createMany({
      data: scrambleWordsData.map((word: any) => ({
        listId,
        originalWord: word.original_word,
        scrambledOptions: word.scrambled_options
      }))
    });

    // Fetch the saved scramble words to return them
    const scrambleWords = await prisma.scrambleWord.findMany({
      where: { listId }
    });

    return {
      success: true,
      data: scrambleWords,
      message: `Generated and saved ${savedScrambleWords.count} scramble words`
    };

  } catch (error) {
    console.error("Error generating and saving scramble words:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generating scramble words"
    };
  }
};

export const regenerateScrambleWords = async (listId: number, words: string[]) => {
  try {
    console.log(`Regenerating scramble words for list ${listId} with ${words.length} words`);
    
    // Delete existing scramble words for this list
    await prisma.scrambleWord.deleteMany({
      where: { listId }
    });

    // Generate new scramble words using AI with improved prompt
    const generationResult = await generateScrambleWords(words);
    
    if (!generationResult.success) {
      throw new Error(generationResult.error);
    }

    const scrambleWordsData = generationResult.data;

    if (!scrambleWordsData || scrambleWordsData.length === 0) {
      throw new Error('No scramble words data generated');
    }

    // Save new scramble words to database
    const savedScrambleWords = await prisma.scrambleWord.createMany({
      data: scrambleWordsData.map((word: any) => ({
        listId,
        originalWord: word.original_word,
        scrambledOptions: word.scrambled_options
      }))
    });

    // Fetch the saved scramble words to return them
    const scrambleWords = await prisma.scrambleWord.findMany({
      where: { listId }
    });

    return {
      success: true,
      data: scrambleWords,
      message: `Regenerated and saved ${savedScrambleWords.count} scramble words with improved quality`
    };

  } catch (error) {
    console.error("Error regenerating scramble words:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error regenerating scramble words"
    };
  }
};
