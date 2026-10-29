// Pure unit tests for Batch C (no database, no network).
// Run: node --test tests/authBatchC.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  AUTH_MESSAGES,
  emailSchema,
  acceptedTermsSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetTokenSchema,
  firstErrorMessage,
  normalizeEmail,
} from "../src/lib/authValidation.ts";
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MINUTES, RESET_TOKENS_PER_HOUR } from "../src/lib/passwordResetToken.ts";
import { shouldInvalidate, SESSION_CHECK_INTERVAL_SECONDS, resolveCheckIntervalSeconds } from "../src/lib/sessionPolicy.ts";
import { CONSENT_VERSION } from "../src/lib/consent.ts";
import { buildPasswordResetEmail } from "../src/lib/email.ts";

const SIGNUP = {
  name: "raza1",
  parentEmail: "parent@example.com",
  confirmParentEmail: "parent@example.com",
  password: "Password1",
  confirmPassword: "Password1",
  acceptedTerms: true,
};
const msg = (schema, value) => {
  const r = schema.safeParse(value);
  return r.success ? null : firstErrorMessage(r.error);
};
const fieldMsg = (schema, value) => {
  const r = schema.safeParse(value);
  return r.success ? null : r.error.issues[0].message;
};

// ---------- email ----------
test("email: trimmed + lower-cased", () => {
  assert.equal(emailSchema.parse("  Mum.Smith+kid@Example.CO.UK "), "mum.smith+kid@example.co.uk");
});
test("email: required / invalid / too long", () => {
  assert.equal(fieldMsg(emailSchema, ""), AUTH_MESSAGES.parentEmailRequired);
  assert.equal(fieldMsg(emailSchema, "   "), AUTH_MESSAGES.parentEmailRequired);
  assert.equal(fieldMsg(emailSchema, undefined), AUTH_MESSAGES.parentEmailRequired);
  for (const bad of ["parent", "parent@", "@example.com", "par ent@example.com", "parent@example", "a@b@c.com"]) {
    assert.equal(fieldMsg(emailSchema, bad), AUTH_MESSAGES.parentEmailInvalid, bad);
  }
  const local = "a".repeat(64);
  const long = `${local}@${"b".repeat(186)}.com`; // 255 characters (one over the limit)
  assert.equal(long.length, 255);
  assert.equal(fieldMsg(emailSchema, long), AUTH_MESSAGES.parentEmailInvalid);
  const atLimit = `${local}@${"b".repeat(185)}.com`; // exactly 254 characters
  assert.equal(atLimit.length, 254);
  assert.equal(emailSchema.safeParse(atLimit).success, true);
});
test("normalizeEmail matches emailSchema's normalisation", () => {
  assert.equal(normalizeEmail("  A@B.Com "), "a@b.com");
  assert.equal(normalizeEmail(undefined), "");
});

// ---------- consent ----------
test("acceptedTerms must be literally true", () => {
  assert.equal(acceptedTermsSchema.safeParse(true).success, true);
  for (const bad of [false, "true", 1, "on", null, undefined]) {
    assert.equal(fieldMsg(acceptedTermsSchema, bad), AUTH_MESSAGES.termsRequired, String(bad));
  }
});
test("CONSENT_VERSION is the agreed date string", () => {
  assert.equal(CONSENT_VERSION, "2026-10-29");
});

// ---------- sign-up ----------
test("signup: email confirmation compares case/space-insensitively", () => {
  assert.equal(signupSchema.safeParse({ ...SIGNUP, parentEmail: "Parent@Example.com", confirmParentEmail: " parent@EXAMPLE.com " }).success, true);
});
test("signup: email mismatch, missing confirm, missing/false terms are rejected", () => {
  assert.equal(msg(signupSchema, { ...SIGNUP, confirmParentEmail: "other@example.com" }), AUTH_MESSAGES.parentEmailsDoNotMatch);
  const { confirmParentEmail: _c, ...noConfirm } = SIGNUP;
  assert.equal(msg(signupSchema, noConfirm), AUTH_MESSAGES.parentEmailsDoNotMatch);
  assert.equal(msg(signupSchema, { ...SIGNUP, acceptedTerms: false }), AUTH_MESSAGES.termsRequired);
  const { acceptedTerms: _t, ...noTerms } = SIGNUP;
  assert.equal(msg(signupSchema, noTerms), AUTH_MESSAGES.termsRequired);
  const { parentEmail: _e, ...noEmail } = SIGNUP;
  assert.equal(msg(signupSchema, noEmail), AUTH_MESSAGES.parentEmailRequired);
  assert.equal(msg(signupSchema, { ...SIGNUP, parentEmail: "not-an-email" }), AUTH_MESSAGES.parentEmailInvalid);
});
test("signup: email mismatch AND password mismatch are both reported", () => {
  const r = signupSchema.safeParse({ ...SIGNUP, confirmParentEmail: "x@example.com", confirmPassword: "Password2" });
  assert.equal(r.success, false);
  const messages = r.error.issues.map((i) => i.message);
  assert.ok(messages.includes(AUTH_MESSAGES.parentEmailsDoNotMatch));
  assert.ok(messages.includes(AUTH_MESSAGES.passwordsDoNotMatch));
});

// ---------- forgot password ----------
test("forgotPassword: only a non-empty username", () => {
  assert.deepEqual(forgotPasswordSchema.parse({ name: "  raza " }), { name: "raza" });
  assert.equal(msg(forgotPasswordSchema, { name: "   " }), AUTH_MESSAGES.usernameRequired);
  assert.equal(msg(forgotPasswordSchema, {}), AUTH_MESSAGES.usernameRequired);
});

