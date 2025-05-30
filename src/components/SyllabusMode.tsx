"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import CustomPagination from "./CustomPagination";
import { SyllableWord } from "@prisma/client";
import { useRouter } from "next/navigation";
import TextToSpeech from "./TextToSpeach";
import ConfirmationModal from "./ConfirmationModal";
import { markSyllableWordsAsStudied } from "@/app/actions/prismaActions";

interface SyllabusModePageProps {
  listId: number;
  syllableWords: SyllableWord[];
  studiedWordCount: number;
}

const SyllabusModePage: React.FC<SyllabusModePageProps> = ({
  listId,
  syllableWords,
  studiedWordCount
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(studiedWordCount || 1);
  const [highestReachedPage, setHighestReachedPage] = useState(studiedWordCount || 1);
  const correctSyllable = syllableWords[currentPage - 1].answer;
  const orignalWord = syllableWords[currentPage - 1].word;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [syllableBoxes, setSyllableBoxes] = useState<string[]>(
    new Array(correctSyllable.length).fill("")
  );
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shuffleAnswers = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
useEffect(() => {
    // Check and handle the start parameter on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const startParam = params.get('start');
      
      if (startParam === '0') {
        setCurrentPage(1);
        setHighestReachedPage(1);
      }

      // Remove the start parameter from URL
      if (startParam && window.history) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('start');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  useEffect(() => {
    const generatedOptions = syllableWords.filter(
      (syllableWord) => syllableWord.answer === correctSyllable
    );
    const allOptions: string[] = generatedOptions
      .map((syllableWord) => syllableWord.options)
      .flat() as string[];
    const shuffledOptions = shuffleAnswers(allOptions);

    setSyllableBoxes(new Array(correctSyllable.length).fill(""));
    setOptions(shuffledOptions);
  }, [syllableWords, correctSyllable]);

  const handleOptionClick = (optionId: number, option: string) => {
    setSelectedOption(optionId);
    setSyllableBoxes(option.split(""));
    checkAnswer(option);
  };

  const checkAnswer = (selectedOption: string) => {
    if (selectedOption === correctSyllable) {
      setIsCorrectAnswer(true);
      // Update highest reached page when answer is correct
      if (currentPage < syllableWords.length) {
        setHighestReachedPage(prev => Math.max(prev, currentPage + 1));
      }
      setTimeout(() => {
        setCurrentPage((prevPage) => prevPage + 1);
        setSelectedOption(null);
        setIsCorrectAnswer(null);
      }, 2000);
    } else {
      setIsCorrectAnswer(false);
    }
  };

  const handlePageChange = (page: number) => {
    // Only allow navigation to pages up to the highest reached page
    if (page >= 1 && page <= syllableWords.length && page <= highestReachedPage) {
      setCurrentPage(page);
      setSelectedOption(null);
      setIsCorrectAnswer(null);
    }
  };

  return (
    <>
      <div className="bg-skyBlue m-7 p-10 rounded-lg shadow-lg">
        <div className="w-full flex  md:flex-row items-center justify-between mb-4">
          <p className="text-2xl md:text-4xl md:ml-8 font-bold text-center w-full text-purple">
            Syllables Mode
          </p>
          <button
            className="md:ml-4 focus:outline-none"
            onClick={() => setShowConfirmation(true)}
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
            highestReachedPage={highestReachedPage}
          />
        </div>

        <div className="flex flex-col items-center mt-4">
          <p className="text-lg text-center mt-3  font-semibold md:text-2xl mb-3 text-gray-700">
            Please choose the correct syllable word below.
          </p>

          {/* Syllable Boxes */}
          <div className="flex flex-wrap gap-4 justify-center items-center md:ml-20">
            <div
              className={`flex flex-wrap gap-1 md:p-4 p-2 rounded-2xl bg-white ${
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
            <TextToSpeech heightWidth={60} spell={orignalWord} />
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

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => !isConfirmLoading && router.push(`/spellPractice/${listId}`)}
        onConfirm={async () => {
          try {
            setIsConfirmLoading(true);
            // Get IDs of completed syllable words (up to current page)
            const completedWordIds = syllableWords
              .slice(0, currentPage)
              .map((word) => word.id);

            if (completedWordIds.length > 0) {
              await markSyllableWordsAsStudied(completedWordIds, listId);
            }
            
            router.push(`/spellPractice/${listId}`);
          } catch (err) {
            setError(`Failed to save progress: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('Error marking syllable words as studied:', err);
          } finally {
            setIsConfirmLoading(false);
          }
        }}
        title="Mark Words as Studied"
        message={error || "Would you like to mark your completed words as studied before leaving?"}
        isLoading={isConfirmLoading}
        confirmText="Yes"
      />
    </>
  );
};

export default SyllabusModePage;
