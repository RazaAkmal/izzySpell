"use server";

import { getWordsByListId } from "@/app/actions/prismaActions";
import PracticeWordModal from "@/components/PraticeWordModal";
import GoToHomeButton from "@/components/GoToHomeButton";
import CustomButton from "@/components/HeadlessButton";

export default async function WordsPage({
  listId,
}: {
  listId: string;
}) {
  const { total } = await getWordsByListId(parseInt(listId));

  return (
    <div className="bg-skyBlue m-3 rounded-md p-6">
       

      <div className="w-full flex flex-col lg:flex-row lg:items-start  justify-between items-center gap-4">
        <CustomButton
          label={`Words: ${total}`}
          size="small"
          variant="success"
          radius="rounded"
          img="/images/AlphaIcon.svg"
          className="cursor-default"
        />
        <PracticeWordModal />
        <GoToHomeButton />
      </div>
    </div>
  );
}
