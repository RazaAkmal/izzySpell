"use server";

import Image from "next/image";
import { getWordsByListId } from "@/app/actions/prismaActions";
import SpellPracticePagination from "@/app/spellPractice/[listId]/SpellPracticePagination";
import CustomButton from "@/components/HeadlessButton";
import TextToSpeech from "@/components/TextToSpeach";
import PracticeWordModal from "@/components/PraticeWordModal";
import MarkAsStudiedButton from "@/components/MarkAsStudiedButton";
import GoToHomeButton from "@/components/GoToHomeButton";

export default async function WordsPage({
  listId,
  page,
}: {
  listId: string;
  page: number;
}) {
  const { words, total, pageSize } = await getWordsByListId(
    parseInt(listId),
    page
  );

  const totalPages = Math.ceil(total / pageSize);
  const wordIds = words.map((word) => word.id);

  return (
    <div className="bg-skyBlue m-3 max-h-max rounded-md p-6">
      <div className="w-full flex flex-col lg:flex-row flex-wrap justify-between items-center gap-4">
        <div className="flex-shrink-0">
          <CustomButton
            label={`Page ${page} / ${totalPages}`}
            variant="success"
            size="small"
            radius="rounded"
            img="/images/bookIcon.svg"
            className="cursor-default"
          />
          <CustomButton
            label={`Words: ${total}`}
            size="small"
            variant="success"
            radius="rounded"
            img="/images/AlphaIcon.svg"
            className="cursor-default"
          />
        </div>

        <div className="flex-grow">
          <SpellPracticePagination
            listId={listId}
            totalPages={totalPages}
            page={page}
          />
        </div>

        <div className="flex flex-col">
          <MarkAsStudiedButton wordIds={wordIds} />
          <GoToHomeButton />
        </div>
      </div>

      <div className="flex justify-center ">
        <Image
          alt=" Words to Practice"
          width={450}
          height={450}
          src="/images/titles/Here Are Your Words to Practice.svg"
        />
      </div>
      <div className="flex flex-col space-y-3">
        {words.length > 0 ? (
          words.map((word, index) => (
            <div
              key={index}
              className="bg-white border-[2px] border-darkGreen rounded-2xl shadow-md p-2 flex gap-2 items-center justify-center max-w-full mx-auto flex-wrap"
            >
              {word.word.split("").map((letter, letterIndex) => (
                <div
                  key={letterIndex}
                  className="text-white text-xl border-2 border-darkGreen bg-lightGreen font-bold px-4 py-2 rounded-xl flex justify-center items-center"
                >
                  {letter}
                </div>
              ))}
              <TextToSpeech heightWidth={48} spell={word.word} />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            No words available on this page.
          </p>
        )}
        <PracticeWordModal page={page} />
      </div>
    </div>
  );
}
