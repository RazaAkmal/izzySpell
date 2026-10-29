// Pure session-invalidation rule (no I/O), shared by src/lib/sessionChecks.ts and tests.

// How long a "session is still valid" answer is reused before the database is asked again
// (default; can be set with SESSION_CHECK_INTERVAL_SECONDS, see resolveCheckIntervalSeconds)
export const SESSION_CHECK_INTERVAL_SECONDS = 60;
const MAX_CHECK_INTERVAL_SECONDS = 5 * 60;

// Interval from an env value: the default when missing, empty or not a whole number;
// otherwise that number clamped to 0..300 (0 = ask the database on every request)
export function resolveCheckIntervalSeconds(raw: string | undefined): number {
  const value = (raw ?? "").trim();
  if (!/^-?\d+$/.test(value)) return SESSION_CHECK_INTERVAL_SECONDS;
  return Math.min(MAX_CHECK_INTERVAL_SECONDS, Math.max(0, Number(value)));
}

/**
 * Should a session be ended?
 * @param sat               when the session signed in, epoch seconds (0 = unknown / legacy token)
 * @param passwordChangedAt the user's users.password_changed_at (null = never changed)
 * @param userExists        false when the user row no longer exists
 *
 * A session survives a password change only if it signed in AFTER the change.
 * Compared at whole-second precision (sat is stored in seconds), so a login in the
 * same second as the reset that preceded it is not ended by mistake.
 */
export function shouldInvalidate(sat: number, passwordChangedAt: Date | null, userExists: boolean): boolean {
  if (!userExists) return true;
  if (!passwordChangedAt) return false;
  const changedSec = Math.floor(passwordChangedAt.getTime() / 1000);
  if (!Number.isFinite(changedSec)) return false;
  return changedSec > sat;
}
