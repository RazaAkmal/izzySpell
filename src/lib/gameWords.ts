import prisma from "@/lib/prisma";

export interface ListWordRef {
  id: number;
  word: string;
}

// id + text of each word in a list. Flash card / scramble rows only store the word text
// (no foreign key to Word), so the games use this to find the matching word ids.
export const getListWordRefs = async (listId: number): Promise<ListWordRef[]> => {
  try {
    return await prisma.word.findMany({
      where: { listId },
      orderBy: { id: "asc" },
      select: { id: true, word: true },
    });
  } catch (error) {
    console.error("Error fetching list words:", error);
    return []; // the game still plays; it just cannot record completion
  }
};

// Ids of the list words that match the given game words (case-insensitive, trimmed)
export const matchWordIds = (gameWords: string[], listWords: ListWordRef[]): number[] => {
  const idsByText = new Map<string, number>();
  for (const w of listWords) {
    const key = w.word.trim().toLowerCase();
    if (!idsByText.has(key)) idsByText.set(key, w.id);
  }
  const ids = new Set<number>();
  for (const text of gameWords) {
    const id = idsByText.get(String(text).trim().toLowerCase());
    if (id !== undefined) ids.add(id);
  }
  return [...ids];
};

// Words of a list for Word Builder, with a definition and example sentence when flash
// cards have been generated for the list (the Meaning hint uses them)
export const getWordBuilderSources = async (listId: number) => {
  try {
    const [words, flashCards] = await Promise.all([
      prisma.word.findMany({
        where: { listId },
        orderBy: { id: "asc" },
        select: { id: true, word: true },
      }),
      prisma.flashCard.findMany({
        where: { listId },
        select: { originalWord: true, definition: true, exampleSentence: true },
      }),
    ]);
    const details = new Map(flashCards.map((card) => [card.originalWord.trim().toLowerCase(), card]));
    return words
      .filter((w) => w.word.trim().length > 0)
      .map((w) => {
        const card = details.get(w.word.trim().toLowerCase());
        return {
          id: w.id,
          word: w.word,
          definition: card?.definition,
          exampleSentence: card?.exampleSentence,
        };
      });
  } catch (error) {
    console.error("Error fetching Word Builder words:", error);
    return [];
  }
};
