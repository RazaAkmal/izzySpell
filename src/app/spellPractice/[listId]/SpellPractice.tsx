"use server";

import { getWordCountForEachExercise } from "@/app/actions/prismaActions";
import PracticeWordModal from "@/components/PraticeWordModal";
import GoToHomeButton from "@/components/GoToHomeButton";
import CustomButton from "@/components/HeadlessButton";

export default async function WordsPage({
  listId,
}: {
  listId: string;
}) {
  const { total, studiedWordCount, studiedSyllableWord, studiedGroupCount, totalGroups } = await getWordCountForEachExercise(parseInt(listId));
  const validTotalGroups = totalGroups.filter(group => group._count.word > 1);
  const validStudiedGroups = studiedGroupCount.filter(group => group._count.word > 1);
  const totalStudiedGroups = validStudiedGroups.length;
  const totalGroupsCount = validTotalGroups.length;
  const groupedProgress = totalGroupsCount > 0
    ? (totalStudiedGroups / totalGroupsCount) * 100
    : 0;
  return (
    <div className="min-h-[75vh] flex flex-col items-center gap-6 bg-skyBlue rounded-md p-6 mx-4 md:mx-8 lg:mx-7">
      <div className="w-full flex flex-col lg:flex-row lg:items-start justify-between items-center gap-4">
        <CustomButton
          label={`Words: ${total}`}
          size="small"
          variant="success"
          radius="rounded"
          img="/images/AlphaIcon.svg"
          className="cursor-default"
        />
        <PracticeWordModal totalGroups={totalGroupsCount} totalStudiedGroups={totalStudiedGroups} totalWords={total} studiedCount={studiedWordCount} studiedSyllableCount={studiedSyllableWord} studiedGroupCount={Math.round(groupedProgress)} />
        <GoToHomeButton />
      </div>
    </div>
  );
}
