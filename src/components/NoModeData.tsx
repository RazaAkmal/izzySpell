import Link from "next/link";

// Shown instead of a blank page when a study mode has nothing to practise
// (e.g. a list whose syllable or group data was never generated)
export default function NoModeData({ listId, message }: { listId: string; message: string }) {
  return (
    <div className="bg-skyBlue m-7 mt-1 p-6 rounded-lg shadow-lg flex flex-col items-center gap-6 text-center">
      <p className="text-lg md:text-2xl font-semibold text-darkBlue max-w-xl">{message}</p>
      <Link
        href={`/spellPractice/${listId}`}
        className="bg-green text-white font-bold rounded-full px-6 py-2 text-base md:text-lg hover:opacity-90"
      >
        Back to practice
      </Link>
    </div>
  );
}
