import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// The signed-in user's id, or null. auth() also ends sessions that were revoked by a
// password change (see the jwt callback in src/auth.ts), so this is the one place
// routes and server actions should take the user from: never from the request body.
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// For server actions: throws when nobody is signed in
export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

// For server actions that take a listId: signed in AND the list belongs to the user
export async function requireListOwner(listId: number): Promise<string> {
  const userId = await requireSessionUserId();
  const list = await prisma.spellingList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  if (!list) throw new Error("Spelling list not found");
  return userId;
}
