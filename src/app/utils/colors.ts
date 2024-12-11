export const getColorForProgress = (progress: number) => {
  if (progress > 0 && progress <= 25) return "bg-purple";
  if (progress > 25 && progress <= 50) return "bg-orange";
  if (progress > 50 && progress <= 75) return "bg-green";
  if (progress > 75) return "bg-blue";
  return "bg-yellow-500";
};