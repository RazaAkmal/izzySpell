// Pure unit tests: parent-email masking and the add-only "add a parent email" rules.
// Run: node --test tests/parentEmail.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { maskEmail } from "../src/lib/maskEmail.ts";
import { AUTH_MESSAGES, parseParentEmailUpdate, canAddParentEmail } from "../src/lib/authValidation.ts";

// ---------- maskEmail ----------
test("maskEmail: first character of the local part + ***@domain", () => {
  assert.equal(maskEmail("mum.smith@example.com"), "m***@example.com");
  assert.equal(maskEmail("delivered@resend.dev"), "d***@resend.dev");
});
test("maskEmail: short local part", () => {
  assert.equal(maskEmail("a@example.com"), "a***@example.com");
  assert.equal(maskEmail("ab@x.co"), "a***@x.co");
});
test("maskEmail: upper case and spaces are normalised", () => {
  assert.equal(maskEmail("  Mum@Example.COM "), "m***@example.com");
});
test("maskEmail: never reveals more than the first character", () => {
  const masked = maskEmail("secretname@example.com");
  assert.ok(!masked.includes("ecret"));
  assert.equal(masked.split("@")[0], "s***");
});
test("maskEmail: odd input becomes ***", () => {
  for (const odd of ["", "   ", "no-at-sign", "@example.com", "user@", null, undefined, 42, {}, []]) {
    assert.equal(maskEmail(odd), "***", JSON.stringify(odd));
  }
});
test("maskEmail: several @ signs - domain is after the last one", () => {
  assert.equal(maskEmail('"a@b"@example.com'), '"***@example.com');
});
test("maskEmail: non-BMP first character is kept whole", () => {
  assert.equal(maskEmail("😀kid@example.com"), "😀***@example.com");
});

// ---------- parseParentEmailUpdate (all-or-nothing + validation) ----------
const VALID = { parentEmail: "Mum@Example.com", confirmParentEmail: " mum@example.COM ", acceptedTerms: true };

test("no parent email fields -> nothing to do (profile-only updates keep working)", () => {
  assert.deepEqual(parseParentEmailUpdate({ firstName: "A", lastName: "B", age: "8-9", grade: "3rd Grade" }), { action: "none" });
  assert.deepEqual(parseParentEmailUpdate(undefined), { action: "none" });
  assert.deepEqual(parseParentEmailUpdate(null), { action: "none" });
});
test("all three valid -> set, lower-cased and trimmed", () => {
  assert.deepEqual(parseParentEmailUpdate(VALID), { action: "set", parentEmail: "mum@example.com" });
});
test("partial sets are rejected", () => {
  for (const partial of [
    { parentEmail: VALID.parentEmail },
    { parentEmail: VALID.parentEmail, confirmParentEmail: VALID.confirmParentEmail },
    { parentEmail: VALID.parentEmail, acceptedTerms: true },
    { acceptedTerms: true },
  ]) {
    assert.deepEqual(parseParentEmailUpdate(partial), { action: "reject", error: AUTH_MESSAGES.parentEmailIncomplete }, JSON.stringify(partial));
  }
});
test("invalid email, mismatch, terms not accepted -> rejected with the specific message", () => {
  assert.deepEqual(parseParentEmailUpdate({ ...VALID, parentEmail: "nope", confirmParentEmail: "nope" }), { action: "reject", error: AUTH_MESSAGES.parentEmailInvalid });
  assert.deepEqual(parseParentEmailUpdate({ ...VALID, confirmParentEmail: "other@example.com" }), { action: "reject", error: AUTH_MESSAGES.parentEmailsDoNotMatch });
  assert.deepEqual(parseParentEmailUpdate({ ...VALID, acceptedTerms: false }), { action: "reject", error: AUTH_MESSAGES.termsRequired });
  assert.deepEqual(parseParentEmailUpdate({ ...VALID, acceptedTerms: "true" }), { action: "reject", error: AUTH_MESSAGES.termsRequired });
  assert.deepEqual(parseParentEmailUpdate({ ...VALID, parentEmail: "", confirmParentEmail: "" }), { action: "reject", error: AUTH_MESSAGES.parentEmailRequired });
});
test("null values count as present (not silently ignored)", () => {
  assert.equal(parseParentEmailUpdate({ parentEmail: null, confirmParentEmail: null, acceptedTerms: null }).action, "reject");
});

// ---------- add-only rule ----------
test("canAddParentEmail: only while none is on file", () => {
  assert.equal(canAddParentEmail(null), true);
  assert.equal(canAddParentEmail(undefined), true);
  assert.equal(canAddParentEmail(""), true);
  assert.equal(canAddParentEmail("mum@example.com"), false);
});
