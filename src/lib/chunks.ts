// Words per AI call when generating flash cards / scramble words. Small chunks keep each
// response well inside the model's output limit, so large lists no longer get cut off.
export const GENERATION_CHUNK_SIZE = 10;

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// The list without repeated words (case-insensitive, trimmed), original order kept
export function uniqueWords(words: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const word of words) {
    const text = typeof word === "string" ? word.trim() : "";
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
}
