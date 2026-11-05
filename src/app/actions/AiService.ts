'use server'
import OpenAI from "openai";
import { z } from "zod";
import { responseSchema } from "@/lib/defination";
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/baseUrl';
import { OPENAI_MODEL } from '@/lib/openaiModel';
import { requireSessionUserId, requireListOwner, getSessionUserId } from '@/lib/requireSession';
import { MAX_RAW_TOKENS, MAX_WORDS_PER_LIST, MAX_WORDS_ERROR } from '@/lib/limits';
import { stripCodeFences, validateFlashCards } from '@/lib/flashCards';
import { repairScrambleOptions } from '@/lib/scrambleWords';
import { revalidatePath } from 'next/cache';
import { GENERATION_CHUNK_SIZE, chunkArray, uniqueWords } from '@/lib/chunks';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Part 1: Cheap, fast extraction — filters raw tokens to valid English words
// and suggests a list name. Uses gpt-4o-mini to minimise cost.
// Called immediately after file read, before showing the modal.
export const extractWordsFromContent = async (rawWords: string[]) => {
  await requireSessionUserId();
  if (rawWords.length > MAX_RAW_TOKENS) {
    return {
      success: false,
      error: "This file has too much text. Please upload a shorter word list.",
    };
  }
  try {
    const content = rawWords.join(" ");

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a spelling list assistant for a children's educational app. Return only valid JSON, no markdown or extra text.",
        },
        {
          role: "user",
          content: `From the raw tokens below, extract only valid English words. Remove numbers, symbols, punctuation, duplicates, non-English text, and single-character tokens. Suggest a short descriptive list name based on the words.

Return ONLY this JSON structure:
{
  "ListName": "<short descriptive name>",
  "OriginalWords": ["word1", "word2", ...]
}

Raw tokens: ${content}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const response = gptResponse.choices[0]?.message?.content;
    if (!response) throw new Error("No response from OpenAI");

    // Strip markdown code fences if present
    const cleaned = response.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(cleaned);

    if (!Array.isArray(data.OriginalWords) || !data.ListName) {
      throw new Error("Invalid response structure from AI");
    }

    return { success: true, data: { ListName: data.ListName as string, OriginalWords: data.OriginalWords as string[] } };
  } catch (error) {
    console.error("Word extraction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error extracting words",
    };
  }
};

// Part 2: Full processing — generates SyllableWords, GroupedWords, SightWords.
// Only called after the user reviews and clicks "Save & Start Learning".
const WORDS_PER_AI_CHUNK = 30;

type ProcessedList = z.infer<typeof responseSchema>;

// One AI call for a small group of words (validated with responseSchema)
const processWordChunk = async (content: string) => {
  try {
    // Read the system prompt from the file
    const res = await fetch(`${await getBaseUrl()}/prompts/systempromt.txt`);
    const systemPrompt = await res.text();


    const gptResponse = await openai.chat.completions.create({
      model: OPENAI_MODEL,
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
      max_tokens: 4096,
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

// Combines the validated results of several chunks into the same shape as a single result
const mergeProcessedChunks = (chunks: ProcessedList[]): ProcessedList => {
  const GroupedWords: Record<string, string[]> = {};
  for (const chunk of chunks) {
    for (const [groupName, groupWords] of Object.entries(chunk.GroupedWords)) {
      // Every chunk names its groups "Group 1", "Group 2"...: those groups are
      // unrelated across chunks, so a clashing name gets the next free number
      let name = groupName;
      let next = Object.keys(GroupedWords).length + 1;
      while (name in GroupedWords) name = `Group ${next++}`;
      GroupedWords[name] = groupWords;
    }
  }
  return {
    ListName: chunks[0].ListName,
    OriginalWords: chunks.flatMap((c) => c.OriginalWords),
    SyllableWords: chunks.flatMap((c) => c.SyllableWords),
    GroupedWords,
    SightWords: Array.from(new Set(chunks.flatMap((c) => c.SightWords))),
  };
};

// Part 2 entry point. Lists longer than WORDS_PER_AI_CHUNK are split into chunks so
// the AI answer is never cut off; each chunk is validated, then the results are merged.
// Accepts the words as an array (preferred) or as a comma separated string.
export const processFileWithAI = async (content: string | string[]) => {
  await requireSessionUserId();
  const words = Array.isArray(content)
    ? content
    : content.split(",").map((w) => w.trim()).filter(Boolean);

  if (words.length > MAX_WORDS_PER_LIST) {
    return { success: false as const, error: MAX_WORDS_ERROR };
  }

  if (words.length <= WORDS_PER_AI_CHUNK) {
    return processWordChunk(words.join(", "));
  }

  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_AI_CHUNK) {
    chunks.push(words.slice(i, i + WORDS_PER_AI_CHUNK).join(", "));
  }

  const results = await Promise.all(chunks.map(processWordChunk));
  const failed = results.find((r) => !r.success);
  if (failed) {
    return { success: false as const, error: failed.error };
  }

  const validChunks = results.map((r) => (r as { success: true; data: ProcessedList }).data);
  return { success: true as const, data: mergeProcessedChunks(validChunks) };
};

export const getTimeDurationsForList = async (listId: number) => {
  try {
    // Page loader: report "not signed in" / "not your list" as a failed result
    // (the callers already handle that) instead of crashing the page
    const userId = await getSessionUserId();
    if (!userId) throw new Error("Not authenticated");
    const list = await prisma.spellingList.findFirst({
      where: { id: listId, userId },
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

const generateFlashCards = async (words: string[]) => {
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
      model: OPENAI_MODEL,
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

    // Clean and validate the content before parsing (the model sometimes wraps JSON in ``` fences)
    const cleanedContent = stripCodeFences(content);
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

// Generates flash cards in chunks (one AI call per chunk, run together) and validates each
// chunk against its own words. A chunk that fails is logged and skipped, so the other
// chunks still produce cards; only a total failure is an error.
const generateFlashCardsInChunks = async (words: string[]) => {
  const chunks = chunkArray(uniqueWords(words), GENERATION_CHUNK_SIZE);
  const outcomes = await Promise.all(
    chunks.map(async (chunk, i) => {
      console.log(`Generating flash cards chunk ${i + 1}/${chunks.length}`);
      const result = await generateFlashCards(chunk);
      if (!result.success) {
        console.error(`Flash cards chunk ${i + 1}/${chunks.length} failed:`, result.error);
        return null;
      }
      try {
        return validateFlashCards(result.data, chunk);
      } catch (error) {
        console.error(`Flash cards chunk ${i + 1}/${chunks.length} could not be validated:`, error);
        return null;
      }
    })
  );

  const cards = outcomes.flatMap((cardsForChunk) => cardsForChunk ?? []);
  const failedChunks = outcomes.filter((cardsForChunk) => cardsForChunk === null).length;
  if (cards.length === 0) {
    return { success: false as const, error: "Could not generate flash cards. Please try again." };
  }
  return { success: true as const, data: cards, failedChunks };
};

export const generateAndSaveFlashCards = async (listId: number, words: string[]) => {
  await requireListOwner(listId);
  if (words.length > MAX_WORDS_PER_LIST) return { success: false, error: MAX_WORDS_ERROR };
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

    // Generate flash cards using AI, a chunk of words at a time
    const generationResult = await generateFlashCardsInChunks(words);
    
    if (!generationResult.success) {
      throw new Error(generationResult.error);
    }

    // Each chunk was already repaired by validateFlashCards (correct spelling among 4
    // distinct options, correctIndex pointing at it, a card for every word in the chunk)
    const flashCardsData = generationResult.data;

    if (flashCardsData.length === 0) {
      throw new Error('No flash cards data generated');
    }

    // Save flash cards to database
    const savedFlashCards = await prisma.flashCard.createMany({
      data: flashCardsData.map((card) => ({
        listId,
        originalWord: card.originalWord,
        options: card.options,
        correctIndex: card.correctIndex,
        definition: card.definition,
        exampleSentence: card.exampleSentence
      }))
    });

    // Fetch the saved flash cards to return them
    const flashCards = await prisma.flashCard.findMany({
      where: { listId }
    });

    revalidatePath(`/spellPractice/${listId}/FlashCards`);

    return {
      success: true,
      data: flashCards,
      message:
        `Generated and saved ${savedFlashCards.count} flash cards` +
        (generationResult.failedChunks > 0
          ? ` (${generationResult.failedChunks} group(s) of words could not be generated; use Regenerate to retry)`
          : "")
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

const generateScrambleWords = async (words: string[]) => {
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
      model: OPENAI_MODEL,
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

    // Server-side repair: every question ends with exactly one real anagram of the word
    // (a true scramble, not the word itself) and three distinct non-anagrams. Entries
    // without a usable word are dropped.
    const validatedData = scrambleWordsData
      .filter((wordData: any) => typeof wordData?.original_word === "string" && wordData.original_word.trim())
      .map((wordData: any) => ({
        ...wordData,
        original_word: wordData.original_word.trim(),
        scrambled_options: repairScrambleOptions(wordData.original_word, wordData.scrambled_options),
      }));

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

// Same chunking for scramble words: generateScrambleWords already repairs each chunk.
const generateScrambleWordsInChunks = async (words: string[]) => {
  const chunks = chunkArray(uniqueWords(words), GENERATION_CHUNK_SIZE);
  const outcomes = await Promise.all(
    chunks.map(async (chunk, i) => {
      console.log(`Generating scramble words chunk ${i + 1}/${chunks.length}`);
      const result = await generateScrambleWords(chunk);
      if (!result.success || !result.data) {
        console.error(`Scramble words chunk ${i + 1}/${chunks.length} failed:`, result.error);
        return null;
      }
      return result.data as any[];
    })
  );

  const questions = outcomes.flatMap((questionsForChunk) => questionsForChunk ?? []);
  const failedChunks = outcomes.filter((questionsForChunk) => questionsForChunk === null).length;
  if (questions.length === 0) {
    return { success: false as const, error: "Could not generate scramble words. Please try again." };
  }
  return { success: true as const, data: questions, failedChunks };
};

export const generateAndSaveScrambleWords = async (listId: number, words: string[]) => {
  await requireListOwner(listId);
  if (words.length > MAX_WORDS_PER_LIST) return { success: false, error: MAX_WORDS_ERROR };
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
    
    // Generate scramble words using AI, a chunk of words at a time
    const generationResult = await generateScrambleWordsInChunks(words);
    
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

    revalidatePath(`/spellPractice/${listId}/ScrambleWords`);

    return {
      success: true,
      data: scrambleWords,
      message:
        `Generated and saved ${savedScrambleWords.count} scramble words` +
        (generationResult.failedChunks > 0
          ? ` (${generationResult.failedChunks} group(s) of words could not be generated; use Regenerate to retry)`
          : "")
    };

  } catch (error) {
    console.error("Error generating and saving scramble words:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error generating scramble words"
    };
  }
};

// Replaces the list's scramble words with freshly generated ones. The words come from the
// database (not from the caller). New content is generated BEFORE anything is deleted, and
// the swap is one transaction, so a failed generation leaves the existing words untouched.
export const regenerateScrambleWords = async (listId: number) => {
  try {
    await requireListOwner(listId);
    const words = (await prisma.word.findMany({ where: { listId }, orderBy: { id: 'asc' }, select: { word: true } }))
      .map((w) => w.word);
    if (words.length === 0) throw new Error("This list has no words");
    if (words.length > MAX_WORDS_PER_LIST) return { success: false, error: MAX_WORDS_ERROR };

    const generationResult = await generateScrambleWordsInChunks(words);
    if (!generationResult.success) {
      throw new Error(generationResult.error);
    }

    const scrambleWordsData = generationResult.data;
    if (!scrambleWordsData || scrambleWordsData.length === 0) {
      throw new Error('No scramble words data generated');
    }

    await prisma.$transaction([
      prisma.scrambleWord.deleteMany({ where: { listId } }),
      prisma.scrambleWord.createMany({
        data: scrambleWordsData.map((word: any) => ({
          listId,
          originalWord: word.original_word,
          scrambledOptions: word.scrambled_options
        }))
      }),
    ]);

    revalidatePath(`/spellPractice/${listId}/ScrambleWords`);
    return { success: true };
  } catch (error) {
    console.error("Error regenerating scramble words:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error regenerating scramble words"
    };
  }
};

// Replaces the list's flash cards with freshly generated ones (same safety as above:
// generate and validate first, then delete + insert in one transaction).
export const regenerateFlashCards = async (listId: number) => {
  try {
    await requireListOwner(listId);
    const words = (await prisma.word.findMany({ where: { listId }, orderBy: { id: 'asc' }, select: { word: true } }))
      .map((w) => w.word);
    if (words.length === 0) throw new Error("This list has no words");
    if (words.length > MAX_WORDS_PER_LIST) return { success: false, error: MAX_WORDS_ERROR };

    const generationResult = await generateFlashCardsInChunks(words);
    if (!generationResult.success) {
      throw new Error(generationResult.error);
    }

    const flashCardsData = generationResult.data;
    if (flashCardsData.length === 0) {
      throw new Error('No flash cards data generated');
    }

    await prisma.$transaction([
      prisma.flashCard.deleteMany({ where: { listId } }),
      prisma.flashCard.createMany({
        data: flashCardsData.map((card) => ({
          listId,
          originalWord: card.originalWord,
          options: card.options,
          correctIndex: card.correctIndex,
          definition: card.definition,
          exampleSentence: card.exampleSentence
        }))
      }),
    ]);

    revalidatePath(`/spellPractice/${listId}/FlashCards`);
    return { success: true };
  } catch (error) {
    console.error("Error regenerating flash cards:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error regenerating flash cards"
    };
  }
};
