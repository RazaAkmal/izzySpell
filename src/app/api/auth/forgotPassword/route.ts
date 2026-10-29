import prisma from "@/lib/prisma";
import { AUTH_MESSAGES, firstErrorMessage, forgotPasswordSchema } from "@/lib/authValidation";
import { findUserByName } from "@/lib/findUserByName";
import { getSiteUrl } from "@/lib/baseUrl";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MINUTES,
  RESET_TOKENS_PER_HOUR,
} from "@/lib/passwordResetToken";

// POST /api/auth/forgotPassword  { name }
//
// The response is IDENTICAL (status + body) whether the account exists, has an
// email, or is rate-limited, and every response takes at least MIN_RESPONSE_MS, so it
// can't be used to discover usernames or which accounts have an email on file.
//
// Timing: the route deliberately waits for the whole job (user lookup, token creation,
// email send) before responding, however long it takes. On Vercel the function can be
// stopped as soon as the response is sent, so work left running in the background
// could be cut off and the reset email silently lost. Every response is then padded
// to at least MIN_RESPONSE_MS (work is never cut short); the email request itself
// times out after 2.5 s (see src/lib/email.ts). Accepted residual risk: if the job
// takes longer than MIN_RESPONSE_MS, responses for accounts that get an email are
// slower than others - a small timing difference.

const FORGOT_PASSWORD_MESSAGE =
  "If that account has an email on file, we have sent a reset link. Check your inbox.";
const MIN_RESPONSE_MS = 3500;
const HOUR_MS = 60 * 60 * 1000;
const KEEP_OLD_TOKENS_MS = 24 * HOUR_MS;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  const startedAt = Date.now();
  const respond = async (status: number, body: Record<string, string>) => {
    const remaining = MIN_RESPONSE_MS - (Date.now() - startedAt);
    if (remaining > 0) await sleep(remaining);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return respond(400, { error: AUTH_MESSAGES.invalidRequest });
  }

  // Validation depends only on the submitted value, never on the account
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return respond(400, { error: firstErrorMessage(parsed.error) });
  }

  try {
    await createAndSendResetLink((body as { name: string }).name);
  } catch (error) {
    // Logged without names, emails or tokens; the response stays the same
    console.error("[forgotPassword] failed:", error instanceof Error ? error.message : "unknown error");
  }

  return respond(200, { message: FORGOT_PASSWORD_MESSAGE });
}

async function createAndSendResetLink(name: string) {
  const user = await findUserByName(name);
  if (!user || !user.parentEmail) return;

  // Build the link from configuration only (never from request headers)
  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    console.error("[forgotPassword] site URL not configured (SITE_URL / NEXT_PUBLIC_BASE_URL); no link sent");
    return;
  }

  const now = new Date();

  // Rate limit: at most RESET_TOKENS_PER_HOUR links per account per hour.
  // Earlier unused tokens are EXPIRED (not deleted) so they still count here.
  const recent = await prisma.passwordResetToken.count({
    where: { userId: user.id, createdAt: { gte: new Date(now.getTime() - HOUR_MS) } },
  });
  if (recent >= RESET_TOKENS_PER_HOUR) return;

  const token = generateResetToken();
  await prisma.$transaction([
    // Only the newest link works: expire this user's previous unused, unexpired tokens
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: now } },
      data: { expiresAt: now },
    }),
    // Housekeeping: rows older than a day are no longer needed for the rate limit
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, createdAt: { lt: new Date(now.getTime() - KEEP_OLD_TOKENS_MS) } },
    }),
    // Store ONLY the SHA-256 hash of the token
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
      },
    }),
  ]);

  // next 15.0.7 only has unstable_after (experimental flag), so the send is awaited;
  // sendPasswordResetEmail never throws and its result never changes the response.
  await sendPasswordResetEmail({
    to: user.parentEmail,
    username: user.name,
    resetLink: `${siteUrl}/reset-password?token=${encodeURIComponent(token)}`,
    expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
  });
}
