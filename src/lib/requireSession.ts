import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Wrapped in React `cache` so a page and the actions it calls share one ownership query
const isListOwner = cache(async (listId: number, userId: string) => {
  const list = await prisma.spellingList.findFirst({
    where: { id: listId, userId },
    select: { id: true },
  });
  return list !== null;
});

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
  if (!(await isListOwner(listId, userId))) throw new Error("Spelling list not found");
  return userId;
}

// For pages that take a listId: someone else's list looks exactly like a missing one
export async function requireListOwnerForPage(listId: number): Promise<void> {
  const userId = await getSessionUserId();
  // No session (e.g. ended after a password change): clear the cookie and go to sign-in
  if (!userId) redirect("/session-expired");
  if (isNaN(listId) || !(await isListOwner(listId, userId))) notFound();
}
