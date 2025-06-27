"use client";

import React, { useState } from "react";
import Image from "next/image";
import CustomButton from "./HeadlessButton";
import { Button } from "@headlessui/react";
import { Word } from "@prisma/client";
import TextToSpeech from "./TextToSpeach";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";
import { useListName } from "@/context/ListNameContext";
import QuizSummaryModal from "./QuizSummaryModal";

interface QuizModePageProps {
  words: Word[];
  listId: string;
}

interface QuizAnswer {
  wordId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctWord: string;
}

const QuizModePage: React.FC<QuizModePageProps> = ({ words, listId }) => {
  const { listName } = useListName();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const currentWord = words[currentPage - 1];
  const isLastWord = currentPage === words.length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleNext = () => {
    // Save current answer
    const answer: QuizAnswer = {
      wordId: String(currentWord.id),
      isCorrect: userInput.toLowerCase().trim() === currentWord.word.toLowerCase(),
      userAnswer: userInput,
      correctWord: currentWord.word
    };
    
    setAnswers(prev => [...prev, answer]);
    
    if (isLastWord) {
      setShowSummary(true);
    } else {
      setCurrentPage(prev => prev + 1);
      setUserInput("");
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Restore previous answer if it exists
      const previousAnswer = answers.find(a => a.wordId === String(words[currentPage - 2].id));
      setUserInput(previousAnswer?.userAnswer || "");
    }
  };

  const handleClose = () => {
    setShowConfirmation(true);
  };

  const calculateStats = () => {
    const total = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const grade = Math.round((correct / total) * 100);
    return { total, correct, incorrect: total - correct, grade };
  };

  const handleRetakeQuiz = () => {
    setCurrentPage(1);
    setUserInput("");
    setAnswers([]);
    setShowSummary(false);
  };

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
              Quiz Mode
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
            <span className="font-medium">{answers.length}/{words.length} words</span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5">
            <div
              className="bg-green h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(answers.length / words.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <p className="w-[50%] text-center text-xl font-bold text-darkBlue my-8">
          Listen to the Word: Click the Play button to hear the word. Type it in the box and then click Next to proceed.
        </p>
      </div>

      {!showSummary && currentWord && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-4 w-full max-w-[500px] bg-white p-6 rounded-lg shadow-md">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the word you hear..."
              className="w-full px-4 py-3 rounded-lg border-2 border-darkGreen focus:outline-none focus:border-blue text-lg text-darkBlue bg-white"
              autoFocus
            />
            <TextToSpeech heightWidth={40} spell={currentWord.word} />
          </div>

          <div className="flex justify-center gap-6 mt-8">
            <CustomButton
              label="Previous"
              variant="secondary"
              size="small"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              img="/images/PrevArrow.svg"
              className="w-36 !gap-2"
              imageClassName="w-4 h-4"
            />
            <CustomButton
              label={isLastWord ? "Submit" : "Next"}
              variant={isLastWord ? "success" : "secondary"}
              size="small"
              onClick={handleNext}
              disabled={!userInput.trim()}
              img={isLastWord ? "/images/completeIcon.svg" : "/images/NextArrow.svg"}
              className="w-36 flex-row-reverse !gap-2 justify-between"
              imageClassName="w-4 h-4"
            />
          </div>
        </div>
      )}

      <QuizSummaryModal
        isOpen={showSummary}
        onRetake={handleRetakeQuiz}
        onGoHome={() => router.push(`/spellPractice/${listId}`)}
        stats={calculateStats()}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => router.push(`/spellPractice/${listId}`)}
        onConfirm={() => router.push(`/spellPractice/${listId}`)}
        title="Exit Quiz"
        message="Are you sure you want to exit the quiz? Your progress will be lost."
        confirmText="Yes, Exit Quiz"
      />
    </div>
  );
};

export default QuizModePage;