// ---------- reset password ----------
test("reset: token must look like a generated token", () => {
  assert.equal(resetTokenSchema.safeParse(generateResetToken()).success, true);
  for (const bad of ["", "short", "A".repeat(42), "A".repeat(44), "A".repeat(42) + "!", "A".repeat(42) + "=", 123, undefined]) {
    assert.equal(fieldMsg(resetTokenSchema, bad), AUTH_MESSAGES.resetLinkInvalid, String(bad));
  }
});
test("reset: the OLD { name, password } body is rejected (account-takeover hole closed)", () => {
  for (const body of [
    { name: "raza", password: "Password1" },
    { name: "raza", password: "Password1", confirmPassword: "Password1" },
  ]) {
    const r = resetPasswordSchema.safeParse(body);
    assert.equal(r.success, false, JSON.stringify(body));
  }
});
test("reset: any extra field (even with a valid token) is rejected", () => {
  const token = generateResetToken();
  assert.equal(resetPasswordSchema.safeParse({ token, password: "Password1", confirmPassword: "Password1" }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token, password: "Password1", confirmPassword: "Password1", name: "raza" }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token, password: "Password1", confirmPassword: "Password1", userId: "x" }).success, false);
});

// ---------- token helpers ----------
test("generateResetToken: 43 base64url characters, unique", () => {
  const tokens = new Set();
  for (let i = 0; i < 200; i++) {
    const t = generateResetToken();
    assert.match(t, /^[A-Za-z0-9_-]{43}$/);
    tokens.add(t);
  }
  assert.equal(tokens.size, 200);
});
test("hashResetToken: deterministic SHA-256 hex, never equal to the token", () => {
  const t = generateResetToken();
  const h = hashResetToken(t);
  assert.equal(h, hashResetToken(t));
  assert.equal(h, createHash("sha256").update(t).digest("hex"));
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.notEqual(h, t);
  assert.notEqual(hashResetToken(generateResetToken()), h);
});
test("token constants", () => {
  assert.equal(RESET_TOKEN_TTL_MINUTES, 60);
  assert.equal(RESET_TOKENS_PER_HOUR, 3);
  assert.equal(SESSION_CHECK_INTERVAL_SECONDS, 60);
});
test("resolveCheckIntervalSeconds: default for missing / empty / not a whole number", () => {
  for (const raw of [undefined, "", "abc", "1.5"]) {
    assert.equal(resolveCheckIntervalSeconds(raw), 60, JSON.stringify(raw));
  }
});
test("resolveCheckIntervalSeconds: whole numbers clamped to 0..300", () => {
  assert.equal(resolveCheckIntervalSeconds("-5"), 0);
  assert.equal(resolveCheckIntervalSeconds("0"), 0);
  assert.equal(resolveCheckIntervalSeconds("30"), 30);
  assert.equal(resolveCheckIntervalSeconds("9999"), 300);
});

// ---------- session invalidation rule ----------
test("shouldInvalidate: deleted user always ends the session", () => {
  assert.equal(shouldInvalidate(1_000, null, false), true);
  assert.equal(shouldInvalidate(1_000, new Date(0), false), true);
});
test("shouldInvalidate: never-changed password keeps the session", () => {
  assert.equal(shouldInvalidate(1_000, null, true), false);
  assert.equal(shouldInvalidate(0, null, true), false); // legacy token, password never changed
});
test("shouldInvalidate: password changed after sign-in ends it; before keeps it", () => {
  const sat = 1_700_000_000;
  assert.equal(shouldInvalidate(sat, new Date((sat + 1) * 1000), true), true);
  assert.equal(shouldInvalidate(sat, new Date((sat + 3600) * 1000), true), true);
  assert.equal(shouldInvalidate(sat, new Date((sat - 1) * 1000), true), false);
});
test("shouldInvalidate: same second is not ended (login right after a reset)", () => {
  const sat = 1_700_000_000;
  assert.equal(shouldInvalidate(sat, new Date(sat * 1000), true), false);
  assert.equal(shouldInvalidate(sat, new Date(sat * 1000 + 999), true), false);
});
test("shouldInvalidate: legacy token (sat 0) ends once the password has ever changed", () => {
  assert.equal(shouldInvalidate(0, new Date("2026-10-29T00:00:00Z"), true), true);
});
test("shouldInvalidate: invalid date keeps the session", () => {
  assert.equal(shouldInvalidate(1_000, new Date("not a date"), true), false);
});

// ---------- email content ----------
test("reset email: username, expiry, ignore line, link; HTML is escaped", () => {
  const link = "https://izzy-spell.vercel.app/reset-password?token=abc";
  const { subject, text, html } = buildPasswordResetEmail({ username: "<b>raza</b>", resetLink: link, expiresInMinutes: 60 });
  assert.ok(subject.includes("<b>raza</b>")); // plain-text subject
  for (const body of [text, html]) {
    assert.ok(body.includes("60 minutes"));
    assert.ok(/did not ask for this/i.test(body));
  }
  assert.ok(text.includes(link));
  assert.ok(html.includes("&lt;b&gt;raza&lt;/b&gt;"));
  assert.ok(!html.includes("<b>raza</b>"));
  assert.ok(html.includes(link.replace(/&/g, "&amp;")));
});
