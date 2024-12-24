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
        setCurrentPage((prevPage) => prevPage + 1);
        setSelectedLetter([]);
      }
    }
  };

  const handleLetterClick = (letter: string) => {
    if (selectedLetter.length < currentWord.length) {
      const updatedLetters = [...selectedLetter, letter];
      setSelectedLetter(updatedLetters);
      setScrambledLetters((prevScrambled) =>
        prevScrambled.filter((l, index) => index !== prevScrambled.indexOf(letter))
      );
      validateWord(updatedLetters);
    }
  };

  useEffect(() => {
    if (currentWord) {
      setScrambledLetters(scrambleWord(currentWord));
    }
  }, [currentWord, scrambleWord]);

  return (
    <div className="bg-skyBlue m-7 mt-1 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <CustomButton
          label={`Page ${currentPage} / ${wordsSpell.length}`}
          variant="success"
          size="small"
          img="/images/bookIcon.svg"
        />
        <Image
          src="/images/titles/Default Mode.svg"
          alt="Default title"
          width={250}
          height={24}
          className="mr-40"
        />
        <Button className="focus:outline-none">
          <Image
            src="/images/Vector.svg"
            alt="Cancel Button"
            width={30}
            height={30}
            onClick={() => router.push(`/spellPractice/${listId}`)}
          />
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <CustomPagination
          currentPage={currentPage}
          totalPages={wordsSpell.length}
          onPageChange={handlePageChange}
        />

        <p className="text-2xl font-bold text-darkBlue text-center">
          Click on a letter to add it to the box and create the word!
        </p>

        <div
          className={`flex border-[3px] rounded-2xl p-4 bg-white justify-center gap-3 mb-6 ${
            isCorrect ? "border-darkGreen" : "border-red-500"
          }`}
        >
          {Array.from({ length: currentWord.length }).map((_, i) => (
            <div
              key={i}
              className={`w-14 h-14 border-2 border-darkGreen rounded-xl flex items-center justify-center shadow-md ${
                selectedLetter[i] ? "bg-darkGreen" : "bg-greenLite"
              }`}
            >
              <span className="text-2xl font-bold text-white">
                {selectedLetter[i] || ""}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {scrambledLetters.map((letter, index) => (
            <div
              key={index}
              className="w-16 h-16 bg-lightGreen border-[3px] border-darkGreen text-white font-bold text-3xl flex items-center justify-center rounded-2xl cursor-pointer hover:bg-teal-600 shadow-md"
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </div>
          ))}
        </div>

        <div>
          <TextToSpeech heightWidth={60} spell={currentWord} />
        </div>
      </div>
    </div>
  );
};

export default DefaultModePage;
