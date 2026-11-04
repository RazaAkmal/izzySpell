// Pure unit tests for src/lib/scrambleWords.ts (no database, no network).
// Run: node --test tests/scrambleWords.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { repairScrambleOptions, makeScramble } from "../src/lib/scrambleWords.ts";

const sorted = (s) => s.toLowerCase().split("").sort().join("");

// The game's rule: exactly one option is an anagram of the word
const assertGood = (word, options, { mustDiffer = true } = {}) => {
  assert.equal(options.length, 4);
  assert.equal(new Set(options.map((o) => o.toLowerCase())).size, 4, `distinct: ${options}`);
  const anagrams = options.filter((o) => sorted(o) === sorted(word));
  assert.equal(anagrams.length, 1, `exactly one anagram: ${options}`);
  if (mustDiffer) assert.notEqual(anagrams[0].toLowerCase(), word.toLowerCase());
};

test("a valid question is left alone", () => {
  const out = repairScrambleOptions("warm", ["rmaw", "parm", "warb", "narm"]);
  assert.deepEqual(out, ["rmaw", "parm", "warb", "narm"]);
});

test("no anagram: option 0 becomes a real scramble", () => {
  for (let i = 0; i < 50; i++) {
    const out = repairScrambleOptions("warm", ["parm", "warb", "narm", "wxrm"]);
    assertGood("warm", out);
  }
});

test("the only anagram equals the word: it is replaced by a true scramble", () => {
  for (let i = 0; i < 50; i++) {
    const out = repairScrambleOptions("warm", ["parm", "warm", "warb", "narm"]);
    assertGood("warm", out);
  }
});

test("several anagrams: only the first non-identical one stays", () => {
  for (let i = 0; i < 50; i++) {
    const out = repairScrambleOptions("warm", ["warm", "rmaw", "mraw", "warb"]);
    assertGood("warm", out);
    assert.equal(out[1], "rmaw");
  }
});

test("duplicates, empties and bad shapes are repaired", () => {
  for (let i = 0; i < 50; i++) {
    assertGood("tree", repairScrambleOptions("tree", ["eert", "eert", "", "EERT"]));
    assertGood("tree", repairScrambleOptions("tree", null));
    assertGood("tree", repairScrambleOptions("tree", [1, 2, "eert"]));
    assertGood("tree", repairScrambleOptions("tree", ["eert", "a", "b", "c", "d", "e"]));
  }
});

test("wrong-length decoys are replaced so every option has the word's letter count", () => {
  for (let i = 0; i < 50; i++) {
    const out = repairScrambleOptions("banana", ["anaanb", "more", "stuff", "here"]);
    assertGood("banana", out);
    assert.ok(out.every((o) => o.length === 6), `lengths: ${out}`);
  }
});

test("words that cannot be scrambled still get exactly one anagram", () => {
  for (const word of ["aaa", "a", "ee"]) {
    for (let i = 0; i < 20; i++) {
      assertGood(word, repairScrambleOptions(word, ["x", "y", "z", "w"]), { mustDiffer: false });
    }
  }
  assert.equal(makeScramble("aaa"), "aaa");
});

test("makeScramble always differs for scrambleable words, even with an unlucky rng", () => {
  assert.notEqual(makeScramble("cat", () => 0.999), "cat");
  for (let i = 0; i < 200; i++) assert.notEqual(makeScramble("aab"), "aab");
});
