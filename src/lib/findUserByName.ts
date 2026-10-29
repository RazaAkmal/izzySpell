import prisma from "@/lib/prisma";
import { USERNAME_PATTERN } from "@/lib/authValidation";

// Server-only username lookup used by login and password reset.
//
// 1. Exact match on what was typed, then on the trimmed value (keeps accounts
//    created before names were trimmed working exactly as before).
// 2. Otherwise a case-insensitive match ("Raza" finds "raza"). If that matches
//    more than one account (legacy "Raza" and "raza"), it is treated as not found
//    rather than guessing which account was meant.
//
// The case-insensitive step only runs for letters/numbers-only input: Prisma may
// implement `mode: "insensitive"` with ILIKE on Postgres, where `%` and `_` are
// wildcards, and those characters must never be able to match other accounts.
export async function findUserByName(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const exact = await prisma.user.findUnique({ where: { name: input } });
  if (exact) return exact;
  if (trimmed !== input) {
    const exactTrimmed = await prisma.user.findUnique({ where: { name: trimmed } });
    if (exactTrimmed) return exactTrimmed;
  }

  if (!USERNAME_PATTERN.test(trimmed)) return null;

  const matches = await prisma.user.findMany({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    take: 2,
  });
  return matches.length === 1 ? matches[0] : null;
}

// True if any account already uses this name in any letter case. Sign-up names are
// validated to letters/numbers only before this is called.
export async function usernameTakenIgnoringCase(name: string) {
  const existing = await prisma.user.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  return existing !== null;
}
