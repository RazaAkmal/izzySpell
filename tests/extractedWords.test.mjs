// Pure unit tests for src/lib/extractedWords.ts (no database, no network).
// Run: node --test tests/extractedWords.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { toExerciseRows } from "../src/lib/extractedWords.ts";

test("maps syllable words and groups to rows for the list", () => {
  const { syllableRows, groupRows } = toExerciseRows(7, {
    SyllableWords: [{ Word: "table", Answer: "ta-ble", Options: ["ta-ble", "tab-le", "t-able", "tabl-e"] }],
    GroupedWords: { "Group 1": ["table", "cable"], "Group 2": ["friend"] },
  });
  assert.deepEqual(syllableRows, [
    { listId: 7, word: "table", answer: "ta-ble", options: ["ta-ble", "tab-le", "t-able", "tabl-e"] },
  ]);
  assert.deepEqual(groupRows, [
    { listId: 7, groupName: "Group 1", word: "table" },
    { listId: 7, groupName: "Group 1", word: "cable" },
    { listId: 7, groupName: "Group 2", word: "friend" },
  ]);
});

test("empty AI data gives no rows", () => {
  assert.deepEqual(toExerciseRows(7, { SyllableWords: [], GroupedWords: {} }), { syllableRows: [], groupRows: [] });
});
