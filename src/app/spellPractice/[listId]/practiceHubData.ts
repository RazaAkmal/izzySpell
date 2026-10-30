import { cache } from "react";
import prisma from "@/lib/prisma";
import { getRecentQuizAttempts } from "@/app/actions/getRecentQuizAttempts";

// All data the practice hub needs, loaded in a single parallel round of queries.
// Wrapped in React `cache` so the page can start it early (see preload below)
// and SpellPractice reuses the same in-flight request.
export const getPracticeHubData = cache(async (listId: number) => {
  const [words, totalSyllableWords, studiedSyllableWord, groupCounts, quizData, flashCardCount, scrambleWordCount] = await Promise.all([
    prisma.word.findMany({
      where: { listId },
      orderBy: { id: "asc" },
      select: { word: true, studied: true },
    }),
    prisma.syllableWord.count({ where: { listId } }),
    prisma.syllableWord.count({
      where: { listId, studied: true },
    }),
    // One row per (group, studied) pair gives both total and studied counts per group
    prisma.groupedWord.groupBy({
      by: ["groupName", "studied"],
      where: { listId },
      _count: { word: true },
    }),
    getRecentQuizAttempts(listId).catch(() => ({ attempts: [], uniqueMistakesCount: 0 })),
    // Whether Flash Cards / Scramble Words were already generated for this list.
    // null on failure lets the client fall back to checking for itself.
    prisma.flashCard.count({ where: { listId } }).catch(() => null),
    prisma.scrambleWord.count({ where: { listId } }).catch(() => null),
  ]);

  const totalPerGroup = new Map<string, number>();
  const studiedPerGroup = new Map<string, number>();
  for (const row of groupCounts) {
    totalPerGroup.set(row.groupName, (totalPerGroup.get(row.groupName) ?? 0) + row._count.word);
    if (row.studied) studiedPerGroup.set(row.groupName, row._count.word);
  }
  // Groups with a single word are ignored, as in Word Groups mode
  const totalGroupsCount = [...totalPerGroup.values()].filter((count) => count > 1).length;
  const totalStudiedGroups = [...studiedPerGroup.values()].filter((count) => count > 1).length;

  return {
    total: words.length,
    studiedWordCount: words.filter((w) => w.studied).length,
    totalSyllableWords,
    studiedSyllableWord,
    totalGroupsCount,
    totalStudiedGroups,
    wordStrings: words.map((w) => w.word),
    quizData,
    flashCardsExist: flashCardCount === null ? null : flashCardCount > 0,
    scrambleWordsExist: scrambleWordCount === null ? null : scrambleWordCount > 0,
  };
});

// Start loading early (before the surrounding layout finishes its own queries)
// so both run in parallel instead of one after the other.
export const preloadPracticeHubData = (listId: number) => {
  getPracticeHubData(listId).catch(() => {
    // Errors are surfaced where the data is awaited (SpellPractice)
  });
};
