// Pure unit tests for src/lib/profileValidation.ts (no database, no network).
// Run: node --test tests/profileValidation.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AGE_OPTIONS,
  GRADE_OPTIONS,
  PROFILE_MESSAGES,
  profileSchema,
  updateProfileBodySchema,
  firstProfileError,
  NAME_MAX_LENGTH,
  PROFILE_IMAGE_MAX_LENGTH,
} from "../src/lib/profileValidation.ts";

const valid = { firstName: "Ali", lastName: "Raza", age: "8-9", grade: "3rd Grade", profileImage: "" };
const errorOf = (body) => {
  const result = updateProfileBodySchema.safeParse(body);
  return result.success ? null : firstProfileError(result.error);
};

test("options match the profile form's values", () => {
  assert.deepEqual([...AGE_OPTIONS], ["6-7", "7-8", "8-9", "9-10", "10-11", "11-12"]);
  assert.deepEqual([...GRADE_OPTIONS], ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade"]);
});

test("valid profile passes; names are trimmed", () => {
  const data = profileSchema.parse({ ...valid, firstName: "  Ali ", lastName: " Raza  " });
  assert.equal(data.firstName, "Ali");
  assert.equal(data.lastName, "Raza");
  for (const age of AGE_OPTIONS) assert.equal(profileSchema.safeParse({ ...valid, age }).success, true, age);
  for (const grade of GRADE_OPTIONS) assert.equal(profileSchema.safeParse({ ...valid, grade }).success, true, grade);
});

test("card fields and other unknown keys are stripped, never passed through", () => {
  const body = {
    data: { ...valid, cardNumber: 4111111111111111, cardCVC: 123, cardName: "X", expireMonth: "May", expireYear: 2030, password: "x", profileUpdated: false },
    userId: "someone-else",
  };
  const parsed = updateProfileBodySchema.parse(body);
  assert.deepEqual(Object.keys(parsed).sort(), ["data"]);
  assert.deepEqual(Object.keys(parsed.data).sort(), ["age", "firstName", "grade", "lastName", "profileImage"]);
});

test("first/last name: required, whitespace-only rejected, max 50", () => {
  assert.equal(errorOf({ data: { ...valid, firstName: "" } }), PROFILE_MESSAGES.firstNameRequired);
  assert.equal(errorOf({ data: { ...valid, firstName: "   " } }), PROFILE_MESSAGES.firstNameRequired);
  assert.equal(errorOf({ data: { ...valid, firstName: undefined } }), PROFILE_MESSAGES.firstNameRequired);
  assert.equal(errorOf({ data: { ...valid, lastName: "" } }), PROFILE_MESSAGES.lastNameRequired);
  assert.equal(profileSchema.safeParse({ ...valid, firstName: "a".repeat(NAME_MAX_LENGTH) }).success, true);
  assert.equal(errorOf({ data: { ...valid, firstName: "a".repeat(NAME_MAX_LENGTH + 1) } }), PROFILE_MESSAGES.firstNameTooLong);
  assert.equal(errorOf({ data: { ...valid, lastName: "a".repeat(NAME_MAX_LENGTH + 1) } }), PROFILE_MESSAGES.lastNameTooLong);
  assert.equal(errorOf({ data: { ...valid, firstName: 42 } }), PROFILE_MESSAGES.firstNameRequired);
});

test("age and grade must be one of the form's options", () => {
  for (const age of ["", "5-6", "12-13", "8 - 9", "undefined", null, undefined, 8]) {
    assert.equal(errorOf({ data: { ...valid, age } }), PROFILE_MESSAGES.ageInvalid, String(age));
  }
  for (const grade of ["", "7th Grade", "3rd grade", "Grade 3", "undefined", null, undefined]) {
    assert.equal(errorOf({ data: { ...valid, grade } }), PROFILE_MESSAGES.gradeInvalid, String(grade));
  }
});

test("profileImage: optional, empty allowed, length-limited, must be a string", () => {
  const { profileImage: _omit, ...withoutImage } = valid;
  assert.equal("profileImage" in profileSchema.parse(withoutImage), false); // omitted stays omitted
  assert.equal(profileSchema.parse({ ...valid, profileImage: "" }).profileImage, "");
  assert.equal(profileSchema.parse({ ...valid, profileImage: null }).profileImage, null);
  assert.equal(profileSchema.parse({ ...valid, profileImage: " https://x/y.png " }).profileImage, "https://x/y.png");
  assert.equal(profileSchema.safeParse({ ...valid, profileImage: "a".repeat(PROFILE_IMAGE_MAX_LENGTH) }).success, true);
  assert.equal(errorOf({ data: { ...valid, profileImage: "a".repeat(PROFILE_IMAGE_MAX_LENGTH + 1) } }), PROFILE_MESSAGES.profileImageInvalid);
  assert.equal(errorOf({ data: { ...valid, profileImage: 123 } }), PROFILE_MESSAGES.profileImageInvalid);
});

test("body shape problems give the generic message", () => {
  for (const body of [null, "text", 42, [], {}, { data: null }, { data: "x" }, { userId: "x" }]) {
    assert.equal(errorOf(body), PROFILE_MESSAGES.invalidRequest, JSON.stringify(body));
  }
});

test("nothing in a valid parse can produce the text 'undefined'", () => {
  const parsed = updateProfileBodySchema.parse({ data: { ...valid } });
  for (const [key, value] of Object.entries(parsed.data)) {
    assert.notEqual(value, "undefined", key);
    assert.notEqual(value, undefined, key);
  }
});
