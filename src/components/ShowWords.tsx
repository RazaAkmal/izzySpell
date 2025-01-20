"use client";
import React, { useState } from "react";
import Image from "next/image";
import CustomButton from "@/components/HeadlessButton";
import { useParams, useRouter } from "next/navigation";
import { SpellingList, Word } from "@prisma/client";

type Props = {
  spellingListWithWords:
    | (SpellingList & {
        words: Word[];
      })
    | null;
};

const UserList = ({ spellingListWithWords }: Props) => {
  const router = useRouter();
  const [filter, setFilter] = useState<"remaining" | "completed">("remaining");

  const handleBack = () => {
    router.back();
  };

  const { listId } = useParams();

  const handleContinueLearning = () => {
    router.push(`/spellPractice/${listId}`);
  };

  // Filter words based on the selected filter
  const filteredWords = spellingListWithWords?.words.filter((word) =>
    filter === "remaining" ? !word.studied : word.studied
  );

  return (
    <>
      <div className="flex md:flex-row flex-col ">
        {/* Back Arrow */}
        <div className="flex items-center m-4">
          <Image
            src={"/images/backArrow.svg"}
            alt="Back Arrow"
            width={20}
            height={20}
            className="h-12 w-12 cursor-pointer"
            onClick={handleBack}
          />
          <button
            className="ml-2 text-lg font-semibold text-gray-600 cursor-pointer"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
        <div className="flex gap-5 mx-auto md:flex-row flex-col justify-center items-center">
          <CustomButton
            fullWidth={false}
            radius="rounded"
            label="Remaining Words"
            img="/images/notesIcon.svg"
            variant={`${filter === "remaining" ? "primary" : "secondary"}`}
            onClick={() => setFilter("remaining")}
          />

          <CustomButton
            fullWidth={false}
            label="Completed Words"
            radius="rounded"
            variant={`${filter === "completed" ? "primary" : "secondary"}`}
            img="/images/notesIcon.svg"
            onClick={() => setFilter("completed")}
          />
        </div>
        <CustomButton
          fullWidth={false}
          label="Continue Learning"
          size="small"
          radius="square"
          variant="success"
          onClick={handleContinueLearning} // Call the handler on click
        />
      </div>
      <div className="p-4 px-1 m-3 min-h-full bg-skyBlue rounded-md">
        <h2 className="text-center text-xl font-bold text-purple mb-4">
          {spellingListWithWords?.listName}
        </h2>
        <div className="grid md:grid-cols-3 grid-cols-2 gap-3 overflow-auto h-auto max-h-screen p-5 ">
          {filteredWords?.map((spell) => (
            <div
              key={spell.id}
              className="flex items-center justify-start bg-white rounded-2xl shadow-md p-3  "
            >
              <span className="text-green bg-green bg-opacity-25 opacity-45 rounded-full text-center h-8 w-8 border-2 border-green font-bold mr-3">
                {spell.id}
              </span>
              <span className="text-gray-700 font-semibold">{spell.word}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UserList;
