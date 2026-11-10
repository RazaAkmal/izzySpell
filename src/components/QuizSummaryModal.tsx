import React, { useEffect } from "react";
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { formatTime } from "@/lib/formatTime";
import { fireConfetti } from "@/lib/confetti";

interface QuizSummaryModalProps {
  isOpen: boolean;
  onRetake: () => void;
  onGoHome: () => void;
  // Opens Practice Mistakes; when set and there are mistakes, it becomes the main button
  onPracticeMistakes?: () => void;
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
  // The attempt saved but some mistakes did not (shown as a warning, not an error)
  mistakesWarning?: string | null;
  onTrySaveAgain?: () => void;
  // A save (or retry) is still running
  isSaving?: boolean;
  // Wrong answers with the correct spelling; when omitted the review section is not shown
  mistakesList?: { userAnswer: string; correctWord: string }[];
}

const QuizSummaryModal: React.FC<QuizSummaryModalProps> = ({
  isOpen,
  onRetake,
  onGoHome,
  onPracticeMistakes,
  stats,
  saveError,
  mistakesWarning,
  onTrySaveAgain,
  mistakesList,
  isSaving = false,
}) => {
  useEffect(() => {
    if (isOpen && stats.grade >= 95) {
      fireConfetti();
    }
  }, [isOpen, stats.grade]);

  const hasMistakes = !!mistakesList && mistakesList.length > 0;
  // Only once every mistake is safely saved, otherwise Practice Mistakes would be empty or partial
  const canPracticeMistakes =
    hasMistakes && !!onPracticeMistakes && !saveError && !mistakesWarning && !isSaving;
  // Results not saved yet: Escape or a tap outside must not throw them away
  const resultsAtRisk = !!saveError || isSaving;
  const result = getResult(stats.grade);

  return (
    // Escape or tapping outside goes home, same as the Home button, unless that would lose
    // results that aren't saved yet
    <Dialog open={isOpen} onClose={() => !resultsAtRisk && onGoHome()} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
        {/* Never taller than the screen: the buttons stay put and only the middle scrolls */}
        <DialogPanel className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col bg-skyBlue rounded-3xl shadow-xl">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-6 pb-4 sm:px-6 space-y-5">
            {/* The result first: score ring and a headline that fits it */}
            <div className="flex items-center gap-4 sm:gap-5">
              <ScoreRing grade={stats.grade} />
              <div className="min-w-0">
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-purple">
                  <span aria-hidden="true">{result.icon} </span>
                  {result.title}
                </DialogTitle>
                <Description className="mt-1 text-base sm:text-lg font-bold text-darkBlue">
                  You got {stats.correct} of {stats.total} word{stats.total === 1 ? "" : "s"} right.
                </Description>
                <p className="text-sm sm:text-base font-semibold text-darkBlue">{result.message}</p>
              </div>
            </div>

            <ul className="flex flex-wrap gap-2" aria-label="Results">
              <StatChip tone="good" icon="✓" label={`${stats.correct} right`} />
              {stats.incorrect > 0 && (
                <StatChip tone="bad" icon="✗" label={`${stats.incorrect} to practice`} />
              )}
              {stats.isTimed && !!stats.expiredWords && (
                <StatChip tone="warn" icon="⏰" label={`${stats.expiredWords} ran out of time`} />
              )}
              {stats.isTimed && stats.timeElapsed !== undefined && (
                <StatChip tone="info" icon="⏱️" label={`${formatTime(stats.timeElapsed)} used`} />
              )}
            </ul>
            {stats.isTimed && (
              <p className="-mt-2 text-sm font-semibold text-darkBlue">
                Timer:{" "}
                {stats.timerType === "word"
                  ? `${formatTime(stats.timeAmount || 0)} for each word`
                  : `${formatTime(stats.timeAmount || 0)} for the whole quiz`}
              </p>
            )}

            {/* Words to review: the right spelling first, what was typed underneath */}
            {hasMistakes && (
              <section aria-labelledby="review-heading">
                <h3 id="review-heading" className="mb-2 text-base sm:text-lg font-bold text-darkBlue">
                  Words to practice
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mistakesList!.map((mistake, index) => (
                    <li key={index} className="bg-white rounded-2xl border-2 border-blueStroke px-4 py-2">
                      <p className="text-lg sm:text-xl font-bold text-deepGreen break-words">{mistake.correctWord}</p>
                      <p className="text-sm font-semibold text-red-600 break-words">
                        {mistake.userAnswer ? (
                          <>
                            You wrote: <span className="font-bold">{mistake.userAnswer}</span>
                          </>
                        ) : (
                          "No answer"
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {mistakesWarning && !saveError && (
              <p role="status" className="bg-amber-100 border-2 border-amber-500 text-amber-900 px-4 py-3 rounded-2xl text-sm font-semibold">
                {mistakesWarning}
              </p>
            )}

            {isSaving && !saveError && (
              <p role="status" className="bg-white border-2 border-blueStroke text-darkBlue px-4 py-3 rounded-2xl text-sm font-semibold">
                Saving your results...
              </p>
            )}

            {saveError && (
              <div role="alert" className="bg-red-100 border-2 border-red-600 text-red-700 px-4 py-3 rounded-2xl">
                <p className="font-bold">Your quiz results couldn&apos;t be saved.</p>
                <p className="text-sm">{saveError}</p>
                {onTrySaveAgain && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={onTrySaveAgain}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-full text-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-blue"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next step: practise the missed words when there are any, otherwise retake */}
          <div className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6 border-t-2 border-white flex flex-wrap justify-center gap-3">
            {canPracticeMistakes && (
              <CustomButton
                label="Practice these words"
                variant="success"
                size="small"
                onClick={onPracticeMistakes}
                img="/images/completeIcon.svg"
                imageClassName="w-5 h-5"
                className="w-full"
              />
            )}
            <CustomButton
              label="Retake Quiz"
              variant={canPracticeMistakes ? "secondary" : "primary"}
              size="small"
              onClick={onRetake}
              img="/images/resetIcon.svg"
              imageClassName="w-5 h-5"
              className="flex-1 min-w-[9rem]"
            />
            <CustomButton
              label="Go Home"
              variant="secondary"
              size="small"
              onClick={onGoHome}
              img="/images/backArrow.svg"
              imageClassName="w-5 h-5"
              className="flex-1 min-w-[9rem]"
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

// Headline and encouragement for a score; a low score still gets a kind message
const getResult = (grade: number) => {
  if (grade >= 100) return { icon: "🏆", title: "Perfect score!", message: "Every word spelled right. Amazing!" };
  if (grade >= 80) return { icon: "🌟", title: "Great job!", message: "Just a few words left to practice." };
  if (grade >= 50) return { icon: "👍", title: "Nice work!", message: "Practice the missed words to get even better." };
  return { icon: "💪", title: "Keep practicing!", message: "Every try makes you a better speller." };
};

// Circular score: the ring fills to the grade
const ScoreRing: React.FC<{ grade: number }> = ({ grade }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const color = grade >= 80 ? "stroke-deepGreen" : grade >= 50 ? "stroke-darkOrange" : "stroke-purple";
  return (
    <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28" role="img" aria-label={`Score ${grade} percent`}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="white" className="stroke-blueStroke" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={`${color} motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(Math.max(grade, 0), 100) / 100)}
        />
      </svg>
      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-darkBlue">
        {grade}%
      </span>
    </div>
  );
};

const CHIP_TONES = {
  good: "border-deepGreen text-deepGreen",
  bad: "border-red-600 text-red-600",
  warn: "border-amber-600 text-amber-800",
  info: "border-blueStroke text-darkBlue",
};

const StatChip: React.FC<{ tone: keyof typeof CHIP_TONES; icon: string; label: string }> = ({ tone, icon, label }) => (
  <li className={`inline-flex items-center gap-1.5 bg-white border-2 rounded-full px-3 py-1 text-sm sm:text-base font-bold ${CHIP_TONES[tone]}`}>
    <span aria-hidden="true">{icon}</span>
    {label}
  </li>
);

export default QuizSummaryModal;
