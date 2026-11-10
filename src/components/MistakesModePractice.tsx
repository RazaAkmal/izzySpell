"use client";

import React, { useRef, useState } from "react";
import CustomButton from "./HeadlessButton";
import PracticeModeLayout, { ListenButton } from "./PracticeModeLayout";
import { playSound } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";
import { useListName } from "@/context/ListNameContext";
import { resolvePracticedMistake } from "@/app/actions/resolveMistake";

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

const MistakesModePractice: React.FC<MistakesModePracticeProps> = ({
  listId,
  initialMistakes,
}) => {
  const { listName } = useListName();
  const router = useRouter();
  const [queue, setQueue] = useState<QuizMistake[]>([...initialMistakes]);
  const [userInput, setUserInput] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [practicedWords, setPracticedWords] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMistake = queue[0];
  const isLastItem = queue.length === 1;
  // Frozen at mount — must not use initialMistakes.length directly since
  // Next.js can update props mid-session when server actions run
  const [totalWords] = useState(() => initialMistakes.length);
  const practicedCount = practicedWords.length;
  // Skip is only available after a failed attempt or showing hint — encourages trying first
  const canSkip = !isLastItem && (isError || showHint);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (isError) setIsError(false);
  };

  const checkAnswer = () => {
    if (!currentMistake) return false;
    return userInput.toLowerCase().trim() === currentMistake.word.word.toLowerCase();
  };

  const handleNext = () => {
    if (!currentMistake) return;

    if (!checkAnswer()) {
      // An open hint stays: it shows again once they start retyping
      setIsError(true);
      setStreak(0);
      playSound("wrong");
      inputRef.current?.select();
      return;
    }

    setPracticedWords((prev) => [...prev, currentMistake.word.word]);
    setStreak((prev) => prev + 1);
    playSound("correct");
    // Fire-and-forget — delete the mistake from DB so the count updates
    resolvePracticedMistake(currentMistake.wordId).catch((err) =>
      console.error("Failed to clear practiced mistake:", currentMistake.wordId, err)
    );

    celebrate();
    if (isLastItem) {
      setShowCompletionModal(true);
    } else {
      setQueue((prev) => prev.slice(1));
      setUserInput("");
      setShowHint(false);
      setIsError(false);
    }
  };

  const handleSkip = () => {
    if (!currentMistake || isLastItem) return;
    // Move current word to end of queue — counts as a mistake, comes back later
    setQueue((prev) => [...prev.slice(1), prev[0]]);
    setUserInput("");
    setShowHint(false);
    setIsError(false);
    setStreak(0);
  };

  const handleRetakeQuiz = () => {
    router.push(`/spellPractice/${listId}/QuizMode?start=0`);
  };

  const handleGoHome = () => {
    router.push(`/spellPractice/${listId}`);
  };

  // First and last letters with a blank for each letter between: "b _ _ k"
  const getHint = () => {
    if (!currentMistake) return "";
    const word = currentMistake.word.word;
    if (word.length <= 2) return word[0] + " _".repeat(word.length - 1);
    return [word[0], ...Array(word.length - 2).fill("_"), word[word.length - 1]].join(" ");
  };
  const getHintLabel = () => {
    if (!currentMistake) return "";
    const word = currentMistake.word.word;
    return `${word.length} letters, starts with ${word[0]}, ends with ${word[word.length - 1]}`;
  };


  if (initialMistakes.length === 0) {
    return (
      <div className="mx-6 mt-2 mb-6 md:mx-14 md:mt-0 lg:mx-[5.5rem] bg-skyBlue rounded-3xl shadow-lg p-6 sm:p-10 flex justify-center">
        <div className="text-center max-w-lg">
          <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple mb-3">No mistakes to practice</h1>
          <p className="text-lg font-semibold text-darkBlue mb-8">
            Great job! You don&apos;t have any mistakes from recent quizzes to practice.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
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
    <>
      <PracticeModeLayout
        title="Practice Mistakes"
        listName={listName}
        onClose={() => setShowConfirmation(true)}
        currentPage={Math.min(practicedCount + 1, totalWords)}
        totalPages={totalWords}
        // Stars fill as words are fixed; skipped words come back later, so no jumping around
        highestReachedPage={practicedCount + 1}
        instruction="Listen, type the word, then press Next!"
      >
        {currentMistake && (
          <form
            className="w-full max-w-xl flex flex-col items-center gap-4"
            onSubmit={(e) => {
              // Enter in the box works like the Next button
              e.preventDefault();
              if (userInput.trim()) handleNext();
            }}
          >
            {streak > 1 && (
              <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full text-sm sm:text-base font-bold bg-white text-darkBlue border-2 border-darkOrange shadow-sm">
                <span aria-hidden="true">🔥</span> {streak} in a row!
              </span>
            )}

            <ListenButton spell={currentMistake.word.word} />

            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the word here"
              aria-label="Type the word you hear"
              aria-invalid={isError}
              aria-describedby="mistake-status"
              // A spelling practice: no autocorrect, spell check or auto capitals
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
              className={`w-full max-w-md px-5 py-3 sm:py-4 text-center text-2xl sm:text-3xl font-bold bg-white rounded-2xl border-[3px] shadow-md placeholder:text-lg placeholder:font-semibold placeholder:text-inputText focus:outline-none focus:ring-4 ${
                isError
                  ? "border-red-600 text-red-600 focus:ring-red-600/20"
                  : "border-darkGreen text-darkBlue focus:border-purple focus:ring-purple/30"
              }`}
            />

            {/* One fixed line under the box for the hint or a wrong answer, so the buttons
                below never move */}
            <div id="mistake-status" role="status" aria-live="polite" className="min-h-[44px] flex items-center justify-center">
              {isError ? (
                <p className="text-base sm:text-lg font-bold text-red-600 text-center">
                  Not quite! Listen again and try once more.
                </p>
              ) : showHint ? (
                <p className="flex items-center gap-2 text-base sm:text-lg font-bold text-darkBlue">
                  <span>It looks like:</span>
                  <span className="sr-only">{getHintLabel()}</span>
                  <span aria-hidden="true" className="tracking-[0.3em] text-xl sm:text-2xl text-purple">
                    {getHint()}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-lightOrange text-darkGray font-bold text-base sm:text-lg border-2 border-darkOrange shadow-[0_3px_0_#C57306] transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0.5 active:shadow-[0_1px_0_#C57306] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">💡</span> Hint
                  <span className="sr-only">: show the first and last letters</span>
                </button>
              )}
            </div>

            <div className="flex justify-center gap-3 sm:gap-6">
              <CustomButton
                type="button"
                label="Skip"
                variant="secondary"
                size="small"
                onClick={handleSkip}
                disabled={!canSkip}
                img="/images/NextArrow.svg"
                className="w-36 !gap-2"
                imageClassName="w-4 h-4"
              />
              <CustomButton
                type="submit"
                label={isLastItem ? "Finish" : "Next"}
                variant={isLastItem ? "success" : "secondary"}
                size="small"
                disabled={!userInput.trim()}
                img={isLastItem ? "/images/completeIcon.svg" : "/images/NextArrow.svg"}
                className="w-36 flex-row-reverse !gap-2 justify-between"
                imageClassName="w-4 h-4"
              />
            </div>
            {!canSkip && !isLastItem && (
              <p className="-mt-2 text-sm font-semibold text-darkBlue text-center">
                Give it a try first. You can skip after a try or a hint.
              </p>
            )}

            {practicedWords.length > 0 && (
              <div className="w-full mt-2 flex flex-col items-center gap-2">
                <h2 className="text-sm font-bold text-darkBlue">Fixed so far</h2>
                <ul className="flex flex-wrap gap-2 justify-center">
                  {practicedWords.map((word, i) => (
                    <li
                      key={i}
                      className="inline-flex items-center gap-1 bg-white text-deepGreen border-2 border-deepGreen rounded-full px-3 py-1 text-sm sm:text-base font-bold"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        )}
      </PracticeModeLayout>

      <ConfirmationModal
        isOpen={showCompletionModal}
        onClose={handleGoHome}
        onConfirm={handleRetakeQuiz}
        title="Great Job!"
        message={`You've successfully practiced all ${totalWords} mistake word${totalWords !== 1 ? "s" : ""}! Would you like to take a new quiz or return to the home page?`}
        confirmText="Take a Quiz"
        cancelText="Go Home"
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleGoHome}
        title="Leave Practice"
        // Each fixed word is removed from the mistakes list right away
        message="Words you've already fixed are saved. Leave this practice?"
        confirmText="Yes, Leave"
      />
    </>
  );
};

export default MistakesModePractice;
