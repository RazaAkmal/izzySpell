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
    isTimed?: boolean;
    timerType?: "word" | "list" | "none";
    timeAmount?: number;
    expiredWords?: number;
    timeElapsed?: number;
  };
  saveError?: string | null;
  onTrySaveAgain?: () => void;
}

const QuizSummaryModal: React.FC<QuizSummaryModalProps> = ({
  isOpen,
  onRetake,
  onGoHome,
  stats,
  saveError,
  onTrySaveAgain,
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
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-[700px] w-full mx-auto shadow-lg">
        <p className="text-2xl md:text-4xl font-bold text-center w-full text-purple mb-6">
          Quiz Summary
        </p>
        <div className="w-full space-y-4 mb-6">
          <div className="flex justify-between items-center bg-lightBlue p-4 rounded-xl">
            <span className="text-lg text-darkBlue font-medium">
              Total Questions:
            </span>
            <span className="text-xl font-bold text-darkBlue">
              {stats.total}
            </span>
          </div>
          <div className="flex justify-between items-center bg-lightGreen bg-opacity-20 p-4 rounded-xl">
            <span className="text-lg text-darkBlue font-medium">
              Correct Answers:
            </span>
            <span className="text-xl font-bold text-darkGreen">
              {stats.correct}
            </span>
          </div>
          <div className="flex justify-between items-center bg-red-100 p-4 rounded-xl">
            <span className="text-lg text-darkBlue font-medium">
              Incorrect Answers:
            </span>
            <span className="text-xl font-bold text-red-500">
              {stats.incorrect}
            </span>
          </div>
          <div className="flex justify-between items-center bg-blue-100 p-4 rounded-xl">
            <span className="text-lg text-darkBlue font-medium">Grade:</span>
            <span className="text-xl font-bold text-blue">{stats.grade}%</span>
          </div>
          
          {stats.isTimed && (
            <>
              {stats.expiredWords && stats.expiredWords > 0 && (
                <div className="flex justify-between items-center bg-amber-100 p-4 rounded-xl">
                  <span className="text-lg text-darkBlue font-medium">Words Not Attempted:</span>
                  <span className="text-xl font-bold text-amber-600">
                    {stats.expiredWords}
                  </span>
                </div>
              )}
              
              {stats.timeElapsed !== undefined && (
                <div className="flex justify-between items-center bg-purple-100 p-4 rounded-xl">
                  <span className="text-lg text-darkBlue font-medium">Time Used:</span>
                  <span className="text-xl font-bold text-purple">
                    {Math.floor(stats.timeElapsed / 60)}m {stats.timeElapsed % 60}s
                  </span>
                </div>
              )}
              
              <div className="bg-gray-100 p-3 rounded-xl text-center">
                <span className="text-xs md:text-sm text-gray-600">
                  {stats.timerType === "word" 
                    ? `This was a timed quiz with ${stats.timeAmount} seconds per word.`
                    : `This was a timed quiz with ${Math.floor((stats.timeAmount || 0) / 60)}m ${(stats.timeAmount || 0) % 60}s for the entire list.`
                  }
                </span>
              </div>
            </>
          )}
          
          {/* Show error message if save failed */}
          {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl my-4">
              <p className="font-bold">Error: Your quiz results could not be saved</p>
              <p className="text-sm">{saveError}</p>
              {onTrySaveAgain && (
                <div className="mt-2 flex justify-end">
                  <button 
                    onClick={onTrySaveAgain}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <CustomButton
            label="Retake Quiz"
            variant="primary"
            size="small"
            onClick={onRetake}
            img="/images/resetIcon.svg"
            imageClassName="w-5 h-5"
          />
          <CustomButton
            label="Go to Home"
            variant="secondary"
            size="small"
            onClick={onGoHome}
            img="/images/backArrow.svg"
            imageClassName="w-5 h-5"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizSummaryModal;
