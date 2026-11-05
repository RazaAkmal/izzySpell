// The AI data is usable only if it has the exact shape produced by processFileWithAI
// (see responseSchema in lib/defination.ts). Used by save-words and update-words so
// both routes accept exactly the same thing.
export const isValidExtractedWords = (extractedWords: any): boolean =>
  !!extractedWords &&
  Array.isArray(extractedWords.OriginalWords) &&
  Array.isArray(extractedWords.SyllableWords) &&
  extractedWords.SyllableWords.every(
    (s: any) =>
      s &&
      typeof s.Word === "string" &&
      typeof s.Answer === "string" &&
      Array.isArray(s.Options)
  ) &&
  !!extractedWords.GroupedWords &&
  typeof extractedWords.GroupedWords === "object" &&
  Object.values(extractedWords.GroupedWords).every(
    (group) => Array.isArray(group) && group.every((w) => typeof w === "string")
  );
