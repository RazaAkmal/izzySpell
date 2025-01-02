"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import { GroupedWord } from "@prisma/client";
import { useRouter } from "next/navigation";
import CustomPagination from "./CustomPagination";

interface GroupModePageProps {
  listId: string;
  groupedWords: GroupedWord[];
}

const GroupModePage: React.FC<GroupModePageProps> = ({ listId, groupedWords }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Group words by groupName
  const groups = groupedWords.reduce((acc, word) => {
    if (!acc[word.groupName]) {
      acc[word.groupName] = [];
    }
    acc[word.groupName].push(word);
    return acc;
  }, {} as Record<string, GroupedWord[]>);

  const groupNames = Object.keys(groups);

  // State to manage the current group index
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const currentGroupName = groupNames[currentGroupIndex];
  const currentGroup = groups[currentGroupName] || [];

  // State for user inputs corresponding to the current group's words
  const [userInputs, setUserInputs] = useState<string[][]>(
    groupedWords.map((word) => Array(word.word.length).fill(""))
  );

  const handleInputChange = (
    rowIndex: number,
    boxIndex: number,
    value: string
  ) => {
    const updateInputs = [...userInputs];
    updateInputs[rowIndex][boxIndex] = value.slice(-1)
    setUserInputs(updateInputs);
  };

  const handleSpeak = (word: string) => {
    if (word) {
      const utterance = new SpeechSynthesisUtterance(word);
      speechSynthesis.speak(utterance);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentGroupIndex(page)
    setCurrentPage(page);
  };

  return (
    <div className="bg-skyBlue m-5 max-h-max rounded-md p-6 ">
      <div className="w-full flex flex-wrap justify-between items-center mb-4 gap-4">
        <Image
          src="/images/settingIcon.svg"
          alt="Cancel Button"
          width={24}
          height={24}
          className="w-8 h-8"
        />
        <p className="text-3xl font-bold ">Word Group Mode</p>

        <Button className="focus:outline-none" onClick={() => router.push(`/spellPractice/${listId}`)}>
          <Image
            src="/images/Vector.svg"
            alt="Cancel Button"
            width={24}
            height={24}
            className="w-8 h-8"
          />
        </Button>
      </div>
      <div className="mt-6">
          <CustomPagination
            currentPage={currentPage}
            totalPages={groupNames.length}
            onPageChange={handlePageChange}
          />
        </div>
      <p className="text-xl text-darkBlue mb-6 text-center">
        Tap the speaker to hear the word, then type it below.
      </p>
      <div className="space-y-6 ">
        {currentGroup.map((word, rowIndex) => (
          <div
            className="flex items-center justify-center gap-4 "
            key={rowIndex}
          >
            {/* letter alreday Show at the start */}
            {word.word
              .split("")
              .slice(0, 2)
              .map((letter, index) => (
                <div
                  className="w-12 h-12 flex items-center justify-center border-[3px] border-darkGreen bg-gray-100 rounded-lg font-bold text-2xl "
                  key={index}
                >
                  {letter}
                </div>
              ))}

            {/* input Boxes */}
            {Array.from({ length: word.word.length - 2 }).map((_, boxIndex) => (
              <input
                type="text"
                key={boxIndex}
                maxLength={1}
                value={userInputs[rowIndex][boxIndex]}
                onChange={(e) =>
                  handleInputChange(rowIndex, boxIndex, e.target.value)
                }
                className="w-12 h-12 text-center border-[3px] border-darkGreen rounded-lg text-2xl font-bold  focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            ))}

            {/* Speaker Button */}
            <Button className="focus:outline-none" onClick={()=>handleSpeak(word.word)}>
              <Image
                src="/images/speakerIcon.svg"
                alt="Speaker"
                width={32}
                height={32}
                className="w-12 h-12 cursor-pointer"
              />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupModePage;
