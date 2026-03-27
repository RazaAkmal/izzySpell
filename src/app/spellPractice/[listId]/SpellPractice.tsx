"use server";

import { getWordCountForEachExercise, getWordsByListId } from "@/app/actions/prismaActions";
import { getRecentQuizAttempts } from "@/app/actions/getRecentQuizAttempts";
import PracticeWordModal from "@/components/PraticeWordModal";
import GoToHomeButton from "@/components/GoToHomeButton";
import CustomButton from "@/components/HeadlessButton";

export default async function WordsPage({
  listId,
}: {
  listId: string;
}) {
  // Fetch all data in parallel — quiz data pre-loaded so quiz tab is instant
  const [exerciseData, wordsData, quizData] = await Promise.all([
    getWordCountForEachExercise(parseInt(listId)),
    getWordsByListId(parseInt(listId)),
    getRecentQuizAttempts(parseInt(listId)).catch(() => ({ attempts: [], uniqueMistakesCount: 0 })),
  ]);

  const { total, studiedWordCount, studiedSyllableWord, studiedGroupCount, totalGroups } = exerciseData;
  const { words } = wordsData;
  const wordStrings = words.map(word => word.word);
  const validTotalGroups = totalGroups.filter(group => group._count.word > 1);
  const validStudiedGroups = studiedGroupCount.filter(group => group._count.word > 1);
  const totalStudiedGroups = validStudiedGroups.length;
  const totalGroupsCount = validTotalGroups.length;
  const groupedProgress = totalGroupsCount > 0
    ? (totalStudiedGroups / totalGroupsCount) * 100
    : 0;
  return (
    <div className="min-h-[75vh] flex flex-col items-center gap-4 sm:gap-6 bg-skyBlue rounded-md p-4 sm:p-6 mx-4 md:mx-8 lg:mx-7">
      <div className="w-full flex flex-col lg:flex-row lg:items-start justify-between items-center gap-3 sm:gap-4">
        <div className="w-full lg:w-auto flex justify-center lg:justify-start">
          <CustomButton
            label={`Words: ${total}`}
            size="small"
            variant="success"
            radius="rounded"
            img="/images/AlphaIcon.svg"
            className="cursor-default w-auto"
          />
        </div>
        <div className="w-full lg:flex-1">
          <PracticeWordModal
            totalGroups={totalGroupsCount}
            totalStudiedGroups={totalStudiedGroups}
            totalWords={total}
            studiedCount={studiedWordCount}
            studiedSyllableCount={studiedSyllableWord}
            studiedGroupCount={Math.round(groupedProgress)}
            words={wordStrings}
            initialRecentAttempts={quizData.attempts}
            initialMistakesCount={quizData.uniqueMistakesCount}
          />
        </div>
        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
          <GoToHomeButton />
        </div>
      </div>
    </div>
  );
}
