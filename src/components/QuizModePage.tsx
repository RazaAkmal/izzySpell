"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import CustomButton from "./HeadlessButton";
import { Word } from "@prisma/client";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";
import { useListName } from "@/context/ListNameContext";
import QuizSummaryModal from "./QuizSummaryModal";
import QuizTimerModal, { AiPaceSuggestions } from "./QuizTimerModal";
import Timer from "./Timer";
import TimeExpiredNotification from "./TimeExpiredNotification";
import { saveQuizAttempt } from "@/app/actions/saveQuizAttempt";
import PracticeModeLayout, { ListenButton } from "./PracticeModeLayout";

interface QuizModePageProps {
  words: Pick<Word, "id" | "word">[];
  listId: string;
  initialAiSuggestions?: AiPaceSuggestions | null;
}

interface QuizAnswer {
  wordId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctWord: string;
}

type TimerType = "none" | "word" | "list";

// answers[i] is the answer for words[i]: re-answering a word (after Previous) replaces its
// entry instead of adding a second one
const upsertAnswer = (list: QuizAnswer[], index: number, answer: QuizAnswer): QuizAnswer[] =>
  index < list.length
    ? list.map((a, i) => (i === index ? answer : a))
    : [...list, answer];

const QuizModePage: React.FC<QuizModePageProps> = ({ words, listId, initialAiSuggestions = null }) => {
  const { listName } = useListName();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(true);
  
  // Timer related state
  const [timerType, setTimerType] = useState<TimerType>("none");
  const [timeAmount, setTimeAmount] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wordTimerKey, setWordTimerKey] = useState(0); // To reset word timer when page changes
  const [expiredWords, setExpiredWords] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  
  // Notification for expired word timer
  const [showTimeExpiredNotification, setShowTimeExpiredNotification] = useState(false);

  // Warn before refresh / closing the tab / browser back while the quiz is in progress
  // (not once the summary is showing, when leaving is fine)
  useEffect(() => {
    if (showSummary) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showSummary, isSaving]);

  // Shown briefly (word spelled out) when text-to-speech is unavailable or fails
  const [showWordFallback, setShowWordFallback] = useState(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTtsUnavailable = useCallback(() => {
    setShowWordFallback(true);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    fallbackTimer.current = setTimeout(() => setShowWordFallback(false), 3000);
  }, []);

  // Never carry the fallback over to the next word, and clear the timer on unmount
  useEffect(() => {
    setShowWordFallback(false);
  }, [currentPage]);
  useEffect(() => {
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  const currentWord = words[currentPage - 1];
  const isLastWord = currentPage === words.length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleNext = async () => {
    const newAnswer: QuizAnswer = {
      wordId: String(currentWord.id),
      isCorrect: userInput.toLowerCase().trim() === currentWord.word.toLowerCase(),
      userAnswer: userInput,
      correctWord: currentWord.word,
    };

    const updatedAnswers = upsertAnswer(answers, currentPage - 1, newAnswer);
    setAnswers(updatedAnswers);

    if (isLastWord) {
      // Use the handleQuizCompletion function
      await handleQuizCompletion(updatedAnswers);
    } else {
      setUserInput("");
      
      // If word timer is active, reset the timer for the next word
      if (timerType === "word") {
        // We need to reset the word timer first by stopping it
        setTimerRunning(false);
        
        // Use a more significant delay to ensure state updates complete
        setTimeout(() => {
          setWordTimerKey(prev => prev + 1);
          setCurrentPage(prev => prev + 1);
          
          // Additional delay before starting the timer again
          setTimeout(() => {
            setTimerRunning(true);
          }, 50);
        }, 100);
      } else {
        // For non-word timers or no timer, just move to next page
        setCurrentPage(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Restore the answer stored for the previous page, if it exists
      const previousAnswer = answers[currentPage - 2];
      setUserInput(previousAnswer?.userAnswer || "");
    }
  };

  const handleClose = () => {
    setShowConfirmation(true);
  };

  const calculateStats = (currentAnswers: QuizAnswer[]) => {
    const total = words.length;
    const correct = currentAnswers.filter(a => a.isCorrect).length;
    const grade = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, incorrect: total - correct, grade };
  };

  const handleRetakeQuiz = () => {
    setCurrentPage(1);
    setUserInput("");
    setAnswers([]);
    setShowSummary(false);
    setShowTimerModal(true); // Show timer options again
    setMistakesWarning(null);
    setExpiredWords(0);
    setTimerExpired(false);
    setTimeElapsed(0);
    setTimerRunning(false);
  };

  // Handle starting the quiz with timer settings
  const handleStartQuiz = (selectedTimerType: TimerType, selectedTimeAmount: number) => {
    // Guard in case the modal's validation is bypassed: a 0/empty time would expire instantly
    let safeTimeAmount = selectedTimeAmount;
    if (selectedTimerType !== "none" && !(Number.isFinite(safeTimeAmount) && safeTimeAmount >= 1)) {
      console.warn(`Invalid timer amount (${selectedTimeAmount}); using 10 seconds instead`);
      safeTimeAmount = 10;
    }
    setTimerType(selectedTimerType);
    setTimeAmount(safeTimeAmount);
    setShowTimerModal(false);
    
    if (selectedTimerType !== "none") {
      // Reset any existing timer state first
      setTimerRunning(false);
      setWordTimerKey(0);
      
      // Small delay to ensure previous state updates are processed
      setTimeout(() => {
        const now = Date.now();
        setQuizStartTime(now);
        
        if (selectedTimerType === "word") {
          // Reset the word timer key to trigger a fresh timer with a new key
          setWordTimerKey(Date.now()); // Use timestamp for unique key
        }
        
        // Small delay before starting timer to ensure DOM is updated
        setTimeout(() => {
          setTimerRunning(true);
        }, 100);
      }, 100);
    }
  };

  // Effect to track time elapsed - more accurate version
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning && timerType !== "none" && quizStartTime && !showSummary) {
      // Initial calculation
      const initialElapsed = Math.floor((Date.now() - quizStartTime) / 1000);
      setTimeElapsed(initialElapsed);
      
      // Update every second using absolute time for accuracy
      interval = setInterval(() => {
        if (quizStartTime) {
          const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
          setTimeElapsed(elapsed);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerRunning, timerType, quizStartTime, showSummary]);

  // Handle word timer expiration
  const handleWordTimerExpired = () => {
    if (timerType === "word" && timerRunning) {
      // Move to next word automatically
      const newAnswer: QuizAnswer = {
        wordId: String(currentWord.id),
        isCorrect: false, // Expired words are counted as incorrect
        userAnswer: "",
        correctWord: currentWord.word,
      };

      const updatedAnswers = upsertAnswer(answers, currentPage - 1, newAnswer);
      setAnswers(updatedAnswers);
      setExpiredWords(prev => prev + 1);

      // Immediately stop the timer and clear input
      setTimerRunning(false);
      setUserInput("");
      
      // Show notification first (will auto-hide after ~800ms)
      setShowTimeExpiredNotification(true);
      
      // Handle notification close and moving to next word
      const handleNotificationComplete = () => {
        if (isLastWord) {
          // Complete the quiz
          handleQuizCompletion(updatedAnswers);
        } else {
          // Prepare for next word
          setWordTimerKey(prev => prev + 1);
          setCurrentPage(prev => prev + 1);
          
          // Small delay before starting the timer for the next word
          setTimeout(() => {
            setTimerRunning(true);
          }, 50);
        }
      };
      
      // Wait 1 second (notification will be gone by then) then move to next word/finish quiz
      setTimeout(handleNotificationComplete, 1000);
    }
  };

  // Handle list timer expiration
  const handleListTimerExpired = () => {
    if (timerType === "list" && timerRunning) {
      setTimerRunning(false);
      setTimerExpired(true);
      
      // Create empty answers for all unattempted words
      // Keep the answers already given for later pages (after Previous) instead of adding
      // a second entry for them
      const currentAnswers = answers.slice(0, currentPage - 1);
      for (let i = currentPage - 1; i < words.length; i++) {
        if (i !== currentPage - 1 && answers[i]) {
          currentAnswers.push(answers[i]);
        } else if (i === currentPage - 1 && userInput) {
          // For the current word, if there's input, check it
          const isCorrect = userInput.toLowerCase().trim() === words[i].word.toLowerCase();
          currentAnswers.push({
            wordId: String(words[i].id),
            isCorrect,
            userAnswer: userInput,
            correctWord: words[i].word,
          });
        } else {
          // For all other words, mark as incorrect with empty answer
          currentAnswers.push({
            wordId: String(words[i].id),
            isCorrect: false,
            userAnswer: "",
            correctWord: words[i].word,
          });
        }
      }
      // Expired words = the blank answers just filled in (this includes the current word
      // when nothing was typed), so the count matches the final answers even after Previous
      setExpiredWords(currentAnswers.filter((a) => a.userAnswer === "").length);

      setTimeout(() => {
        handleQuizCompletion(currentAnswers);
      }, 2000); // Show notification immediately
    }
  };

  // State for error message display
  const [saveError, setSaveError] = useState<string | null>(null);
  // Non-blocking: the attempt saved but some mistakes did not
  const [mistakesWarning, setMistakesWarning] = useState<string | null>(null);

  // Handle quiz completion (moved to a separate function to avoid duplication)
  const handleQuizCompletion = async (completedAnswers: QuizAnswer[]) => {
    setIsSaving(true);
    // Reset any previous error
    setSaveError(null);
    
    try {
      if (!listId) {
        throw new Error("List ID is missing or invalid");
      }
      
      // Calculate stats and ensure all values are valid
      const stats = calculateStats(completedAnswers);
      
      // Validate grade is a number
      if (isNaN(stats.grade)) {
        stats.grade = 0;
      }
      
      // Add timer information to stats with validation
      const timerStats = {
        ...stats,
        isTimed: timerType !== "none",
        timerType: timerType || "none",
        timeAmount: typeof timeAmount === 'number' ? timeAmount : 0,
        expiredWords: typeof expiredWords === 'number' ? expiredWords : 0,
        timeElapsed: typeof timeElapsed === 'number' ? timeElapsed : 0
      };
      // Ensure no null values in mistakes and valid wordIds
      const mistakes = completedAnswers
        .filter(a => !a.isCorrect && a.wordId) // Only include valid word IDs
        .map(a => {
          const wordId = parseInt(a.wordId, 10);
          // Skip invalid wordIds
          if (isNaN(wordId)) {
            console.warn(`Invalid wordId detected: ${a.wordId}`);
            return null;
          }
          
          return {
            wordId,
            userAnswer: a.userAnswer || "[TIME EXPIRED]",
          };
        })
        .filter((m): m is { wordId: number; userAnswer: string } => m !== null); // Type-safe filter
      // Convert listId safely
      const parsedListId = parseInt(listId, 10);
      if (isNaN(parsedListId)) {
        throw new Error(`Invalid list ID: ${listId}`);
      }

      const saveResult = await saveQuizAttempt(parsedListId, timerStats, mistakes);
      // The score was saved, but some mistakes may be missing from Practice Mistakes
      setMistakesWarning(
        saveResult.mistakesFailed > 0
          ? `Your score was saved, but ${saveResult.mistakesFailed} mistake${
              saveResult.mistakesFailed === 1 ? "" : "s"
            } couldn't be saved to Practice Mistakes. They may not appear for practice.`
          : null
      );
      // If successful, show summary
      setShowSummary(true);
    } catch (error) {
      // Handle error and show user-friendly message
      console.error("Failed to save quiz attempt:", error);
      
      // Extract meaningful error message if possible
      let errorMessage = "Failed to save your quiz results. Please try again or contact support.";
      if (error instanceof Error) {
        // Extract specific error message but keep it user-friendly
        if (error.message.includes("prisma") || error.message.includes("database")) {
          errorMessage = "Database error occurred while saving your results. Please try again.";
        } else if (error.message.includes("auth") || error.message.includes("authenticated")) {
          errorMessage = "Authentication error. Please sign in again and retry.";
        } else if (error.message.includes("Invalid")) {
          errorMessage = "Invalid data detected. Please try taking the quiz again.";
        }
        
        // Log detailed error for debugging
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
      }
      
      setSaveError(errorMessage);
      
      // Still show the summary with the error message
      setShowSummary(true);
    } finally {
      setIsSaving(false);
      setTimerRunning(false);
    }
  };

  return (
    <>
      {/* Timer Modal - User must select an option */}
      <QuizTimerModal
        isOpen={showTimerModal}
        onStart={handleStartQuiz}
        totalWords={words.length}
        listId={parseInt(listId, 10)}
        initialAiSuggestions={initialAiSuggestions}
      />

      {/* Notification for word time expiration */}
      <TimeExpiredNotification
        show={showTimeExpiredNotification}
        onClose={() => setShowTimeExpiredNotification(false)}
      />

      <PracticeModeLayout
        title="Quiz Mode"
        listName={listName}
        onClose={handleClose}
        closeDisabled={isSaving}
        currentPage={currentPage}
        totalPages={words.length}
        // Stars fill as words are answered; they never show right/wrong during the quiz
        highestReachedPage={answers.length + 1}
        starTone="answered"
        // The quiz plays no sound effects (only the spoken word), so nothing to toggle
        showSoundToggle={false}
        instruction={
          timerExpired ? (
            <span className="text-red-600">Time&apos;s up! Your quiz has ended.</span>
          ) : (
            "Listen, type the word, then press Next!"
          )
        }
      >
        {/* Show error message if save failed */}
        {saveError && (
          <div
            className="mb-4 bg-red-100 border-2 border-red-600 text-red-700 px-4 py-3 rounded-2xl max-w-xl w-full"
            role="alert"
          >
            <strong className="font-bold">Something went wrong. </strong>
            <span className="block sm:inline">{saveError}</span>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="bg-white border-2 border-red-600 text-red-700 font-bold py-1 px-4 rounded-full"
                onClick={() => setSaveError(null)}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="bg-darkBlue text-white font-bold py-1 px-4 rounded-full"
                onClick={() => handleQuizCompletion(answers)}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Mounted only once the quiz has started, so the word isn't spoken behind the
            timer options */}
        {!showSummary && !showTimerModal && currentWord && (
          <form
            className="w-full max-w-xl flex flex-col items-center gap-4"
            onSubmit={(e) => {
              // Enter in the box works like the Next button
              e.preventDefault();
              if (userInput.trim() && !isSaving) handleNext();
            }}
          >
            {timerType !== "none" && timerRunning && (
              <div
                role="timer"
                aria-label={timerType === "word" ? "Time left for this word" : "Time left for the quiz"}
                className="flex items-center gap-3 bg-white rounded-full pl-4 pr-5 py-1 shadow-sm"
              >
                <span className="text-sm font-semibold text-darkBlue">
                  {timerType === "word" ? "This word" : "Whole quiz"}
                </span>
                {timerType === "word" ? (
                  <Timer
                    key={`word-timer-${currentPage}-${wordTimerKey}`}
                    initialSeconds={timeAmount}
                    isRunning={timerRunning}
                    onTimeUp={handleWordTimerExpired}
                  />
                ) : (
                  <Timer
                    key={`list-timer`}
                    initialSeconds={timeAmount}
                    isRunning={timerRunning}
                    onTimeUp={handleListTimerExpired}
                  />
                )}
              </div>
            )}

            <ListenButton spell={currentWord.word} onUnavailable={handleTtsUnavailable} />

            {showWordFallback && (
              <p className="text-4xl font-bold tracking-widest text-purple text-center" role="status">
                {currentWord.word}
              </p>
            )}

            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the word here"
              aria-label="Type the word you hear"
              // A spelling quiz: no autocorrect, spell check or auto capitals
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
              className="w-full max-w-md px-5 py-3 sm:py-4 text-center text-2xl sm:text-3xl font-bold text-darkBlue bg-white rounded-2xl border-[3px] border-darkGreen shadow-md placeholder:text-lg placeholder:font-semibold placeholder:text-inputText focus:outline-none focus:border-purple focus:ring-4 focus:ring-purple/30"
            />

            {!showWordFallback && (
              <p className="text-sm font-semibold text-darkBlue text-center">
                Tip: listen carefully, some words sound alike
              </p>
            )}

            <div className="flex justify-center gap-3 sm:gap-6 mt-2">
              <CustomButton
                type="button"
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
                type="submit"
                label={isLastWord ? "Submit" : "Next"}
                variant={isLastWord ? "success" : "secondary"}
                size="small"
                disabled={!userInput.trim() || isSaving}
                loading={isSaving}
                img={isLastWord ? "/images/completeIcon.svg" : "/images/NextArrow.svg"}
                className="w-36 flex-row-reverse !gap-2 justify-between"
                imageClassName="w-4 h-4"
              />
            </div>
          </form>
        )}
      </PracticeModeLayout>

      <QuizSummaryModal
        isOpen={showSummary}
        onRetake={handleRetakeQuiz}
        onGoHome={() => router.push(`/spellPractice/${listId}`)}
        onPracticeMistakes={() => router.push(`/spellPractice/${listId}/MistakesPractice`)}
        stats={{
          ...calculateStats(answers),
          isTimed: timerType !== "none",
          timerType: timerType || "none", // Ensure timerType is never undefined
          timeAmount: timeAmount || 0,    // Ensure timeAmount is never undefined
          expiredWords,
          timeElapsed
        }}
        mistakesList={answers
          .filter((a) => !a.isCorrect)
          .map((a) => ({ userAnswer: a.userAnswer, correctWord: a.correctWord }))}
        saveError={saveError}
        mistakesWarning={mistakesWarning}
        isSaving={isSaving}
        onTrySaveAgain={() => {
          // Add a loading state for better UX during retry
          setIsSaving(true);
          setSaveError(null);
          
          // Brief delay before retrying to ensure state is updated
          setTimeout(() => {
            // Don't hide the summary, just update the error state
            handleQuizCompletion(answers);
          }, 100);
        }}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => router.push(`/spellPractice/${listId}`)}
        title="Exit Quiz"
        message="Are you sure you want to exit the quiz? Your progress will be lost."
        confirmText="Yes, Exit Quiz"
      />
    </>
  );
};

export default QuizModePage;
