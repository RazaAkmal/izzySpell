"use server";

import { getPracticeHubData } from "./practiceHubData";
import PracticeWordModal from "@/components/PraticeWordModal";
import GoToHomeButton from "@/components/GoToHomeButton";
import CustomButton from "@/components/HeadlessButton";

export default async function WordsPage({
  listId,
}: {
  listId: string;
}) {
  // All hub data in one parallel round (started early by the page via preload);
  // quiz data is included so the quiz tab is instant
  const {
    total,
    studiedWordCount,
    studiedSyllableWord,
    totalGroupsCount,
    totalStudiedGroups,
    wordStrings,
    quizData,
    flashCardsExist,
    scrambleWordsExist,
  } = await getPracticeHubData(parseInt(listId));
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
            initialFlashCardsExist={flashCardsExist}
            initialScrambleWordsExist={scrambleWordsExist}
          />
        </div>
        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
          <GoToHomeButton />
        </div>
      </div>
    </div>
  );
}
