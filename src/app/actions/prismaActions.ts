"use server";

import prisma from "@/lib/prisma";
import { getColorForProgress } from "../utils/colors";
import { SpellingList } from "@prisma/client";

export const deleteList = async (listId: number | string, userId: string) => {
  try {
    const numericListId = parseInt(listId as string, 10);
    if (isNaN(numericListId)) {
      console.error("Invalid list ID:", listId);
      return { success: false, message: "List ID must be a valid number" };
    }

    if (!userId || typeof userId !== "string") {
      console.error("Invalid user ID:", userId);
      return { success: false, message: "Invalid user ID" };
    }

    console.log("Deleting list with ID:", numericListId, "for user ID:", userId);

    // Fetch the list
    const list = await prisma.spellingList.findUnique({
      where: { id: numericListId },
    });

    if (!list) {
      console.error("List not found for ID:", numericListId);
      return { success: false, message: "List not found" };
    }

    if (list.userId !== userId) {
      console.error("Unauthorized delete attempt by user:", userId);
      return { success: false, message: "You are not authorized to delete this list" };
    }

    await prisma.spellingList.delete({
      where: { id: numericListId },
    });

    console.log("List deleted successfully with ID:", numericListId);
    return { success: true, message: "List deleted successfully" };

  } catch (error: any) {
    console.error("Error deleting list:", error.message || error);
    
    // Provide specific error messages based on the error type
    let userMessage = "Failed to delete the list. Please try again.";
    
    if (error.code === 'P2003') {
      userMessage = "Cannot delete list: There are still related records that need to be removed first.";
    } else if (error.code === 'P2025') {
      userMessage = "List not found or already deleted.";
    } else if (error.message?.includes('Foreign key constraint')) {
      userMessage = "Cannot delete list: Please contact support if this issue persists.";
    } else if (error.message?.includes('not found')) {
      userMessage = "List not found.";
    }
    
    return { 
      success: false, 
      message: userMessage,
      error: error.message // Include technical details for debugging
    };
  }
};


// Same data as GET /api/fetch-words (the list plus its words), read directly from
// the database instead of making an extra HTTP request to this app's own API.
export async function fetchWordsForList(userId: string, listId: number) {
  // The API returned nothing for a missing userId or an invalid list id
  if (!userId || isNaN(listId)) return undefined;
  try {
    const [list, words] = await Promise.all([
      prisma.spellingList.findUnique({ where: { id: listId } }),
      prisma.word.findMany({ where: { listId } }),
    ]);
    if (!list) return undefined;
    // JSON round-trip keeps the exact shape the API response had (e.g. dates as strings)
    return JSON.parse(JSON.stringify({ ...list, words }));
  } catch (error) {
    console.error("Error fetching spelling list and words:", error);
    return undefined;
  }
}

export async function getWordCountForEachExercise(listId: number) {
  const [total, studiedWordCount, studiedSyllableWord, studiedGroupCount, totalGroups] = await Promise.all([
    prisma.word.count({
      where: { listId },
    }),
    prisma.word.count({
    where: { listId, studied: true },
  }),
   prisma.syllableWord.count({
    where: { listId, studied: true },
  }),
  prisma.groupedWord.groupBy({
      by: ['groupName'],
      where: { 
        listId,
        studied: true
      },
      _count: {
        word: true
      }
    }),
    prisma.groupedWord.groupBy({
      by: ['groupName'],
      where: { 
        listId,
      },
      _count: {
        word: true
      }
    })
  ]);
  return { total, studiedWordCount, studiedSyllableWord, studiedGroupCount, totalGroups };
}

export async function getListById(listId: number) {
  const listName = await prisma.spellingList.findUnique({
    where: { id: listId },
    select: {
      listName: true,
    }
  });

  return listName;
}

export async function getWordsByListId(listId: number) {

  const [list, words, total, studiedWordCount] = await Promise.all([
    prisma.spellingList.findUnique({
      where: { id: listId },
      select: {
        listName: true
      }
    }),
    prisma.word.findMany({
      where: { listId },
      orderBy: { id: 'asc' },
    }),
    prisma.word.count({
      where: { listId },
    }),
    prisma.word.count({
    where: { listId, studied: true },
  }),
  ]);
  return { list, words, total, studiedWordCount };
}
export async function getSyllableWordsByListId(listId: number) {

  const [syllableWords, total, studiedWordCount] = await Promise.all([
    prisma.syllableWord.findMany({
      where: { listId },
      orderBy: { id: 'asc' },
    }),
    prisma.syllableWord.count({
      where: { listId },
    }),
     prisma.syllableWord.count({
    where: { listId, studied: true },
  }),
  ]);

  return { syllableWords, total, studiedWordCount};
}

