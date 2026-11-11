// Profile grades are stored as text like "1st Grade"; this pulls out the number
const gradeNumber = (grade: string | null | undefined): number | null => {
  const n = parseInt((grade ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

// Default mode: after a wrong answer, kids up to this grade see which letters are already
// in the right spot. Older kids only see that the word is wrong.
const LETTER_HINTS_MAX_GRADE = 1;

// No grade on the profile: give the hints (the gentler default)
export const showsLetterHints = (grade: string | null | undefined) => {
  const n = gradeNumber(grade);
  return n === null || n <= LETTER_HINTS_MAX_GRADE;
};
