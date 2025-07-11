import React, { useEffect, useRef } from "react";
import CustomButton from "./HeadlessButton";
import JSConfetti from "js-confetti";

interface QuizSummaryModalProps {
  isOpen: boolean;
  onRetake: () => void;
  onGoHome: () => void;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    grade: number;
  };
}

const QuizSummaryModal: React.FC<QuizSummaryModalProps> = ({
  isOpen,
  onRetake,
  onGoHome,
  stats,
}) => {
  const confettiRef = useRef<JSConfetti | null>(null);

  useEffect(() => {
    if (isOpen) {
      confettiRef.current = new JSConfetti();
      if (stats.grade >= 95) {
        confettiRef.current.addConfetti();
      }
    }
  }, [isOpen, stats.grade]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-12 max-w-[900px] w-full mx-auto shadow-lg">
        <p className="text-3xl md:text-5xl font-bold text-center w-full text-purple mb-10">
          Quiz Summary
        </p>
        <div className="w-full space-y-8 mb-10">
          <div className="flex justify-between items-center bg-lightBlue p-5 rounded-xl">
            <span className="text-xl text-darkBlue font-medium">
              Total Questions:
            </span>
            <span className="text-2xl font-bold text-darkBlue">
              {stats.total}
            </span>
          </div>
          <div className="flex justify-between items-center bg-lightGreen bg-opacity-20 p-5 rounded-xl">
            <span className="text-xl text-darkBlue font-medium">
              Correct Answers:
            </span>
            <span className="text-2xl font-bold text-darkGreen">
              {stats.correct}
            </span>
          </div>
          <div className="flex justify-between items-center bg-red-100 p-5 rounded-xl">
            <span className="text-xl text-darkBlue font-medium">
              Incorrect Answers:
            </span>
            <span className="text-2xl font-bold text-red-500">
              {stats.incorrect}
            </span>
          </div>
          <div className="flex justify-between items-center bg-blue-100 p-5 rounded-xl">
            <span className="text-xl text-darkBlue font-medium">Grade:</span>
            <span className="text-2xl font-bold text-blue">{stats.grade}%</span>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <CustomButton
            label="Retake Quiz"
            variant="primary"
            size="medium"
            onClick={onRetake}
            img="/images/resetIcon.svg"
            imageClassName="w-6 h-6"
          />
          <CustomButton
            label="Go to Home"
            variant="secondary"
            size="medium"
            onClick={onGoHome}
            img="/images/backArrow.svg"
            imageClassName="w-6 h-6"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizSummaryModal;
