import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { AUTH_MESSAGES, firstErrorMessage, resetPasswordSchema } from '@/lib/authValidation';
import { hashResetToken } from '@/lib/passwordResetToken';
import { forgetSessionChecks } from '@/lib/sessionChecks';

// POST /api/auth/resetPassword  { token, password, confirmPassword }  - and nothing else.
//
// The token comes from the emailed link. The old { name, password } body is rejected
// by the schema (.strict(), token required), so knowing a username is no longer
// enough to change a password.

const RESET_SUCCESS_MESSAGE = 'Your password has been reset. You can now log in with your new password.';

class InvalidTokenError extends Error {}

const invalidLink = () =>
  new Response(JSON.stringify({ error: AUTH_MESSAGES.resetLinkInvalid }), { status: 400 });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: AUTH_MESSAGES.invalidRequest }), { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: firstErrorMessage(parsed.error) }), { status: 400 });
  }
  const { token, password } = parsed.data;

  try {
    const stored = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
      select: { id: true, userId: true, usedAt: true, expiresAt: true },
    });
    // Unknown, already used and expired all get the same message
    if (!stored || stored.usedAt !== null || stored.expiresAt.getTime() <= Date.now()) {
      return invalidLink();
    }

    // Hash outside the transaction to keep it short
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const now = new Date();
      // Claim the token: only one of two simultaneous requests can match usedAt: null
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: stored.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) throw new InvalidTokenError();

      await tx.user.update({
        where: { id: stored.userId },
        // passwordChangedAt ends every session that signed in before now
        data: { password: hashedPassword, passwordChangedAt: now },
        select: { id: true },
      });
      // No other link for this user stays usable
      await tx.passwordResetToken.deleteMany({
        where: { userId: stored.userId, id: { not: stored.id } },
      });
    });

    // Make the change take effect immediately for sessions checked on this instance
    forgetSessionChecks(stored.userId);

    return new Response(JSON.stringify({ message: RESET_SUCCESS_MESSAGE }), { status: 200 });
  } catch (error) {
    if (error instanceof InvalidTokenError) return invalidLink();
    console.error('Error resetting password:', error instanceof Error ? error.message : 'unknown error');
    return new Response(JSON.stringify({ error: 'Failed to reset password' }), { status: 500 });
  }
}
