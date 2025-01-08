"use client";

import React, { useEffect, useState, useCallback } from "react";
import CustomPagination from "./CustomPagination";
import Image from "next/image";
import CustomButton from "./HeadlessButton";
import { Button } from "@headlessui/react";
import { Word } from "@prisma/client";
import TextToSpeech from "./TextToSpeach";
import { useRouter } from "next/navigation";

interface DefaultModePageProps {
  words: Word[];
  listId: string;
}

const DefaultModePage: React.FC<DefaultModePageProps> = ({ words, listId }) => {
  const wordsSpell = words.map((word) => word.word);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(true);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);

  const currentWord = wordsSpell[currentPage - 1];

  const scrambleWord = useCallback((word: string): string[] => {
    const letters = [...word];
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedLetter([]);
    setIsCorrect(true);
  };

  const validateWord = (letters: string[]) => {
    if (letters.length === currentWord.length) {
      const isMatching = currentWord === letters.join("");
      setIsCorrect(isMatching);
      if (isMatching) {
        setTimeout(() => {
          setCurrentPage((prevPage) => prevPage + 1);
          setSelectedLetter([]);
        }, 1000);
      }
    }
  };

  const handleLetterClick = (letter: string) => {
    if (selectedLetter.length < currentWord.length) {
      const updatedLetters = [...selectedLetter, letter];
      setSelectedLetter(updatedLetters);
      setScrambledLetters((prevScrambled) =>
        prevScrambled.filter(
          (l, index) => index !== prevScrambled.indexOf(letter)
        )
      );
      validateWord(updatedLetters);
    }
  };

  const handleReset = () => {
    setSelectedLetter([]);
    setIsCorrect(true);
    if (currentWord) {
      setScrambledLetters(scrambleWord(currentWord)); // Re-scramble the current word
    }
  };

  useEffect(() => {
    if (currentWord) {
      setScrambledLetters(scrambleWord(currentWord));
    }
  }, [currentWord, scrambleWord]);

  return (
    <div className="bg-skyBlue m-7 mt-1 p-6 rounded-lg shadow-lg">
  <div className="w-full flex flex-wrap items-center justify-between gap-4 px-4 sm:px-8 mb-4">
  {/* Custom Button */}
  <CustomButton
    label={`Page ${currentPage} / ${wordsSpell.length}`}
    variant="success"
    size="small"
    img="/images/bookIcon.svg"
    className="w-fit"
  />

  {/* Title */}
  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-center flex-1">
    Word Group Mode
  </p>

  {/* Cancel Button */}
  <Button
    className="focus:outline-none sm:block items-center justify-center hidden"
    onClick={() => router.push(`/spellPractice/${listId}`)}
  >
    <Image
      src="/images/Vector.svg"
      alt="Cancel Button"
      width={24}
      height={24}
      className="w-6 h-6 sm:w-8 sm:h-8"
    />
  </Button>
</div>



      <div className="flex flex-col items-center space-y-6">
        <CustomPagination
          currentPage={currentPage}
          totalPages={wordsSpell.length}
          onPageChange={handlePageChange}
        />
        {currentWord && (
          <>
            <p className="text-center font-semibold text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 text-gray-700">
              Click on a letter to add it to the box and create the word!
            </p>

            <div className="flex flex-col justify-center md:flex-row items-center gap-6 md:gap-10 w-full max-w-4xl">
              <div
                className={`flex flex-wrap gap-1 sm:gap-4 p-1 sm:p-3 rounded-lg md:rounded-xl bg-white ${
                  isCorrect ? "border-darkGreen" : "border-red-500"
                }`}
              >
                {Array.from({ length: currentWord.length }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 md:w-14 md:h-14  border-2 border-darkGreen rounded-xl flex items-center justify-center shadow-md ${
                      selectedLetter[i] ? "bg-darkGreen" : "bg-greenLite"
                    }`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {selectedLetter[i] || ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  {!isCorrect && (
                    <button
                      onClick={handleReset}
                      className="absolute  top-[-25px] left-0 flex items-center justify-center w-10 h-10 md:w-14 bg-red-500 ml-20 md:m-2 mt-2  rounded-2xl"
                    >
                      <Image
                        src="/images/resetIcon.svg"
                        alt="Reset"
                        width={30}
                        height={30}
                        className="w-8 h-8  md:w-8"
                      />
                    </button>
                  )}
                </div>

                {isCorrect && selectedLetter.length === currentWord.length && (
                  <button className="flex absolute ml-20 items-center justify-center w-14 h-14 bg-green text-white font-bold text-lg rounded-full hover:scale-110">
                    <Image
                      src="/images/completeIcon.svg"
                      alt="OK"
                      width={30}
                      height={30}
                      className="w-10 h-10"
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4  ">
              {scrambledLetters.map((letter, index) => (
                <div
                  key={index}
                  className="w-10 h-10 md:w-16 md:h-16 bg-lightGreen border-[3px] border-darkGreen text-white font-bold text-2xl md:text-3xl flex items-center justify-center rounded-2xl cursor-pointer hover:bg-teal-600 shadow-md"
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                </div>
              ))}
            </div>

            <div>
              <TextToSpeech heightWidth={60} spell={currentWord} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DefaultModePage;
