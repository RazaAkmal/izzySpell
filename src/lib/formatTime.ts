// Plain time text for kids and parents: 75 -> "1 min 15 sec", 120 -> "2 min", 20 -> "20 sec"
export const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min === 0) return `${sec} sec`;
  return sec === 0 ? `${min} min` : `${min} min ${sec} sec`;
};
