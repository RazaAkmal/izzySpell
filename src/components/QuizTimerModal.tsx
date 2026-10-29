import React, { useState, useEffect } from "react";
import CustomButton from "./HeadlessButton";
import Image from "next/image";
import { getTimeDurationsForList } from "@/app/actions/AiService";
import { generateAiSuggestionsForList } from "@/app/actions/generateAiSuggestions";
import { useRouter } from "next/navigation";
import { Button } from "@headlessui/react";

export type TimerType = "none" | "word" | "list";

export type AiPaceSuggestions = {
  shortPaceDuration: number | null;
  mediumPaceDuration: number | null;
  generousPaceDuration: number | null;
};

interface QuizTimerModalProps {
  isOpen: boolean;
  onStart: (timerType: TimerType, timeAmount: number) => void;
  totalWords: number;
  listId?: number; // Add listId to fetch AI suggestions
  // Loaded with the page on the server; when missing the modal fetches them itself
  initialAiSuggestions?: AiPaceSuggestions | null;
}

const QuizTimerModal: React.FC<QuizTimerModalProps> = ({
  isOpen,
  onStart,
  totalWords,
  listId,
  initialAiSuggestions = null,
}) => {
  const [timerType, setTimerType] = useState<TimerType>("none");
  const [timeAmount, setTimeAmount] = useState<number>(30); // Default 30 seconds
  const [timeUnit, setTimeUnit] = useState<'sec' | 'min'>('sec'); // Default to seconds
  const [aiSuggestions, setAiSuggestions] = useState<AiPaceSuggestions | null>(initialAiSuggestions);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [generatingAiSuggestions, setGeneratingAiSuggestions] = useState(false);
  const router = useRouter();
  // Fetch AI suggestions when modal opens and listId is available
  useEffect(() => {
    if (isOpen && listId && !aiSuggestions) {
      setLoadingAiSuggestions(true);
      getTimeDurationsForList(listId)
        .then((result) => {
          if (result.success && result.data) {
            setAiSuggestions(result.data);
          }
        })
        .catch((error) => {
          console.error("Failed to load AI suggestions:", error);
        })
        .finally(() => {
          setLoadingAiSuggestions(false);
        });
    }
  }, [isOpen, listId, aiSuggestions]);

  const handleGenerateAiSuggestions = async () => {
    if (!listId) return;

    setGeneratingAiSuggestions(true);
    try {
      const result = await generateAiSuggestionsForList(listId);
      console.log("AI suggestions generated:", result);
      if (result.success && result.data) {
        setAiSuggestions({
          shortPaceDuration: result.data.shortPace,
          mediumPaceDuration: result.data.mediumPace,
          generousPaceDuration: result.data.generousPace,
        });
      }
    } catch (error) {
      console.error("Failed to generate AI suggestions:", error);
    } finally {
      setGeneratingAiSuggestions(false);
    }
  };

  if (!isOpen) return null;

  const handleStart = () => {
    // Timer selection has been made, proceed with the quiz
    onStart(timerType, timeAmount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-auto shadow-lg relative">
        <Button 
          className="absolute top-4 right-4 focus:outline-none"
          onClick={() => {
            if (listId) {
              router.push(`/spellPractice/${listId}`);
            }
          }}
        >
          <Image
            src="/images/Vector.svg"
            alt="Cancel Button"
            width={30}
            height={30}
          />
        </Button>
       

        <h2 className="text-2xl font-bold text-center w-full text-purple mb-4">
          Quiz Timer Options
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Please select a timer option to continue with the quiz
        </p>

        <div className="mb-6">
          <p className="text-darkBlue mb-4">Choose a timer mode:</p>

          <div className="space-y-3">
            <label
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                timerType === "none"
                  ? "border-purple bg-purple bg-opacity-10"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="timerType"
                checked={timerType === "none"}
                onChange={() => setTimerType("none")}
                className="mr-3 h-5 w-5 text-purple"
              />
              <div>
                <p className="font-medium text-darkBlue">No Timer</p>
                <p className="text-sm text-gray-500">
                  Take the quiz without time pressure
                </p>
              </div>
            </label>

            <label
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                timerType === "word"
                  ? "border-purple bg-purple bg-opacity-10"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="timerType"
                checked={timerType === "word"}
                onChange={() => setTimerType("word")}
                className="mr-3 h-5 w-5 text-purple"
              />
              <div>
                <p className="font-medium text-darkBlue">Time per Word</p>
                <p className="text-sm text-gray-500">
                  Set time limit for each individual word
                </p>
              </div>
            </label>

            <label
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                timerType === "list"
                  ? "border-purple bg-purple bg-opacity-10"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="timerType"
                checked={timerType === "list"}
                onChange={() => setTimerType("list")}
                className="mr-3 h-5 w-5 text-purple"
              />
              <div>
                <p className="font-medium text-darkBlue">Time for Full List</p>
                <p className="text-sm text-gray-500">
                  Set time limit for the entire quiz
                </p>
              </div>
            </label>
          </div>
        </div>

        {timerType !== "none" && (
          <div className="mb-6">
            <p className="text-darkBlue mb-2">
              Time {timerType === "word" ? "per word" : "for entire list"}:
            </p>

            {aiSuggestions &&
              (aiSuggestions.shortPaceDuration ||
                aiSuggestions.mediumPaceDuration ||
                aiSuggestions.generousPaceDuration) && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">
                      🤖 AI-Suggested Paces:
                    </p>
                    {/* <button
                    onClick={handleGenerateAiSuggestions}
                    disabled={generatingAiSuggestions}
                    className="text-xs text-darkBlue"
                    title="Refresh AI suggestions"
                  >
                    {generatingAiSuggestions ? "Updating..." : "🔄 Refresh"}
                  </button> */}
                  </div>
                  <div className="flex gap-2 mb-3">
                    {aiSuggestions.shortPaceDuration && (
                      <button
                        onClick={() => {
                          const duration =
                            timerType === "list"
                              ? aiSuggestions.shortPaceDuration! * totalWords
                              : aiSuggestions.shortPaceDuration!;
                          setTimeAmount(duration);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs ${
                          timeAmount ===
                          aiSuggestions.shortPaceDuration! *
                            (timerType === "list" ? totalWords : 1)
                            ? "bg-purple text-white"
                            : "bg-blue"
                        }`}
                      >
                        Fast (
                        {timerType === "list"
                          ? `${Math.floor(
                              (aiSuggestions.shortPaceDuration! * totalWords) /
                                60
                            )}m ${
                              (aiSuggestions.shortPaceDuration! * totalWords) %
                              60
                            }s`
                          : `${Math.floor(
                              aiSuggestions.shortPaceDuration! / 60
                            )}m ${aiSuggestions.shortPaceDuration! % 60}s`}
                        )
                      </button>
                    )}
                    {aiSuggestions.mediumPaceDuration && (
                      <button
                        onClick={() => {
                          const duration =
                            timerType === "list"
                              ? aiSuggestions.mediumPaceDuration! * totalWords
                              : aiSuggestions.mediumPaceDuration!;
                          setTimeAmount(duration);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs ${
                          timeAmount ===
                          aiSuggestions.mediumPaceDuration! *
                            (timerType === "list" ? totalWords : 1)
                            ? "bg-purple text-white"
                            : "bg-green hover:bg-darkGreen text-green-800"
                        }`}
                      >
                        Balanced (
                        {timerType === "list"
                          ? `${Math.floor(
                              (aiSuggestions.mediumPaceDuration! * totalWords) /
                                60
                            )}m ${
                              (aiSuggestions.mediumPaceDuration! * totalWords) %
                              60
                            }s`
                          : `${Math.floor(
                              aiSuggestions.mediumPaceDuration! / 60
                            )}m ${aiSuggestions.mediumPaceDuration! % 60}s`}
                        )
                      </button>
                    )}
                    {aiSuggestions.generousPaceDuration && (
                      <button
                        onClick={() => {
                          const duration =
                            timerType === "list"
                              ? aiSuggestions.generousPaceDuration! * totalWords
                              : aiSuggestions.generousPaceDuration!;
                          setTimeAmount(duration);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs ${
                          timeAmount ===
                          aiSuggestions.generousPaceDuration! *
                            (timerType === "list" ? totalWords : 1)
                            ? "bg-purple text-white"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                        }`}
                      >
                        Relaxed (
                        {timerType === "list"
                          ? `${Math.floor(
                              (aiSuggestions.generousPaceDuration! *
                                totalWords) /
                                60
                            )}m ${
                              (aiSuggestions.generousPaceDuration! *
                                totalWords) %
                              60
                            }s`
                          : `${Math.floor(
                              aiSuggestions.generousPaceDuration! / 60
                            )}m ${aiSuggestions.generousPaceDuration! % 60}s`}
                        )
                      </button>
                    )}
                  </div>
                </div>
              )}

            {/* Show generate AI suggestions button if no suggestions available or all are null */}
            {(!aiSuggestions ||
              (aiSuggestions.shortPaceDuration === null &&
                aiSuggestions.mediumPaceDuration === null &&
                aiSuggestions.generousPaceDuration === null)) &&
              !loadingAiSuggestions && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    🤖 Get AI-Suggested Paces for your grade level:
                  </p>
                  <button
                    onClick={handleGenerateAiSuggestions}
                    disabled={generatingAiSuggestions}
                    className="py-2 px-4 bg-darkBlue  text-white rounded-lg text-sm"
                  >
                    {generatingAiSuggestions
                      ? "Picking the right pace..."
                      : "Generate AI Suggestions"}
                  </button>
                </div>
              )}

            {/* Standard time options */}
            <p className="text-sm text-gray-600 mb-2">Standard Options:</p>
            <div className="flex flex-wrap gap-3 mb-2">
              {[15, 30, 60].map((seconds) => {
                const actualSeconds =
                  timerType === "list" ? seconds * totalWords : seconds;
                return (
                  <button
                    key={seconds}
                    onClick={() => setTimeAmount(actualSeconds)}
                    className={`py-2 px-4 rounded-lg text-sm ${
                      timeAmount === actualSeconds
                        ? "bg-purple text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-darkBlue"
                    }`}
                  >
                    {timerType === "list" ? actualSeconds : seconds} sec
                  </button>
                );
              })}

              {/* Custom time input */}
              <div
                className={`flex rounded-lg overflow-hidden ${
                  ![15, 30, 60, 120, 180, 300].includes(timeAmount)
                    ? "ring-2 ring-purple"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <input
                  type="number"
                  max={timeUnit === 'min' ? 30 : 1800}
                  value={
                    timeUnit === 'min' 
                      ? timeAmount === 0 ? '' : Math.floor(timeAmount / 60)
                      : timeAmount === 0 ? '' : timeAmount
                  }
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setTimeAmount(0);
                      return;
                    }
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value)) {
                      const seconds = timeUnit === 'min' ? value * 60 : value;
                      setTimeAmount(seconds);
                    }
                  }}
                  placeholder="Custom"
                  className="py-2 text-black px-2 w-12 text-sm text-center bg-transparent border-0 focus:outline-none"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value as 'sec' | 'min';
                    setTimeUnit(newUnit);
                    // Convert the current value when changing units
                    if (![15, 30, 60, 120, 180, 300].includes(timeAmount)) {
                      const currentValue = timeUnit === 'min' ? timeAmount / 60 : timeAmount;
                      const newSeconds = newUnit === 'min' ? currentValue * 60 : currentValue;
                      setTimeAmount(Math.round(newSeconds));
                    }
                  }}
                  className="py-2 px-2 text-sm text-darkBlue bg-transparent border-0 focus:outline-none cursor-pointer"
                >
                  <option value="sec">sec</option>
                  <option value="min">min</option>
                </select>
              </div>
            </div>

            {timerType === "list" && (
              <p className="text-sm text-gray-500">
                That&apos;s about {Math.round(timeAmount / totalWords)} seconds
                per word.
              </p>
            )}

            {loadingAiSuggestions && (
              <p className="text-sm text-gray-500 italic">
                Loading AI suggestions...
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
