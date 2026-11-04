// Pure unit tests for src/lib/flashCards.ts (no database, no network).
// Run: node --test tests/flashCards.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { stripCodeFences, validateFlashCards } from "../src/lib/flashCards.ts";

const card = (word, options, correct, extra = {}) => ({
  original_word: word,
  options,
  correct_index: correct,
  definition: "d",
  example_sentence: "e",
  ...extra,
});

const assertValid = (c) => {
  assert.equal(c.options.length, 4);
  assert.ok(c.options.every((o) => typeof o === "string" && o.length > 0));
  assert.equal(new Set(c.options.map((o) => o.toLowerCase())).size, 4);
  assert.equal(c.options[c.correctIndex].toLowerCase(), c.originalWord.toLowerCase());
};

test("strips json and plain code fences", () => {
  assert.equal(stripCodeFences('```json\n[1]\n```'), "[1]");
  assert.equal(stripCodeFences("```\n[1]\n```"), "[1]");
  assert.equal(stripCodeFences("  [1]  "), "[1]");
});

test("a valid card is kept as is", () => {
  const [c] = validateFlashCards([card("cat", ["kat", "cat", "cta", "catt"], 1)], ["cat"]);
  assert.deepEqual(c.options, ["kat", "cat", "cta", "catt"]);
  assert.equal(c.correctIndex, 1);
  assertValid(c);
});

test("wrong correct_index is fixed to the matching option", () => {
  const [c] = validateFlashCards([card("cat", ["kat", "cat", "cta", "catt"], 3)], ["cat"]);
  assert.equal(c.correctIndex, 1);
  assertValid(c);
});

test("missing correct spelling is injected at index 0", () => {
  const [c] = validateFlashCards([card("cat", ["kat", "cta", "catt", "cet"], 2)], ["cat"]);
  assert.equal(c.correctIndex, 0);
  assert.equal(c.options[0], "cat");
  assertValid(c);
});

test("empty options and duplicates are replaced, correct one kept", () => {
  const [c] = validateFlashCards([card("dog", ["dog", "", "DOG", "dgo"], 0)], ["dog"]);
  assert.equal(c.correctIndex, 0);
  assertValid(c);
});

test("bad shapes are repaired (not 4 options, non-strings, bad index)", () => {
  const [a] = validateFlashCards([card("sun", ["sun"], "x")], ["sun"]);
  assertValid(a);
  const [b] = validateFlashCards([card("sun", [1, null, "sun", {}, "extra"], 9)], ["sun"]);
  assertValid(b);
  const [c] = validateFlashCards([{ original_word: "sun" }], ["sun"]);
  assertValid(c);
});

test("missing words get a fallback card; extras and repeats are dropped", () => {
  const out = validateFlashCards(
    [card("cat", ["cat", "kat", "cta", "cet"], 0), card("cat", ["x", "y", "z", "w"], 0), card("zzz", ["a", "b", "c", "d"], 0)],
    ["cat", "tree", "a"]
  );
  assert.deepEqual(out.map((c) => c.originalWord), ["cat", "tree", "a"]);
  out.forEach(assertValid);
  assert.equal(out[1].definition, "Spell this word correctly.");
  assert.equal(out[1].exampleSentence, "");
  assert.equal(out[1].correctIndex, 0);
});

test("non-array AI output still yields a fallback card per word", () => {
  const out = validateFlashCards(null, ["one", "two"]);
  assert.equal(out.length, 2);
  out.forEach(assertValid);
});
