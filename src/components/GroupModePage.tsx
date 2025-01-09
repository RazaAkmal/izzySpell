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

const GroupModePage: React.FC<GroupModePageProps> = ({
  listId,
  groupedWords,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  console.log("pages", currentPage);

  // Group words by groupName
  const groups = groupedWords.reduce((acc, word) => {
    if (!acc[word.groupName]) {
      acc[word.groupName] = [];
    }
    acc[word.groupName].push(word);
    return acc;
  }, {} as Record<string, GroupedWord[]>);

  const validGroups = Object.keys(groups).filter(
    (groupName) => groups[groupName].length > 1
  );
  console.log("valid", validGroups);

  // State to manage the current group index
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const currentGroupName = validGroups[currentGroupIndex];
  const currentGroup = groups[currentGroupName] || [];
  console.log("current words", currentGroup);

  // State for user inputs corresponding to the current group's words
  const [userInputs, setUserInputs] = useState<string[][]>(
    groupedWords.map((word) => Array(word.word.length).fill(""))
  );

  const [validationStates, setValidationStates] = useState<string[][]>(
    groupedWords.map((word) => Array(word.word.length).fill("default"))
  );

  const handleInputChange = (
    rowIndex: number,
    boxIndex: number,
    value: string
  ) => {
    const updatedInputs = [...userInputs];
    updatedInputs[rowIndex][boxIndex + 2] = value.slice(-1); // Offset by 2 due to pre-filled letters
    setUserInputs(updatedInputs);

    //  word is fully type or not
    const word = currentGroup[rowIndex].word;
    const userWord = [
      ...word.slice(0, 2),
      ...updatedInputs[rowIndex].slice(2),
    ].join("");

    const updatedValidation = [...validationStates];
    if (userWord.length === word.length) {
      updatedValidation[rowIndex] =
        word === userWord
          ? Array(word.length).fill("valid")
          : Array(word.length).fill("invalid");
    } else {
      // Reset to default during typing
      updatedValidation[rowIndex][boxIndex + 2] = "default";
    }
    setValidationStates(updatedValidation);
  };

  const handleSpeak = (word: string) => {
    if (word) {
      const utterance = new SpeechSynthesisUtterance(word);
      speechSynthesis.speak(utterance);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= validGroups.length) {
      setCurrentGroupIndex(page - 1);
      setCurrentPage(page);
    }
  };

  //reset buttonn
  const handleReset = (rowIndex: number) => {
    const updatedInputs = [...userInputs];
    updatedInputs[rowIndex] = Array(currentGroup[rowIndex].word.length).fill(
      ""
    );
    setUserInputs(updatedInputs);

    const updatedValidation = [...validationStates];
    updatedValidation[rowIndex] = Array(
      currentGroup[rowIndex].word.length
    ).fill("default");
    setValidationStates(updatedValidation);
  };

  return (
    <div className="bg-skyBlue m-5 max-h-max rounded-md p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Icon */}
        <Image
          src="/images/settingIcon.svg"
          alt="Settings Icon"
          width={24}
          height={24}
          className="w-8 h-8"
        />

        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple text-center">
          Word Group Mode
        </p>
        <Button
          className="focus:outline-none"
          onClick={() => router.push(`/spellPractice/${listId}`)}
        >
          <Image
            src="/images/Vector.svg"
            alt="Cancel Button"
            width={24}
            height={24}
            className="w-8 h-8"
          />
        </Button>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <CustomPagination
          currentPage={currentPage}
          totalPages={validGroups.length}
          onPageChange={handlePageChange}
        />
      </div>

      <p className="text-xl text-darkBlue mb-6 text-center mt-7">
        Tap the speaker to hear the word, then type it below.
      </p>

      <div className="space-y-6 text-darkBlue">
        {/* Render current group of words */}
        {currentGroup.map((word, rowIndex) => (
          <div
            className="flex flex-wrap items-center justify-start flex-row md:justify-center gap-4"
            key={rowIndex}
          >
            {/* letters already shown at the start */}
            {word.word
              .split("")
              .slice(0, 2)
              .map((letter, index) => (
                <div
                  className="w-12 h-12 flex items-center justify-center border-[3px] border-darkGreen bg-gray-100 rounded-lg font-bold text-2xl"
                  key={index}
                >
                  {letter}
                </div>
              ))}

            {/* Input Boxes */}
            {Array.from({ length: word.word.length - 2 }).map((_, boxIndex) => (
              <input
                type="text"
                key={boxIndex}
                maxLength={1}
                value={userInputs[rowIndex][boxIndex + 2]}
                onChange={(e) =>
                  handleInputChange(rowIndex, boxIndex, e.target.value)
                }
                className={`w-12 h-12 text-center border-[3px] rounded-lg text-2xl border-darkGreen font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  validationStates[rowIndex][boxIndex + 2] === "valid"
                    ? "border-green-500"
                    : validationStates[rowIndex][boxIndex + 2] === "invalid"
                    ? "border-red-500"
                    : "border-lightGreen "
                }`}
              />
            ))}

            {/* Speaker Button */}
            
              <Button
                className="focus:outline-none"
                onClick={() => handleSpeak(word.word)}
              >
                <Image
                  src="/images/speakerIcon.svg"
                  alt="Speaker"
                  width={32}
                  height={32}
                  className="w-12 h-12 cursor-pointer"
                />
              </Button>
              <div
                className="mt-1 mb-12 m-4
            "
              >
                {validationStates[rowIndex].every(
                  (state) => state === "valid"
                ) ? (
                  <Image
                    src="/images/completeIcon.svg"
                    alt="Correct"
                    width={44}
                    height={44}
                    className="absolute "
                  />
                ) : validationStates[rowIndex].includes("invalid") ? (
                  <Button onClick={() => handleReset(rowIndex)}>
                    <Image
                      src="/images/resetIcon.svg"
                      alt="Reset"
                      width={35}
                      height={35}
                      className="absolute "
                    />
                  </Button>
                ) : null}
              </div>
            </div>
        
        ))}
      </div>
    </div>
  );
};

export default GroupModePage;
