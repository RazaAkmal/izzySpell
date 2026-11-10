"use client";
import React, { useState, useEffect } from "react";
import { SyllableWord } from "@prisma/client";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";
import {
  autoSaveSyllableWordAsStudied,
  markSyllableWordsAsStudied,
} from "@/app/actions/prismaActions";
import StudyCompletionModal from "./StudyCompletionModal";
import { useListName } from "@/context/ListNameContext";
import { useSyncProgressOnLeave } from "@/lib/useSyncProgressOnLeave";
import { playSound } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import PracticeModeLayout, {
  AnswerFeedback,
  AnswerStatus,
  AnswerTray,
  ListenButton,
  getPraise,
  getTileGap,
  getTileSize,
  tileStatusClass,
} from "./PracticeModeLayout";

interface SyllablesModePageProps {
  listId: number;
  syllableWords: Pick<SyllableWord, "id" | "word" | "answer" | "options">[];
  // Words already saved as studied (from earlier sessions)
  studiedWordIds: number[];
}

const SyllablesModePage: React.FC<SyllablesModePageProps> = ({
  listId,
  syllableWords,
  studiedWordIds,
}) => {
  const router = useRouter();
  const { listName } = useListName();
  const { autoSave, saveFinishedSession } = useSyncProgressOnLeave(listId, studiedWordIds);
  // Saves only words not saved yet; on a repeat run of a finished list it makes no call
  const saveSession = () =>
    saveFinishedSession(
      syllableWords.map((word) => word.id),
      (ids) => markSyllableWordsAsStudied(ids, listId)
    );
  // Resume on the first unfinished word (the one after the studied ones); when everything is
  // studied this is the last word, and "Begin Again" restarts from the first.
  // TODO: position-based resume breaks after list edits; needs per-word studied tracking
  const resumePage = Math.min(studiedWordIds.length + 1, syllableWords.length) || 1;
  const [currentPage, setCurrentPage] = useState(resumePage);
  const [highestReachedPage, setHighestReachedPage] = useState(resumePage);
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
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const shuffleAnswers = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  useEffect(() => {
    // Check and handle the start parameter on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const startParam = params.get("start");

      if (startParam === "0") {
        setCurrentPage(1);
        setHighestReachedPage(1);
      }

      // Remove the start parameter from URL
      if (startParam && window.history) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("start");
        window.history.replaceState({}, "", newUrl.toString());
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
    // Ignore clicks while the correct answer is showing, so the page can't advance twice
    if (isCorrectAnswer) return;
    setSelectedOption(optionId);
    setSyllableBoxes(option.split(""));
    checkAnswer(option);
  };

  const checkAnswer = (selectedOption: string) => {
    if (selectedOption === correctSyllable) {
      setIsCorrectAnswer(true);
      celebrate();
      playSound("correct");
      // Auto-save in the background so progress survives back/refresh/closing the tab
      const answeredWordId = syllableWords[currentPage - 1]?.id;
      if (answeredWordId !== undefined) {
        autoSave(answeredWordId, () => autoSaveSyllableWordAsStudied(answeredWordId, listId));
      }
      // Update highest reached page when answer is correct
      if (currentPage < syllableWords.length) {
        setHighestReachedPage((prev) => Math.max(prev, currentPage + 1));
        // Only increment page if not on the last page
        setTimeout(() => {
          setCurrentPage((prevPage) => prevPage + 1);
          setSelectedOption(null);
          setIsCorrectAnswer(null);
        }, 2000);
      } else {
        // On the last page, show completion modal after showing correct answer
        setTimeout(() => {
          setSelectedOption(null);
          setIsCorrectAnswer(null);
          setShowCompletionModal(true);
        }, 2000);
      }
    } else {
      setIsCorrectAnswer(false);
      playSound("wrong");
    }
  };

  const answerStatus: AnswerStatus =
    isCorrectAnswer === null ? "idle" : isCorrectAnswer ? "correct" : "wrong";
  const tileSize = getTileSize(syllableBoxes.length);
  const tileGap = getTileGap(syllableBoxes.length);

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
      <PracticeModeLayout
        title="Syllables Mode"
        listName={listName}
        onClose={() => setShowConfirmation(true)}
        closeDisabled={isConfirmLoading}
        currentPage={currentPage}
        totalPages={syllableWords.length}
        highestReachedPage={highestReachedPage}
        onPageChange={handlePageChange}
        instruction="Listen, then pick the right syllables!"
      >
        <div className="w-full max-w-3xl flex flex-col items-center gap-5 sm:gap-6">
          <ListenButton spell={orignalWord} />

          {/* Syllable Boxes. The feedback sits like a sticker on the tray's bottom edge, so it
              needs no empty row of its own and the choices below never move when it appears. */}
          <div className="relative max-w-full pb-10 sm:pb-9">
            <AnswerTray status={answerStatus} label="Your answer" shakeKey={selectedOption}>
              {/* Read as one phrase instead of letter by letter */}
              <p className="sr-only">
                {selectedOption === null
                  ? "No answer picked yet"
                  : `Your answer: ${syllableBoxes.join("")}`}
              </p>
              <div aria-hidden="true" className={`flex flex-wrap justify-center ${tileGap}`}>
                {syllableBoxes.map((letter, index) => (
                  <div
                    key={index}
                    className={`${tileSize} border-2 rounded-xl flex items-center justify-center font-bold text-white transition-colors ${tileStatusClass(
                      answerStatus,
                      !!letter
                    )}`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </AnswerTray>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <AnswerFeedback
                state={answerStatus}
                correctText={getPraise(currentPage)}
                wrongText="Almost! Try another one."
              />
            </div>
          </div>

          <div
            role="group"
            aria-label="Answer choices"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl"
          >
            {options.map((option, index) => {
              const isSelected = selectedOption === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionClick(index, option)}
                  disabled={!!isCorrectAnswer}
                  aria-label={`Choice ${String.fromCharCode(65 + index)}: ${option}${
                    isSelected ? (isCorrectAnswer ? ", correct" : ", not right") : ""
                  }`}
                  className={`flex items-center gap-3 w-full min-h-[56px] px-3 py-3 sm:py-4 rounded-2xl border-2 text-left font-bold transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2 ${
                    isSelected
                      ? isCorrectAnswer
                        ? "bg-deepGreen border-deepGreen text-white shadow-[0_4px_0_#2a5704]"
                        : "bg-red-600 border-red-600 text-white shadow-[0_4px_0_#991b1b] motion-safe:animate-wiggle"
                      : "bg-white border-blueStroke text-darkBlue shadow-[0_4px_0_#98C3FF] motion-safe:hover:-translate-y-0.5 hover:border-blue motion-safe:active:translate-y-0.5 active:shadow-[0_1px_0_#98C3FF] disabled:opacity-60 disabled:hover:translate-y-0"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base ${
                      isSelected ? "bg-white/25 text-white" : "bg-skyBlue text-darkBlue"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-center text-xl sm:text-2xl lg:text-3xl tracking-wide break-all">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </PracticeModeLayout>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => !isConfirmLoading && setShowConfirmation(false)}
        // Each correct word is auto-saved when answered, so leaving needs no save
        onConfirm={() => router.push(`/spellPractice/${listId}`)}
        title="Leave Practice"
        message={error || "Your completed words are already saved. Leave this practice?"}
        confirmText="Yes, Leave"
      />

      <StudyCompletionModal
        isOpen={showCompletionModal}
        // "Practice Again": the finished session is saved first, then the mode restarts
        onClose={async () => {
          setIsConfirmLoading(true);
          try {
            await saveSession();
          } catch (err) {
            console.error("Error saving on practice again:", err);
          } finally {
            setIsConfirmLoading(false);
            setShowCompletionModal(false);
            // Reset to first page to practice again
            setCurrentPage(1);
            setHighestReachedPage(1);
            setSelectedOption(null);
            setIsCorrectAnswer(null);
          }
        }}
        onContinue={async () => {
          try {
            setIsConfirmLoading(true);
            setError(null);
            await saveSession();
            router.push(`/spellPractice/${listId}`);
          } catch (err) {
            setError(
              `Failed to save progress: ${err instanceof Error ? err.message : "Unknown error"}`
            );
            console.error("Error marking syllable words as studied:", err);
            setIsConfirmLoading(false);
          }
        }}
        isLoading={isConfirmLoading}
        mode="Syllables Mode"
      />
    </>
  );
};

export default SyllablesModePage;
