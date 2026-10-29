import prisma from "@/lib/prisma";
import { resolveCheckIntervalSeconds, shouldInvalidate } from "@/lib/sessionPolicy";

// Server-only: decides whether a signed-in session must end because the user's
// password changed after it signed in (or the user no longer exists).
//
// Why an in-memory cache and not only a "checkedAt" claim in the token: in
// next-auth 5.0.0-beta.25, auth() called from pages, route handlers and server
// actions returns the session JSON and DISCARDS the refreshed Set-Cookie, so a
// claim updated there is never saved. Instead the last result is remembered per
// server instance, for CHECK_INTERVAL_SECONDS (env SESSION_CHECK_INTERVAL_SECONDS,
// default 60 s, clamped to 0..300).
// A password reset drops that user's cached results (forgetSessionChecks) only on the
// instance that handled the reset. Other instances (Vercel can run each route
// separately) keep their cached "valid" answer until it expires, so they notice the
// change within the interval: a stolen session can survive a password reset for up
// to that interval (60 s by default).

type CheckResult = { revoked: boolean; checkedAtMs: number };

const CHECK_INTERVAL_SECONDS = resolveCheckIntervalSeconds(process.env.SESSION_CHECK_INTERVAL_SECONDS);
const ERROR_RETRY_MS = 60_000; // after a failed DB read, keep the session and retry after 1 minute
const MAX_ENTRIES = 5_000;
const cache = new Map<string, CheckResult>();
// A page and its layout call auth() at the same time: share one in-flight read
const inFlight = new Map<string, Promise<boolean>>();

const keyFor = (userId: string, sat: number) => `${userId}:${sat}`;

export async function isSessionRevoked(userId: string, sat: number): Promise<boolean> {
  const key = keyFor(userId, sat);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.checkedAtMs < CHECK_INTERVAL_SECONDS * 1000) {
    return cached.revoked;
  }

  const pending = inFlight.get(key);
  if (pending) return pending;
  const check = readAndRemember(userId, sat, key, now).finally(() => inFlight.delete(key));
  inFlight.set(key, check);
  return check;
}

async function readAndRemember(userId: string, sat: number, key: string, now: number): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordChangedAt: true },
    });
    const revoked = shouldInvalidate(sat, user?.passwordChangedAt ?? null, user !== null);
    remember(key, { revoked, checkedAtMs: now });
    return revoked;
  } catch (error) {
    // Fail open: a database hiccup must not log everyone out. No ids/tokens in the log.
    console.error("[session-check] database read failed, keeping session:", error instanceof Error ? error.message : "unknown error");
    remember(key, { revoked: false, checkedAtMs: now - CHECK_INTERVAL_SECONDS * 1000 + ERROR_RETRY_MS });
    return false;
  }
}

// Drop cached results for this user (call after their password changes)
export function forgetSessionChecks(userId: string) {
  const prefix = `${userId}:`;
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
  for (const key of inFlight.keys()) if (key.startsWith(prefix)) inFlight.delete(key);
}

function remember(key: string, result: CheckResult) {
  if (cache.size >= MAX_ENTRIES) cache.clear(); // simple bound; worst case one extra read per session
  cache.set(key, result);
}
