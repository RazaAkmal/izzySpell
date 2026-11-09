type ExtractedExercises = {
  SyllableWords: { Word: string; Answer: string; Options: string[] }[];
  GroupedWords: Record<string, string[]>;
};

// Database rows for a list's syllable and group exercises
export const toExerciseRows = (listId: number, extractedWords: ExtractedExercises) => ({
  syllableRows: extractedWords.SyllableWords.map((syllableWord) => ({
    listId,
    word: syllableWord.Word,
    answer: syllableWord.Answer,
    options: syllableWord.Options,
  })),
  groupRows: Object.entries(extractedWords.GroupedWords).flatMap(([groupName, groupWords]) =>
    groupWords.map((word) => ({ listId, groupName, word }))
  ),
});
