// Masks an email for display: first character of the local part + "***@" + domain,
// e.g. "mum.smith@example.com" -> "m***@example.com". Anything that does not look
// like an email becomes "***". The full address never needs to reach the browser.
export function maskEmail(email: unknown): string {
  if (typeof email !== "string") return "***";
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at <= 0 || at === value.length - 1) return "***";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const first = Array.from(local)[0]; // whole character, also for non-BMP symbols
  return `${first}***@${domain}`;
}
