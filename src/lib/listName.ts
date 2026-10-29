import { cache } from "react";
import prisma from "@/lib/prisma";

// Server-side list name lookup, passed to ListNameProvider so the "List name"
// badge doesn't need a separate request from the browser after the page loads.
export const getListName = cache(async (listId: number) => {
  try {
    const list = await prisma.spellingList.findUnique({
      where: { id: listId },
      select: { listName: true },
    });
    return list?.listName;
  } catch {
    return undefined; // ListNameProvider falls back to fetching it itself
  }
});
