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