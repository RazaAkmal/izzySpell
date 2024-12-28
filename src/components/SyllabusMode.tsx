"use client";

import React, { useState } from "react";
import Image from "next/image";
import { syllableData } from "@/app/syllableData";
import CustomPagination from "./CustomPagination";
import { Word } from "@prisma/client";
import { useRouter } from "next/navigation";

interface SyllabusModePageProps {
  listId: string;
  words: Word[];
}

const SyllabusModePage: React.FC<SyllabusModePageProps> = ({
  listId,
  words,
}) => {
  const syllableWords = words.map((word) => word.word);
  console.log("syllableWords", syllableWords);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [syllableBoxes, setSyllableBoxes] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);

  const router = useRouter();
  const currentWord = syllableWords[currentPage - 1];
  const options = syllableData[currentPage - 1];
  console.log("options", options);

  const handleOptionClick = (optionId: number) => {
    setSelectedOption(optionId);
    setSyllableBoxes(currentWord.split(""));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resetState();
  };

  const resetState = () => {
    setSelectedOption(null);
    setSyllableBoxes(["", "", "", "", ""]);
  };

  //for speaker icon functional
  const handleSpeak = () => {
    const wordToSpeak = syllableBoxes.join("");
    if (wordToSpeak) {
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <div className="bg-skyBlue m-7 p-10 rounded-lg shadow-lg">
        <div className="w-full flex items-center justify-between mb-4">
          {/* Title centered */}
          <p className="text-4xl font-bold text-center w-full">Syllabus Mode</p>

          <button className="absolute right-32 focus:outline-none">
            <Image
              src="/images/Vector.svg"
              alt="Cancel Button"
              width={24}
              height={24}
              className="w-10 h-10 mb-4"
              onClick={() => router.push(`/spellPractice/${listId}`)}
            />
          </button>
        </div>
        <div className="mt-6">
          <CustomPagination
            currentPage={currentPage}
            totalPages={syllableWords.length}
            onPageChange={handlePageChange}
          />
        </div>
        <div className="flex flex-col items-center mt-4">
          <p className="font-semibold text-2xl mb-2 text-gray-700">
            Please choose the correct syllable word below.
          </p>

          {/* Syllable Boxes */}
          <div className="flex gap-5 justify-center items-center ml-20">
            <div className="flex gap-2 p-5 rounded-2xl bg-white mb-4 border-darkGreen border-2">
              {syllableBoxes.map((letter, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 md:w-16 md:h-16 border-2 border-darkGreen rounded-xl flex items-center justify-center ${
                    letter ? "bg-darkGreen" : "bg-greenLite"
                  }`}
                >
                  <span className="text-2xl font-bold text-white">
                    {letter}
                  </span>
                </div>
              ))}
            </div>
            <button className="focus:outline-none" onClick={handleSpeak}>
              <Image
                src="/images/speakerIcon.svg"
                alt="Speaker"
                width={32}
                height={32}
                className="w-16 h-16 cursor-pointer mb-5"
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`w-full px-10 py-4 border-2 rounded-2xl text-3xl text-center font-semibold ${
                    selectedOption === index
                      ? "bg-green border-green"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {currentWord}
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SyllabusModePage;
