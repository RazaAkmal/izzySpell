import React from "react";
import CustomButton from "./HeadlessButton";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-[500px] w-full mx-auto shadow-lg">
        <p className="text-2xl md:text-4xl md:ml-8 font-bold text-center w-full text-purple">
          Quiz Summary
        </p>
        <div className="w-full space-y-6 mb-8">
          <div className="flex justify-between items-center bg-lightBlue p-4 rounded-lg">
            <span className="text-lg text-darkBlue font-medium">
              Total Questions:
            </span>
            <span className="text-xl font-bold text-darkBlue">
              {stats.total}
            </span>
          </div>
          <div className="flex justify-between items-center bg-lightGreen bg-opacity-20 p-4 rounded-lg">
            <span className="text-lg text-darkBlue font-medium">
              Correct Answers:
            </span>
            <span className="text-xl font-bold text-darkGreen">
              {stats.correct}
            </span>
          </div>
          <div className="flex justify-between items-center bg-red-100 p-4 rounded-lg">
            <span className="text-lg text-darkBlue font-medium">
              Incorrect Answers:
            </span>
            <span className="text-xl font-bold text-red-500">
              {stats.incorrect}
            </span>
          </div>
          <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg">
            <span className="text-lg text-darkBlue font-medium">Grade:</span>
            <span className="text-xl font-bold text-blue">{stats.grade}%</span>
          </div>
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
