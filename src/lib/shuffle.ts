// Fisher-Yates shuffle: returns a new array in uniformly random order.
// (sort(() => Math.random() - 0.5) is biased and should not be used for shuffling.)
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
