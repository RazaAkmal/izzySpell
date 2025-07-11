"use client";

import React, { useState } from "react";
import Image from "next/image";
import CustomButton from "./HeadlessButton";
import { Button } from "@headlessui/react";
import TextToSpeech from "./TextToSpeach";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";
import { useListName } from "@/context/ListNameContext";

interface MistakesModePracticeProps {
  listId: string;
  initialMistakes: QuizMistake[];
}

interface QuizMistake {
  id: number;
  wordId: number;
  userAnswer: string;
  word: {
    id: number;
    word: string;
  };
}

interface PracticeAnswer {
  mistakeId: number;
  wordId: number;
  isCorrect: boolean;
  userAnswer: string;
  correctWord: string;
}

const MistakesModePractice: React.FC<MistakesModePracticeProps> = ({ 
  listId, 
  initialMistakes 
}) => {
  const { listName } = useListName();
  const router = useRouter();
  const [mistakes] = useState<QuizMistake[]>(initialMistakes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentMistake = mistakes[currentIndex];
  const isLastMistake = currentIndex === mistakes.length - 1;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (isError) {
      setIsError(false);
      setErrorMessage("");
    }
  };

  const checkAnswer = () => {
    if (!currentMistake) return false;
    
    const userAnswer = userInput.toLowerCase().trim();
    const correctAnswer = currentMistake.word.word.toLowerCase();
    
    return userAnswer === correctAnswer;
  };

  const handleNext = () => {
    if (currentMistake) {
      const isCorrect = checkAnswer();
      
      if (!isCorrect) {
        setIsError(true);
        setErrorMessage("That's not correct. Please listen again and try one more time!");
        setShowHint(false);
        setStreak(0);
        return;
      }
      
      // If answer is correct
      const newAnswer: PracticeAnswer = {
        mistakeId: currentMistake.id,
        wordId: currentMistake.wordId,
        isCorrect: true,
        userAnswer: userInput,
        correctWord: currentMistake.word.word,
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);
      
      // Increase streak for correct answers
      setStreak(prev => prev + 1);

      if (isLastMistake) {
        // Show completion modal
        setShowCompletionModal(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setUserInput("");
        setShowHint(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // Restore previous answer if it exists
      const previousAnswer = answers.find(a => a.wordId === mistakes[currentIndex - 1].wordId);
      setUserInput(previousAnswer?.userAnswer || "");
      setIsError(false);
      setErrorMessage("");
      setShowHint(false);
    }
  };

  const handleClose = () => {
    setShowConfirmation(true);
  };

  const handleRetakeQuiz = () => {
    router.push(`/spellPractice/${listId}/QuizMode?start=0`);
  };

  const handleGoHome = () => {
    router.push(`/spellPractice/${listId}`);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const getHint = () => {
    if (!currentMistake) return "";
    
    const word = currentMistake.word.word;
    if (word.length <= 2) return word[0] + "...";
    
    return word[0] + "..." + word[word.length - 1];
  };

  // Loading state is no longer needed as we get data from server

  // Show message if no mistakes found
  if (mistakes.length === 0) {
    return (
      <div className="bg-skyBlue h-[75vh] m-7 mt-1 p-6 rounded-lg shadow-lg flex justify-center items-center">
        <div className="text-center max-w-lg">
          <div className="text-5xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-darkBlue mb-4">No Mistakes to Practice</h2>
          <p className="text-darkBlue mb-8">
            Great job! You don&apos;t have any mistakes from recent quizzes to practice.
          </p>
          <div className="flex justify-center gap-4">
            <CustomButton
              label="Take a Quiz"
              variant="primary"
              size="small"
              onClick={handleRetakeQuiz}
              img="/images/QuizIcon.svg"
              className="w-40"
            />
            <CustomButton
              label="Go Home"
              variant="secondary"
              size="small"
              onClick={handleGoHome}
              img="/images/bookIcon.svg"
              className="w-40"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-skyBlue h-[75vh] m-7 mt-1 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 sm:gap-0 items-center">
        <div className="order-2 sm:order-1 flex justify-start">
          <CustomButton
            label={`List name ${listName}`}
            variant="success"
            size="small"
            img="/images/bookIcon.svg"
          />
        </div>
        <div className="order-3 sm:order-2 flex justify-center">
          <p className="text-2xl md:text-4xl md:ml-8 font-bold text-center w-full text-purple">
            Practice Mistakes
          </p>
        </div>
        <div className="order-1 sm:order-3 flex justify-end">
          <Button className="focus:outline-none">
            <Image
              src="/images/Vector.svg"
              alt="Cancel Button"
              width={30}
              height={30}
              onClick={handleClose}
            />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-4 mb-8">
        {/* Progress Bar */}
        <div className="w-full max-w-[500px] my-6">
          <div className="flex justify-between text-sm text-darkBlue mb-2">
            <span className="font-medium">Progress</span>
            <span className="font-medium">{answers.length}/{mistakes.length} words</span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5">
            <div
              className="bg-green h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(answers.length / mistakes.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Streak indicator */}
        {streak > 1 && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <span className="mr-1">🔥</span> {streak} Word Streak!
            </span>
          </div>
        )}

        <p className="w-[50%] text-center text-xl font-bold text-darkBlue my-6">
          Practice the words you got wrong in previous quizzes. Listen to the word, type it, and click Next.
        </p>
      </div>

      {currentMistake && (
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`flex items-center justify-center w-full max-w-[500px] bg-white rounded-full shadow-md border-2 ${
              isError ? 'border-red-500' : 'border-gray-200 focus-within:border-purple'
            } overflow-hidden transition-colors duration-200`}
          >
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the word you hear..."
              className={`w-full px-6 py-4 border-0 focus:ring-0 focus:outline-none text-lg ${
                isError ? 'text-red-500' : 'text-darkBlue'
              } bg-transparent`}
              autoFocus
            />
            <div className="p-2 mr-2">
              <TextToSpeech heightWidth={40} spell={currentMistake.word.word} />
            </div>
          </div>

          {/* Error message */}
          {isError && (
            <div className="mt-3 text-red-500 text-center max-w-[500px]">
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Hint section */}
          <div className="flex items-center justify-center mt-3">
            <button
              onClick={toggleHint}
              className="text-purple hover:text-purple-700 text-sm font-medium flex items-center"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          {/* Show hint if requested */}
          {showHint && (
            <div className="mt-2 p-2 text-darkBlue text-center">
              <p>Hint: {getHint()}</p>
            </div>
          )}

          <div className="flex justify-center gap-6 mt-8">
            <CustomButton
              label="Previous"
              variant="secondary"
              size="small"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              img="/images/PrevArrow.svg"
              className="w-36 !gap-2"
              imageClassName="w-4 h-4"
            />
            <CustomButton
              label={isLastMistake ? "Finish" : "Next"}
              variant={isLastMistake ? "success" : "secondary"}
              size="small"
              onClick={handleNext}
              disabled={!userInput.trim()}
              img={
                isLastMistake
                  ? "/images/completeIcon.svg"
                  : "/images/NextArrow.svg"
              }
              className="w-36 flex-row-reverse !gap-2 justify-between"
              imageClassName="w-4 h-4"
            />
          </div>
        </div>
      )}

      {/* Completion Modal */}
      <ConfirmationModal
        isOpen={showCompletionModal}
        onClose={handleGoHome}
        onConfirm={handleRetakeQuiz}
        title="Great Job!"
        message="You've successfully practiced all the mistake words! Would you like to take a new quiz or return to the home page?"
        confirmText="Take a Quiz"
        cancelText="Go Home"
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleGoHome}
        title="Exit Practice"
        message="Are you sure you want to exit? Your progress will be lost."
        confirmText="Yes, Exit"
      />
    </div>
  );
};

export default MistakesModePractice;
