// Pure unit tests for src/lib/authValidation.ts (no database, no network).
// Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_MESSAGES,
  usernameSchema,
  passwordSchema,
  signupSchema,
  resetPasswordSchema,
  existingUsernameSchema,
  firstErrorMessage,
  zodFieldRule,
  utf8ByteLength,
  PASSWORD_MAX_BYTES,
} from "../src/lib/authValidation.ts";

// A complete, valid sign-up body (Batch C added the email + consent fields)
const SIGNUP = {
  name: "raza1",
  parentEmail: "Parent@Example.com",
  confirmParentEmail: "parent@example.com",
  password: "Password1",
  confirmPassword: "Password1",
  acceptedTerms: true,
};
// A syntactically valid reset token (43 base64url characters)
const TOKEN = "A".repeat(43);

const errorOf = (schema, value) => {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0].message;
};

// ---------- username ----------
test("username: valid names pass and are trimmed", () => {
  assert.equal(usernameSchema.parse("raza1"), "raza1");
  assert.equal(usernameSchema.parse("  raza1  "), "raza1");
  assert.equal(usernameSchema.parse("Zoë2024"), "Zoë2024"); // unicode letters allowed
  assert.equal(usernameSchema.parse("abcd"), "abcd"); // exactly 4
  assert.equal(usernameSchema.parse("a".repeat(30)), "a".repeat(30)); // exactly 30
});

test("username: too short / too long", () => {
  assert.equal(errorOf(usernameSchema, "abc"), AUTH_MESSAGES.usernameTooShort);
  assert.equal(errorOf(usernameSchema, "  abc  "), AUTH_MESSAGES.usernameTooShort); // trimmed first
  assert.equal(errorOf(usernameSchema, "a".repeat(31)), AUTH_MESSAGES.usernameTooLong);
});

test("username: empty and whitespace-only are rejected as required", () => {
  assert.equal(errorOf(usernameSchema, ""), AUTH_MESSAGES.usernameRequired);
  assert.equal(errorOf(usernameSchema, "      "), AUTH_MESSAGES.usernameRequired);
  assert.equal(errorOf(usernameSchema, undefined), AUTH_MESSAGES.usernameRequired);
  assert.equal(errorOf(usernameSchema, 1234), AUTH_MESSAGES.usernameRequired);
});

test("username: only letters and numbers", () => {
  for (const bad of ["raza akmal", "raza_1", "raza-1", "raza!", "ra%za", "raza.1", "r@za"]) {
    assert.equal(errorOf(usernameSchema, bad), AUTH_MESSAGES.usernameCharacters, bad);
  }
});

test("username: cannot be all digits", () => {
  assert.equal(errorOf(usernameSchema, "12345"), AUTH_MESSAGES.usernameAllNumbers);
  assert.equal(usernameSchema.parse("1234a"), "1234a");
});

// ---------- password ----------
test("password: 7 chars rejected, 8 accepted", () => {
  assert.equal(errorOf(passwordSchema, "a".repeat(7)), AUTH_MESSAGES.passwordTooShort);
  assert.equal(passwordSchema.parse("a".repeat(8)), "a".repeat(8));
});

test("password: 72 bytes accepted, 73 bytes rejected", () => {
  assert.equal(PASSWORD_MAX_BYTES, 72);
  assert.equal(passwordSchema.parse("a".repeat(72)), "a".repeat(72));
  assert.equal(errorOf(passwordSchema, "a".repeat(73)), AUTH_MESSAGES.passwordTooLong);
});

test("password: multibyte characters are counted in bytes, not characters", () => {
  // "é" = 2 bytes, "😀" = 4 bytes in UTF-8
  assert.equal(passwordSchema.parse("é".repeat(36)), "é".repeat(36)); // 36 chars, 72 bytes
  assert.equal(errorOf(passwordSchema, "é".repeat(36) + "a"), AUTH_MESSAGES.passwordTooLong); // 73 bytes
  assert.equal(passwordSchema.parse("😀".repeat(18)), "😀".repeat(18)); // 72 bytes
  assert.equal(errorOf(passwordSchema, "😀".repeat(19)), AUTH_MESSAGES.passwordTooLong); // 76 bytes
  // 8 multibyte characters is long enough (min length is in characters)
  assert.equal(passwordSchema.parse("😀".repeat(8)), "😀".repeat(8));
});

test("password: byte count matches Buffer.byteLength", () => {
  for (const s of ["", "a", "é", "😀", "Zoë-😀-日本語", "a".repeat(73)]) {
    assert.equal(utf8ByteLength(s), Buffer.byteLength(s, "utf8"), s);
  }
});

test("password: empty or missing is required", () => {
  assert.equal(errorOf(passwordSchema, ""), AUTH_MESSAGES.passwordRequired);
  assert.equal(errorOf(passwordSchema, undefined), AUTH_MESSAGES.passwordRequired);
});

test("password: no other complexity rule, spaces kept as typed", () => {
  assert.equal(passwordSchema.parse("        "), "        "); // 8 spaces is allowed
  assert.equal(passwordSchema.parse(" pass word "), " pass word "); // not trimmed
});

