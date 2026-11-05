// Validation and repair of AI-generated flash cards. Pure functions (no database, no
// network), kept out of the "use server" AiService file so they are not exposed as actions.

export interface ValidFlashCard {
  originalWord: string;
  options: string[];
  correctIndex: number;
  definition: string;
  exampleSentence: string;
}

const DEFAULT_DEFINITION = "Spell this word correctly.";
const VOWELS = "aeiou";

// Removes a leading ```json / ``` fence and a trailing ``` fence, if present
export const stripCodeFences = (response: string): string =>
  response
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

const norm = (value: string) => value.trim().toLowerCase();

// Believable misspellings of a word, most natural first. Never includes the word itself.
const misspellingCandidates = (word: string): string[] => {
  const letters = word.split("");
  const candidates: string[] = [];

  // Swap two adjacent letters
  for (let i = 0; i < letters.length - 1; i++) {
    if (letters[i] === letters[i + 1]) continue;
    const swapped = [...letters];
    [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
    candidates.push(swapped.join(""));
  }
  // Double the last letter, repeat the first letter at the end
  if (letters.length > 0) {
    candidates.push(word + letters[letters.length - 1]);
    candidates.push(word + letters[0]);
  }
  // Change a vowel
  for (let i = 0; i < letters.length; i++) {
    if (!VOWELS.includes(letters[i].toLowerCase())) continue;
    const replacement = VOWELS.split("").find((v) => v !== letters[i].toLowerCase());
    if (replacement) {
      const changed = [...letters];
      changed[i] = replacement;
      candidates.push(changed.join(""));
    }
  }
  // Double any letter, drop any letter
  for (let i = 0; i < letters.length; i++) {
    candidates.push(word.slice(0, i + 1) + word.slice(i));
    if (letters.length > 1) candidates.push(word.slice(0, i) + word.slice(i + 1));
  }
  return candidates;
};

// A misspelling of `word` that is not already in `used` (lowercase). Always returns one.
const pickMisspelling = (word: string, used: Set<string>): string => {
  for (const candidate of misspellingCandidates(word)) {
    if (candidate && !used.has(norm(candidate))) return candidate;
  }
  // Last resort (very short words): add a letter until it is unique
  for (const extra of "abcdefghijklmnopqrstuvwxyz") {
    const candidate = word + extra;
    if (!used.has(norm(candidate))) return candidate;
  }
  return word + "xx";
};

// Makes one card valid: the word is among the options, correctIndex points at it, and
// the 4 options are non-empty and distinct (case-insensitive).
const repairCard = (word: string, card: Record<string, any>): ValidFlashCard => {
  const rawOptions: any[] = Array.isArray(card.options) ? card.options : [];
  const options: string[] = [0, 1, 2, 3].map((i) =>
    typeof rawOptions[i] === "string" ? rawOptions[i].trim() : ""
  );

  const matchesWord = (option: string) => norm(option) === norm(word);
  const rawIndex = card.correctIndex;
  let correctIndex: number;
  if (Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex <= 3 && matchesWord(options[rawIndex])) {
    correctIndex = rawIndex;
  } else if (options.some(matchesWord)) {
    correctIndex = options.findIndex(matchesWord);
  } else {
    // The correct spelling is missing: put it first, pushing out one wrong option
    correctIndex = 0;
  }
  options[correctIndex] = word;

  // Empty or repeated options (never the correct one) become misspellings
  const used = new Set<string>([norm(word)]);
  for (let i = 0; i < 4; i++) {
    if (i === correctIndex) continue;
    if (!options[i] || used.has(norm(options[i]))) {
      options[i] = pickMisspelling(word, used);
    }
    used.add(norm(options[i]));
  }

  return {
    originalWord: word,
    options,
    correctIndex,
    definition:
      typeof card.definition === "string" && card.definition.trim()
        ? card.definition
        : DEFAULT_DEFINITION,
    exampleSentence: typeof card.exampleSentence === "string" ? card.exampleSentence : "",
  };
};

// Card built without AI: the word plus simple misspellings, correct answer first
const fallbackCard = (word: string): ValidFlashCard =>
  repairCard(word, {
    options: [word, ...misspellingCandidates(word).slice(0, 3)],
    correctIndex: 0,
    definition: DEFAULT_DEFINITION,
    exampleSentence: "",
  });

// Takes the parsed AI array (snake_case fields as the prompt asks, camelCase also
// accepted) and returns exactly one valid card for every word in `words`, in that order.
// Cards for words that were not requested, and repeated cards, are dropped.
export const validateFlashCards = (rawCards: unknown, words: string[]): ValidFlashCard[] => {
  const cardsByWord = new Map<string, Record<string, any>>();
  if (Array.isArray(rawCards)) {
    for (const raw of rawCards) {
      if (!raw || typeof raw !== "object") continue;
      const wordField = (raw as any).original_word ?? (raw as any).originalWord;
      if (typeof wordField !== "string" || !wordField.trim()) continue;
      const key = norm(wordField);
      if (cardsByWord.has(key)) continue;
      cardsByWord.set(key, {
        options: (raw as any).options,
        correctIndex: (raw as any).correct_index ?? (raw as any).correctIndex,
        definition: (raw as any).definition,
        exampleSentence: (raw as any).example_sentence ?? (raw as any).exampleSentence,
      });
    }
  }

  const result: ValidFlashCard[] = [];
  const seen = new Set<string>();
  for (const rawWord of words) {
    const word = typeof rawWord === "string" ? rawWord.trim() : "";
    if (!word || seen.has(norm(word))) continue;
    seen.add(norm(word));

    const card = cardsByWord.get(norm(word));
    result.push(card ? repairCard(word, card) : fallbackCard(word));
  }
  return result;
};
