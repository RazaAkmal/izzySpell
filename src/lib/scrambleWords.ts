// Repair of AI-generated scramble questions. Pure functions (no database, no network),
// kept out of the "use server" AiService file so they are not exposed as actions.
//
// The game finds the correct option on the client by comparing sorted letters and takes
// the FIRST match, so after repair every question must have exactly one option that is an
// anagram of the word (and, when the word can be scrambled, that option must differ from
// the word itself), plus three distinct non-anagrams.

type Rng = () => number;

const sortedLetters = (value: string) => value.toLowerCase().split("").sort().join("");

const isAnagram = (option: string, word: string) =>
  option.length > 0 && sortedLetters(option) === sortedLetters(word);

// A word can be scrambled into something different only if it has two different letters
const canBeScrambled = (word: string) => new Set(word.toLowerCase().split("")).size > 1;

// Fisher-Yates
const shuffleLetters = (letters: string[], rng: Rng): string[] => {
  const arr = [...letters];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// A real scramble of the word: reshuffled (up to 10 attempts) until it differs from the
// word. Words that cannot differ (e.g. "aaa") return the word itself.
export const makeScramble = (word: string, rng: Rng = Math.random): string => {
  if (!canBeScrambled(word)) return word;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = shuffleLetters(word.split(""), rng).join("");
    if (candidate.toLowerCase() !== word.toLowerCase()) return candidate;
  }
  // Ten unlucky shuffles: rotate by one instead (differs whenever the word has 2+ distinct letters)
  for (let shift = 1; shift < word.length; shift++) {
    const rotated = word.slice(shift) + word.slice(0, shift);
    if (rotated.toLowerCase() !== word.toLowerCase()) return rotated;
  }
  return word;
};

// Letters that look or sound like each other, tried first for believable wrong options
const SIMILAR: Record<string, string> = {
  a: "e", e: "a", o: "u", u: "o", b: "p", p: "b", m: "n", n: "m",
  c: "g", g: "c", v: "w", w: "v", i: "l", l: "i",
};

// A scrambled option that is NOT an anagram of the word: one letter changed to a letter
// the word does not contain (when possible), then shuffled. Never in `used` (lowercase).
export const makeNonAnagram = (word: string, used: Set<string>, rng: Rng = Math.random): string => {
  const lower = word.toLowerCase();
  const absent = "abcdefghijklmnopqrstuvwxyz".split("").filter((l) => !lower.includes(l));
  const positions = shuffleLetters(word.split("").map((_, i) => String(i)), rng).map(Number);

  for (const pos of positions) {
    const original = word[pos];
    const similar = SIMILAR[original.toLowerCase()];
    const replacements = [
      ...(similar && !lower.includes(similar) ? [similar] : []),
      ...shuffleLetters(absent, rng),
      // Last resort when the word already uses every letter: any other letter
      ...shuffleLetters("abcdefghijklmnopqrstuvwxyz".split(""), rng),
    ];
    for (const letter of replacements) {
      if (letter === original.toLowerCase()) continue;
      const changed = word.split("");
      changed[pos] = original === original.toUpperCase() && original !== original.toLowerCase()
        ? letter.toUpperCase()
        : letter;
      for (let attempt = 0; attempt < 3; attempt++) {
        const candidate = shuffleLetters(changed, rng).join("");
        if (!isAnagram(candidate, word) && !used.has(candidate.toLowerCase())) return candidate;
      }
    }
  }
  // Cannot happen for real words; keep the invariant (non-anagram, unique) anyway
  for (const extra of "abcdefghijklmnopqrstuvwxyz") {
    const candidate = shuffleLetters((word + extra).split(""), rng).join("");
    if (!isAnagram(candidate, word) && !used.has(candidate.toLowerCase())) return candidate;
  }
  return word + "xyz";
};

// Returns exactly 4 distinct options: exactly one anagram of `word` (not equal to the
// word itself when the word can be scrambled) and three non-anagrams.
export const repairScrambleOptions = (
  wordInput: string,
  rawOptions: unknown,
  rng: Rng = Math.random
): string[] => {
  const word = wordInput.trim();
  const given: unknown[] = Array.isArray(rawOptions) ? rawOptions : [];
  const options: string[] = [0, 1, 2, 3].map((i) =>
    typeof given[i] === "string" ? (given[i] as string).trim() : ""
  );

  const anagramIndices = options
    .map((option, index) => (isAnagram(option, word) ? index : -1))
    .filter((index) => index >= 0);

  // Which slot holds the one correct answer
  const scrambleable = canBeScrambled(word);
  let keepIndex = anagramIndices.find(
    (index) => !scrambleable || options[index].toLowerCase() !== word.toLowerCase()
  );
  if (keepIndex === undefined) {
    // No usable anagram: either none, or the only ones equal the word itself.
    // Reuse the slot of such an anagram (so it stops being a second one), else slot 0.
    keepIndex = anagramIndices.length > 0 ? anagramIndices[0] : 0;
    options[keepIndex] = makeScramble(word, rng);
  }

  // Every other anagram becomes a non-anagram; empty, repeated and wrong-length options too
  const used = new Set<string>([options[keepIndex].toLowerCase()]);
  for (let i = 0; i < 4; i++) {
    if (i === keepIndex) continue;
    const option = options[i];
    // Wrong-length options are replaced too: decoys must have the same number of letters
    if (!option || option.length !== word.length || isAnagram(option, word) || used.has(option.toLowerCase())) {
      options[i] = makeNonAnagram(word, used, rng);
    }
    used.add(options[i].toLowerCase());
  }
  return options;
};