// ---------- sign-up ----------
test("signup: valid body passes; name trimmed, email trimmed + lower-cased", () => {
  const data = signupSchema.parse({ ...SIGNUP, name: "  raza1 ", parentEmail: "  Parent@Example.COM " });
  assert.equal(data.name, "raza1");
  assert.equal(data.parentEmail, "parent@example.com");
  assert.equal(data.acceptedTerms, true);
});

test("signup: confirm mismatch is rejected on confirmPassword", () => {
  const result = signupSchema.safeParse({ ...SIGNUP, confirmPassword: "Password2" });
  assert.equal(result.success, false);
  assert.equal(result.error.issues[0].message, AUTH_MESSAGES.passwordsDoNotMatch);
  assert.deepEqual(result.error.issues[0].path, ["confirmPassword"]);
});

test("signup: missing confirmPassword is rejected", () => {
  const { confirmPassword: _omit, ...withoutConfirm } = SIGNUP;
  const result = signupSchema.safeParse(withoutConfirm);
  assert.equal(result.success, false);
  assert.equal(firstErrorMessage(result.error), AUTH_MESSAGES.passwordsDoNotMatch);
});

test("signup: field errors come before the match check", () => {
  const result = signupSchema.safeParse({ ...SIGNUP, name: "ab", password: "short", confirmPassword: "short" });
  assert.equal(result.success, false);
  assert.equal(firstErrorMessage(result.error), AUTH_MESSAGES.usernameTooShort);
});

// ---------- reset ----------
test("reset: existing-account name is only trimmed + required (no sign-up format rules)", () => {
  assert.equal(existingUsernameSchema.parse(" ab "), "ab");
  assert.equal(existingUsernameSchema.parse("old name_1"), "old name_1");
  assert.equal(errorOf(existingUsernameSchema, "   "), AUTH_MESSAGES.usernameRequired);
});

test("reset: password rules and confirm match apply", () => {
  assert.equal(
    resetPasswordSchema.safeParse({ token: TOKEN, password: "Password1", confirmPassword: "Password1" }).success,
    true
  );
  const short = resetPasswordSchema.safeParse({ token: TOKEN, password: "a", confirmPassword: "a" });
  assert.equal(firstErrorMessage(short.error), AUTH_MESSAGES.passwordTooShort);
  const mismatch = resetPasswordSchema.safeParse({ token: TOKEN, password: "Password1", confirmPassword: "Password9" });
  assert.equal(firstErrorMessage(mismatch.error), AUTH_MESSAGES.passwordsDoNotMatch);
});

// ---------- helpers ----------
test("firstErrorMessage: non-object body gives the generic message", () => {
  for (const body of [null, "text", 42, []]) {
    const result = signupSchema.safeParse(body);
    assert.equal(result.success, false);
    assert.equal(firstErrorMessage(result.error), AUTH_MESSAGES.invalidRequest, JSON.stringify(body));
  }
});

test("zodFieldRule: returns true or the field's own message (used by the forms)", () => {
  const usernameRule = zodFieldRule(usernameSchema);
  assert.equal(usernameRule("raza1"), true);
  assert.equal(usernameRule("ab"), AUTH_MESSAGES.usernameTooShort);
  assert.equal(usernameRule("12345"), AUTH_MESSAGES.usernameAllNumbers);
  const passwordRule = zodFieldRule(passwordSchema);
  assert.equal(passwordRule("Password1"), true);
  assert.equal(passwordRule("short"), AUTH_MESSAGES.passwordTooShort);
});

// Regression guard (Batch A diagnosis): the exact payloads from the 6 failing script
// checks must map to their specific messages - never the generic "Invalid request",
// which firstErrorMessage only uses for errors with an empty path (a broken body).
test("firstErrorMessage: field and confirm errors are specific, never the generic message", () => {
  const long73 = "a".repeat(73);
  const cases = [
    [signupSchema, { ...SIGNUP, name: "zztestdiag1", password: "Passwor", confirmPassword: "Passwor" }, AUTH_MESSAGES.passwordTooShort],
    [signupSchema, { ...SIGNUP, name: "zztestdiag1", password: long73, confirmPassword: long73 }, AUTH_MESSAGES.passwordTooLong],
    [signupSchema, { ...SIGNUP, name: "zztestdiag1", password: "Password1", confirmPassword: "Password2" }, AUTH_MESSAGES.passwordsDoNotMatch],
    [resetPasswordSchema, { token: TOKEN, password: "a", confirmPassword: "a" }, AUTH_MESSAGES.passwordTooShort],
    [resetPasswordSchema, { token: TOKEN, password: "Password1", confirmPassword: "Password9" }, AUTH_MESSAGES.passwordsDoNotMatch],
  ];
  for (const [schema, body, expected] of cases) {
    const result = schema.safeParse(body);
    assert.equal(result.success, false, JSON.stringify(body));
    assert.notEqual(result.error.issues[0].path.length, 0, JSON.stringify(body));
    assert.equal(firstErrorMessage(result.error), expected, JSON.stringify(body));
  }
  // A valid upper-case name passes validation (the "already exists" answer comes from the DB check)
  assert.equal(signupSchema.safeParse({ ...SIGNUP, name: "RAZA" }).success, true);
  // What bash 3.2 actually sent: a JSON string fragment, not an object -> generic message is correct
  assert.equal(firstErrorMessage(signupSchema.safeParse("name:zztest123").error), AUTH_MESSAGES.invalidRequest);
});
