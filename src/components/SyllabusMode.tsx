"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import CustomPagination from "./CustomPagination";
import { SyllableWord } from "@prisma/client";
import { useRouter } from "next/navigation";
import TextToSpeech from "./TextToSpeach";

interface SyllabusModePageProps {
  listId: string;
  syllableWords: SyllableWord[];
}

const SyllabusModePage: React.FC<SyllabusModePageProps> = ({
  listId,
  syllableWords,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [syllableBoxes, setSyllableBoxes] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [options, setOptions] = useState<string[]>([]); // State to hold the syllable options

  const router = useRouter();
  const orignalWord = syllableWords[currentPage - 1].word;
  const currentWord = syllableWords[currentPage - 1].syllables;
  const correctSyllable = currentWord;

  // Generate wrong syllables based on the correct syllable
  const generateWrongSyllables = (correctSyllable: string) => {
    const word = correctSyllable.replace(/-/g, ""); // Remove the dash to get the raw word
    const wrongSyllables = new Set<string>();

    while (wrongSyllables.size < 3) {
      const splitPoint = Math.floor(Math.random() * (word.length - 1)) + 1; // Random split point
      const newSyllable =
        word.substring(0, splitPoint) + "-" + word.substring(splitPoint);

      // Ensure the new syllable is unique and not the same as the correct one
      if (newSyllable !== correctSyllable && !wrongSyllables.has(newSyllable)) {
        wrongSyllables.add(newSyllable);
      }
    }

    return Array.from(wrongSyllables);
  };

  // Create the options array (1 correct syllable + 3 wrong syllables)
  const createOptions = () => {
    const wrongSyllables = generateWrongSyllables(correctSyllable);
    console.log(wrongSyllables);
    const allOptions = [correctSyllable, ...wrongSyllables];
    return allOptions;
  };

  // Set the options only when the page is loaded or when the current word changes
  useEffect(() => {
    const generatedOptions = createOptions();
    setOptions(generatedOptions);
  }, [currentPage, syllableWords]);

  const handleOptionClick = (optionId: number, option: string) => {
    setSelectedOption(optionId);
    setSyllableBoxes(option.split(""));
    checkAnswer(option);
  };

  const checkAnswer = (selectedOption: string) => {
    if (selectedOption === correctSyllable) {
      setIsCorrectAnswer(true); // Correct answer
    } else {
      setIsCorrectAnswer(false); // Wrong answer
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resetState();
  };

  const resetState = () => {
    setSelectedOption(null);
    setIsCorrectAnswer(null); // Reset the answer status
    setSyllableBoxes(["", "", "", "", ""]);
  };

  return (
    <>
      <div className="bg-skyBlue m-7 p-10 rounded-lg shadow-lg">
        <div className="w-full flex  md:flex-row items-center justify-between mb-4">
          <p className="text-2xl md:text-4xl md:ml-8 font-bold text-center w-full text-purple">
            Syllabus Mode
          </p>
          <button
            className="  md:ml-4 focus:outline-none"
            onClick={() => router.push(`/spellPractice/${listId}`)}
          >
            <Image
              src="/images/Vector.svg"
              alt="Cancel Button"
              width={24}
              height={24}
              className="w-8 h-8"
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
          <p className="text-lg text-center mt-3  font-semibold md:text-2xl mb-3 text-gray-700">
            Please choose the correct syllable word below.
          </p>

          {/* Syllable Boxes */}
          <div className="flex flex-wrap gap-2 justify-center  md:ml-20">
            <div
              className={`flex flex-wrap gap-1 md:p-4 p-2 rounded-2xl bg-white mb-4 ${
                isCorrectAnswer === null
                  ? "border-darkGreen"
                  : isCorrectAnswer
                  ? "border-green"
                  : "border-red-500"
              } border-4`}
            >
              {syllableBoxes.map((letter, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 md:w-16 md:h-16 border-2 border-darkGreen rounded-xl flex items-center justify-center  ${
                    isCorrectAnswer === null
                      ? "border-darkGreen"
                      : isCorrectAnswer
                      ? "border-green"
                      : "border-red-500"
                  } rounded-xl flex items-center justify-center ${
                    letter ? "bg-darkGreen" : "bg-greenLite"
                  }`}
                >
                  <span className="text-2xl font-bold text-white">
                    {letter}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <TextToSpeech heightWidth={80} spell={orignalWord}  />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index, option)}
                className={`text-darkBlue w-full px-4 py-3 border-2 rounded-2xl text-xl text-center font-semibold sm:text-2xl lg:text-3xl ${
                  selectedOption === index
                    ? isCorrectAnswer
                      ? "bg-green border-green"
                      : "bg-red-500 border-red-500"
                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SyllabusModePage;
