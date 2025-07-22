import React, { useState } from "react";
import CustomButton from "./HeadlessButton";

export type TimerType = "none" | "word" | "list";

interface QuizTimerModalProps {
  isOpen: boolean;
  onStart: (timerType: TimerType, timeAmount: number) => void;
  totalWords: number;
}

const QuizTimerModal: React.FC<QuizTimerModalProps> = ({
  isOpen,
  onStart,
  totalWords
}) => {
  const [timerType, setTimerType] = useState<TimerType>("none");
  const [timeAmount, setTimeAmount] = useState<number>(30); // Default 30 seconds

  if (!isOpen) return null;

  const handleStart = () => {
    // Timer selection has been made, proceed with the quiz
    onStart(timerType, timeAmount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-auto shadow-lg">
        <h2 className="text-2xl font-bold text-center w-full text-purple mb-4">
          Quiz Timer Options
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          Please select a timer option to continue with the quiz
        </p>
        
        <div className="mb-6">
          <p className="text-darkBlue mb-4">Choose a timer mode:</p>
          
          <div className="space-y-3">
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${timerType === "none" ? "border-purple bg-purple bg-opacity-10" : "border-gray-200 hover:bg-gray-50"}`}>
              <input
                type="radio"
                name="timerType"
                checked={timerType === "none"}
                onChange={() => setTimerType("none")}
                className="mr-3 h-5 w-5 text-purple"
              />
              <div>
                <p className="font-medium text-darkBlue">No Timer</p>
                <p className="text-sm text-gray-500">Take the quiz without time pressure</p>
              </div>
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${timerType === "word" ? "border-purple bg-purple bg-opacity-10" : "border-gray-200 hover:bg-gray-50"}`}>
              <input
                type="radio"
                name="timerType"
                checked={timerType === "word"}
                onChange={() => setTimerType("word")}
                className="mr-3 h-5 w-5 text-purple"
              />
              <div>
                <p className="font-medium text-darkBlue">Time per Word</p>
                <p className="text-sm text-gray-500">Set time limit for each individual word</p>
              </div>
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${timerType === "list" ? "border-purple bg-purple bg-opacity-10" : "border-gray-200 hover:bg-gray-50"}`}>
              <input
                type="radio"
                name="timerType"
                checked={timerType === "list"}
                onChange={() => setTimerType("list")}
                className="mr-3 h-5 w-5 text-purple"
              />
              <div>
                <p className="font-medium text-darkBlue">Time for Full List</p>
                <p className="text-sm text-gray-500">Set time limit for the entire quiz</p>
              </div>
            </label>
          </div>
        </div>

        {timerType !== "none" && (
          <div className="mb-6">
            <p className="text-darkBlue mb-2">Time {timerType === "word" ? "per word" : "for entire list"}:</p>
            <div className="flex gap-3 mb-2">
              {[15, 30, 60].map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => setTimeAmount(seconds)}
                  className={`py-2 px-4 rounded-lg text-sm ${
                    timeAmount === seconds
                      ? "bg-purple text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-darkBlue"
                  }`}
                >
                  {seconds} sec
                </button>
              ))}
              
              {timerType === "list" && [2, 3, 5].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setTimeAmount(minutes * 60)}
                  className={`py-2 px-4 rounded-lg text-sm ${
                    timeAmount === minutes * 60
                      ? "bg-purple text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-darkBlue"
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
            
            {timerType === "list" && (
              <p className="text-sm text-gray-500">
                That&apos;s about {Math.round(timeAmount / totalWords)} seconds per word.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <CustomButton
            label="Start Quiz"
            variant="primary"
            size="small"
            onClick={handleStart}
            className="w-48 py-3 text-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default QuizTimerModal;
