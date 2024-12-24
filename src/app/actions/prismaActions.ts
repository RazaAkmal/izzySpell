"use server";

import prisma from "@/lib/prisma";

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

    // Delete related words first
    await prisma.word.deleteMany({
      where: { listId: numericListId },
    });

    // Now delete the list
    await prisma.spellingList.delete({
      where: { id: numericListId },
    });

    console.log("List deleted successfully with ID:", numericListId);
    return { success: true, message: "List deleted successfully" };

  } catch (error: any) {
    console.error("Error deleting list:", error.message || error);
    return { success: false, message: "Error deleting list" };
  }
};


export async function fetchWordsForList(userId: string, listId: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(
    `${baseUrl}/api/fetch-words?userId=${userId}&&spellingListId=${listId}`,
    {
      cache: "no-store",
    }
  );
  const { spellingListWithWords } = await response.json(); 
  return spellingListWithWords;
}

export async function getWordsByListId(listId: number, page = 1, pageSize = 5) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const [words, total] = await Promise.all([
    prisma.word.findMany({
      where: { listId },
      skip,
      take,
      orderBy: { id: 'asc' },
    }),
    prisma.word.count({
      where: { listId },
    }),
  ]);

  return { words, total, page, pageSize };
}

export async function markWordsAsStudied(wordIds: number[]) {
  try {
    // Update only the words with the provided IDs
    await prisma.word.updateMany({
      where: { id: { in: wordIds }, studied: false }, // Update only unstudied words with matching IDs
      data: { studied: true },
    });

    // Calculate progress for the parent SpellingList
    const listId = (
      await prisma.word.findUnique({ where: { id: wordIds[0] } })
    )?.listId;

    if (listId) {
      const totalWords = await prisma.word.count({ where: { listId } });
      const studiedWords = await prisma.word.count({
        where: { listId, studied: true },
      });

      const progress = Math.round((studiedWords / totalWords) * 100);

      await prisma.spellingList.update({
        where: { id: listId },
        data: { progress },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking words as studied:", error);
    return { success: false, error: "Error marking words as studied" };
  }
}

