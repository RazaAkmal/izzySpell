// Transactional email through Resend's REST API (fetch, no SDK).
// Env: RESEND_API_KEY, EMAIL_FROM (e.g. "IzzySpell <no-reply@yourdomain.com>").
//
// Never throws: callers must not change their response based on email delivery.
// Never logs the reset link or token in production.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
// Shorter than the forgot-password work cap (3000 ms) so a slow provider is cut off
// before the request stops waiting
const SEND_TIMEOUT_MS = 2_500;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type ResetEmail = {
  to: string;
  username: string;
  resetLink: string;
  expiresInMinutes: number;
};

export function buildPasswordResetEmail({ username, resetLink, expiresInMinutes }: Omit<ResetEmail, "to">) {
  const subject = `Reset the IzzySpell password for ${username}`;
  const text = [
    "Hello,",
    "",
    `Someone asked to reset the IzzySpell password for your child's account "${username}".`,
    "",
    "To choose a new password, open this link:",
    resetLink,
    "",
    `The link works once and expires in ${expiresInMinutes} minutes.`,
    "",
    "If you did not ask for this, you can safely ignore this email - the password will not change.",
    "",
    "The IzzySpell team",
  ].join("\n");

  const safeUser = escapeHtml(username);
  const safeLink = escapeHtml(resetLink);
  const html = `<!doctype html>
<html><body style="font-family: Arial, sans-serif; color: #426096; line-height: 1.5;">
  <p>Hello,</p>
  <p>Someone asked to reset the IzzySpell password for your child's account <strong>${safeUser}</strong>.</p>
  <p><a href="${safeLink}" style="display:inline-block;background:#4793FE;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold;">Choose a new password</a></p>
  <p style="font-size: 13px;">Or copy this link into your browser:<br><span style="word-break: break-all;">${safeLink}</span></p>
  <p>The link works once and expires in ${expiresInMinutes} minutes.</p>
  <p>If you did not ask for this, you can safely ignore this email &ndash; the password will not change.</p>
  <p>The IzzySpell team</p>
</body></html>`;

  return { subject, text, html };
}

// Returns true if the email was accepted by Resend. Never throws.
export async function sendPasswordResetEmail(email: ResetEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      // Local development only: show the link so the flow can be tested without email
      console.log(`[email:dev] RESEND_API_KEY/EMAIL_FROM not set. Password reset link for "${email.username}": ${email.resetLink}`);
    } else {
      console.error("[email] email not configured (RESEND_API_KEY / EMAIL_FROM missing)");
    }
    return false;
  }

  const { subject, text, html } = buildPasswordResetEmail(email);
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email.to], subject, text, html }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (!response.ok) {
      // Status only: the response body could echo request details
      console.error(`[email] Resend rejected the password reset email (HTTP ${response.status})`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] sending the password reset email failed:", error instanceof Error ? error.name : "unknown error");
    return false;
  }
}
