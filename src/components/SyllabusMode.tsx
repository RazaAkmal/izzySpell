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
  ]);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [options, setOptions] = useState<string[]>([]); // State to hold the syllable options

  const router = useRouter();
  const orignalWord = syllableWords[currentPage - 1]?.word || "";
  const currentWord = syllableWords[currentPage - 1]?.syllables || "";
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
    if (!correctSyllable) return [];
    const wrongSyllables = generateWrongSyllables(correctSyllable);
    return [correctSyllable, ...wrongSyllables];
  };

  // Set the options only when the page is loaded or when the current word changes
  useEffect(() => {
    if (syllableWords.length > 0) {
      const generatedOptions = createOptions();
      setOptions(generatedOptions);
    }
  }, [currentPage, syllableWords, correctSyllable]);

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
  useEffect(() => {
    console.log("Current Page:", currentPage);
    console.log("Syllable Words:", syllableWords);
    console.log("Options:", options);
  }, [currentPage, syllableWords, options]);

  return (
    <>
      <div className="bg-skyBlue m-7 p-10 rounded-lg shadow-lg">
        <div className="w-full flex flex-row  sm:flex-row items-center justify-between mb-4 relative">
        
          <p className="text-2xl sm:text-4xl font-bold text-center w-full text-purple">
            Syllabus Mode
          </p>

      
          <button
            className="mt-2 sm:mt-0 sm:absolute sm:right-8 focus:outline-none"
            onClick={() => router.push(`/spellPractice/${listId}`)}
          >
            <Image
              src="/images/Vector.svg"
              alt="Cancel Button"
              width={24}
              height={24}
              className="w-6 h-6 sm:w-8 sm:h-8 mb-1"
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

        <div className="flex flex-col justify-center items-center mt-4 px-4">
        
          <p className="text-center font-semibold text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 text-gray-700">
            Please choose the correct syllable word below.
          </p>

      
          <div className="flex flex-col justify-center md:flex-row items-center gap-6 md:gap-10 w-full max-w-4xl">
          
            <div
              className={`flex flex-wrap gap-1 sm:gap-4 p-1 sm:p-3 sm:ml-20 rounded-lg md:rounded-xl bg-white ${
                isCorrectAnswer === null
                  ? "border-darkGreen"
                  : isCorrectAnswer
                  ? "border-green"
                  : "border-red-500"
              } border-2 md:border-4 w-full md:w-auto justify-center`}
            >
              {syllableBoxes.map((letter, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border-2 ${
                    isCorrectAnswer === null
                      ? "border-darkGreen"
                      : isCorrectAnswer
                      ? "border-green"
                      : "border-red-500"
                  } rounded-lg md:rounded-xl flex items-center justify-center ${
                    letter ? "bg-darkGreen" : "bg-greenLite"
                  }`}
                >
                  <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white">
                    {letter}
                  </span>
                </div>
              ))}
            </div>

          
            <div className="flex justify-center">
              <TextToSpeech heightWidth={70} spell={orignalWord} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-3 px-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index, option)}
                className={`text-darkBlue px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold ${
                  selectedOption === index
                    ? isCorrectAnswer
                      ? "bg-green border-green text-white"
                      : "bg-red-500 border-red-500 text-white"
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