export async function getGroupedWordsByListId(listId: number) {

  const [groupedWords, studiedGroups] = await Promise.all([
    prisma.groupedWord.findMany({
      where: { listId },
      orderBy: { id: 'asc' },
    }),
    prisma.groupedWord.groupBy({
      by: ['groupName'],
      where: { 
        listId,
        studied: true
      },
      _count: {
        word: true
      }
    })
  ]);

  // Filter out groups with only one word
  const validStudiedGroups = studiedGroups.filter(group => group._count.word > 1);
  const totalStudiedGroups = validStudiedGroups.length;

  return { 
    groupedWords, 
    totalStudiedGroups 
  };
}



export async function markWordsAsStudied(wordIds: number[]) {
  try {
    // Update only the words with the provided IDs, and get the listId from the
    // first word at the same time (independent queries, so run them together)
    const [, firstWord] = await Promise.all([
      prisma.word.updateMany({
        where: { id: { in: wordIds }, studied: false },
        data: { studied: true },
      }),
      prisma.word.findUnique({ where: { id: wordIds[0] } }),
    ]);
    const listId = firstWord?.listId;

    if (listId) {
      await updateListProgress(listId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking words as studied:", error);
    return { success: false, error: "Error marking words as studied" };
  }
}

export async function fetchSpellingLists(userId: string) {
  try {
    if (!userId) {
      throw new Error("Invalid input: 'userId' is required.");
    }

    // Fetch only the spelling list details for the user without associated words or groupedWords
    const spellingListsWithoutColor = await prisma.spellingList.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const spellingLists = spellingListsWithoutColor?.map((item: SpellingList) => ({
        ...item,
        color: getColorForProgress(item.progress),
      })) || []

    // Return the fetched spelling lists
    return spellingLists;
  } catch (error) {
    console.error("Error fetching spelling lists:", error);
    throw new Error("Internal server error. Please try again later.");
  }
}

export async function markSyllableWordsAsStudied(wordIds: number[], listId: number) {
  try {
    // Update only the syllable words with the provided IDs
    await prisma.syllableWord.updateMany({
      where: { id: { in: wordIds }, studied: false },
      data: { studied: true },
    });

    if (listId) {
      await updateListProgress(listId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking syllable words as studied:", error);
    return { success: false, error: "Error marking syllable words as studied" };
  }
}

export async function markGroupAsStudied(groupName: string, listId: number) {
  return markGroupsAsStudied([groupName], listId);
}

// Marks several groups at once with a single update and a single progress
// recalculation (instead of one full save per group).
export async function markGroupsAsStudied(groupNames: string[], listId: number) {
  try {
    await prisma.groupedWord.updateMany({
      where: {
        groupName: { in: groupNames },
        listId,
        studied: false
      },
      data: { studied: true },
    });

    await updateListProgress(listId);

    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("[markGroupsAsStudied] failed:", { groupNames, listId, message });
    return { success: false as const, error: message };
  }
}

// Helper function to update list progress
async function updateListProgress(listId: number) {
  // All counts in one parallel round (previously ~5 sequential steps that also
  // loaded every word just to count them). The formula below is unchanged.
  const [totalWords, studiedWords, totalSyllableWords, syllableWordsStudied, groupCounts] =
    await Promise.all([
      prisma.word.count({ where: { listId } }),
      prisma.word.count({ where: { listId, studied: true } }),
      prisma.syllableWord.count({ where: { listId } }),
      prisma.syllableWord.count({ where: { listId, studied: true } }),
      // One row per (group, studied) pair gives both total and studied counts per group
      prisma.groupedWord.groupBy({
        by: ['groupName', 'studied'],
        where: { listId },
        _count: { word: true },
      }),
    ]);

  // Calculate progress for regular words
  const regularProgress = totalWords > 0
    ? (studiedWords / totalWords) * 100
    : 0;

  // Calculate progress for syllable words
  const syllableProgress = totalSyllableWords > 0
    ? (syllableWordsStudied / totalSyllableWords) * 100
    : 0;

  // Calculate progress for grouped words
  const totalPerGroup = new Map<string, number>();
  const studiedPerGroup = new Map<string, number>();
  for (const row of groupCounts) {
    totalPerGroup.set(row.groupName, (totalPerGroup.get(row.groupName) ?? 0) + row._count.word);
    if (row.studied) studiedPerGroup.set(row.groupName, row._count.word);
  }
  // Filter out groups with only one word
  const totalGroups = [...totalPerGroup.values()].filter((count) => count > 1).length;
  const totalStudiedGroups = [...studiedPerGroup.values()].filter((count) => count > 1).length;
  const groupedProgress = totalGroups > 0
    ? (totalStudiedGroups / totalGroups) * 100
    : 0;

  // Count how many exercise types are present
  const activeTypes = [
    totalWords > 0,
    totalSyllableWords > 0,
    totalGroups > 0
  ].filter(Boolean).length;

  // Calculate average progress across only the active exercise types
  const totalProgress = Math.round(
    (regularProgress + syllableProgress + groupedProgress) / 
    (activeTypes || 1) // Prevent division by zero
  );

  // Update the list's progress
  await prisma.spellingList.update({
    where: { id: listId },
    data: { progress: totalProgress },
  });
}

export async function resetListProgress(listId: number, userId?: string) {
  try {
    // If userId is provided, check authorization
    if (userId) {
      const list = await prisma.spellingList.findUnique({
        where: { id: listId },
      });

      if (!list) {
        console.error("List not found for ID:", listId);
        return { success: false, message: "List not found" };
      }

      if (list.userId !== userId) {
        console.error("Unauthorized reset attempt by user:", userId);
        return { success: false, message: "You are not authorized to reset this list" };
      }
    }

    // Reset all regular words
    await prisma.word.updateMany({
      where: { listId },
      data: { studied: false },
    });

    // Reset all syllable words
    await prisma.syllableWord.updateMany({
      where: { listId },
      data: { studied: false },
    });

    // Reset all grouped words
    await prisma.groupedWord.updateMany({
      where: { listId },
      data: { studied: false },
    });

    // Reset the list progress to 0
    await prisma.spellingList.update({
      where: { id: listId },
      data: { progress: 0 },
    });

    return { success: true, message: "List progress has been reset successfully" };
  } catch (error: any) {
    console.error("Error resetting list progress:", error.message || error);
    return { success: false, message: "Error resetting list progress" };
  }
}

// Flash Cards functions
export const getFlashCardsByListId = async (listId: number) => {
  try {
    const flashCards = await prisma.flashCard.findMany({
      where: { listId },
      orderBy: { id: 'asc' }
    });

    return {
      success: true,
      data: flashCards
    };
  } catch (error: any) {
    console.error("Error fetching flash cards:", error.message || error);
    return {
      success: false,
      error: error.message || "Error fetching flash cards"
    };
  }
};

export const checkFlashCardsExist = async (listId: number) => {
  try {
    const count = await prisma.flashCard.count({
      where: { listId }
    });

    return {
      success: true,
      exists: count > 0,
      count
    };
  } catch (error: any) {
    console.error("Error checking flash cards:", error.message || error);
    return {
      success: false,
      exists: false,
      count: 0,
      error: error.message || "Error checking flash cards"
    };
  }
};

// Scramble Words functions
export const getScrambleWordsByListId = async (listId: number) => {
  try {
    const scrambleWords = await prisma.scrambleWord.findMany({
      where: { listId },
      orderBy: { id: 'asc' }
    });

    return {
      success: true,
      data: scrambleWords
    };
  } catch (error: any) {
    console.error("Error fetching scramble words:", error.message || error);
    return {
      success: false,
      error: error.message || "Error fetching scramble words"
    };
  }
};

export const checkScrambleWordsExist = async (listId: number) => {
  try {
    const count = await prisma.scrambleWord.count({
      where: { listId }
    });

    return {
      success: true,
      exists: count > 0,
      count
    };
  } catch (error: any) {
    console.error("Error checking scramble words:", error.message || error);
    return {
      success: false,
      exists: false,
      count: 0,
      error: error.message || "Error checking scramble words"
    };
  }
};
