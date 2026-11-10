import React, { useState, useEffect } from "react";
import CustomButton from "./HeadlessButton";
import { formatTime } from "@/lib/formatTime";
import { getTimeDurationsForList } from "@/app/actions/AiService";
import { generateAiSuggestionsForList } from "@/app/actions/generateAiSuggestions";
import { useRouter } from "next/navigation";
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

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

  // Seconds for a pace: per word as is, for the whole quiz times the number of words
  const forMode = (perWord: number, type: TimerType = timerType) =>
    type === "list" ? perWord * totalWords : perWord;

  // AI paces when the list has them, otherwise standard ones
  const aiPaces = [
    { label: "Fast", perWord: aiSuggestions?.shortPaceDuration },
    { label: "Balanced", perWord: aiSuggestions?.mediumPaceDuration },
    { label: "Relaxed", perWord: aiSuggestions?.generousPaceDuration },
  ].filter((pace): pace is { label: string; perWord: number } => !!pace.perWord);
  const hasAiPaces = aiPaces.length > 0;
  const paces = hasAiPaces ? aiPaces : STANDARD_PACES;

  // Range the −/+ buttons allow: 5 sec to 5 min per word, 30 sec to 1 hour for the whole quiz
  const limits = (type: TimerType) => (type === "word" ? { min: 5, max: 300 } : { min: 30, max: 3600 });
  const clamp = (seconds: number, type: TimerType) =>
    Math.min(limits(type).max, Math.max(limits(type).min, seconds));
  const { min: minTime, max: maxTime } = limits(timerType);

  const chooseMode = (type: TimerType) => {
    setTimerType(type);
    // Start each timed mode on the middle pace, kept inside the −/+ range (a long list
    // times a slow pace could pass the 1 hour cap)
    if (type !== "none") setTimeAmount(clamp(forMode(paces[Math.floor(paces.length / 2)].perWord, type), type));
  };

  // −/+ steps: 5 sec per word; for the whole quiz 30 sec up to 5 min and 1 min above it.
  // The step depends on which side of 5 min the result lands, so + then − gets back to the
  // same time, and off-step times snap to the next step in the direction pressed.
  const adjust = (direction: 1 | -1) =>
    setTimeAmount((t) => {
      const step = timerType === "word" ? 5 : (direction > 0 ? t >= 300 : t > 300) ? 60 : 30;
      const next = direction > 0 ? Math.floor(t / step) * step + step : Math.ceil(t / step) * step - step;
      return clamp(next, timerType);
    });

  const summary =
    timerType === "none"
      ? "No timer, take your time"
      : timerType === "word"
      ? `${formatTime(timeAmount)} for each word`
      : `${formatTime(timeAmount)} for the whole quiz (about ${formatTime(
          Math.max(1, Math.round(timeAmount / Math.max(totalWords, 1)))
        )} a word)`;

  const leave = () => {
    if (listId) router.push(`/spellPractice/${listId}`);
  };

  return (
    // Escape or tapping outside goes back, same as the close button
    <Dialog open={isOpen} onClose={leave} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
        {/* Never taller than the screen: the header and Start button stay put and only the
            middle scrolls, so Start Quiz is always visible */}
        <DialogPanel className="relative w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col bg-skyBlue rounded-3xl shadow-xl">
          <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
            <div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-purple">Quiz timer</DialogTitle>
              <Description className="mt-1 text-base font-semibold text-darkBlue">
                Want a timer? Pick one, then start.
              </Description>
            </div>
            <button
              type="button"
              onClick={leave}
              aria-label="Back to practice"
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-white text-darkBlue border-2 border-blueStroke shadow-sm transition-transform motion-safe:hover:scale-110 motion-safe:active:scale-95 hover:border-blue focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
            <fieldset>
              <legend className="sr-only">Timer</legend>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {MODES.map((mode) => {
                  const selected = timerType === mode.type;
                  return (
                    <label
                      key={mode.type}
                      className={`relative flex flex-col items-center justify-center gap-1 min-h-[88px] px-2 py-3 rounded-2xl border-[3px] text-center cursor-pointer transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-blue ${
                        selected
                          ? "bg-purple border-purple text-white shadow-[0_4px_0_#6d4bc4]"
                          : "bg-white border-blueStroke text-darkBlue hover:border-blue shadow-[0_4px_0_#98C3FF]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="timerType"
                        checked={selected}
                        onChange={() => chooseMode(mode.type)}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className="text-2xl sm:text-3xl">{mode.icon}</span>
                      <span className="text-sm sm:text-base font-bold leading-tight">{mode.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {timerType !== "none" && (
              <div className="space-y-4">
                <fieldset>
                  <legend className="mb-2 flex items-center gap-2 text-base font-bold text-darkBlue">
                    {timerType === "word" ? "Time for each word" : "Time for the whole quiz"}
                    {hasAiPaces && (
                      <span className="text-xs font-bold text-purple bg-white rounded-full px-2 py-0.5">
                        ✨ Picked for your grade
                      </span>
                    )}
                  </legend>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {paces.map((pace) => {
                      const seconds = forMode(pace.perWord);
                      const selected = timeAmount === seconds;
                      return (
                        <button
                          key={pace.label}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setTimeAmount(seconds)}
                          className={`flex flex-col items-center justify-center min-h-[56px] px-2 py-2 rounded-2xl border-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue ${
                            selected
                              ? "bg-purple border-purple text-white"
                              : "bg-white border-blueStroke text-darkBlue hover:border-blue"
                          }`}
                        >
                          <span className="text-sm sm:text-base font-bold">
                            {selected && <span aria-hidden="true">✓ </span>}
                            {pace.label}
                          </span>
                          <span className={`text-xs sm:text-sm font-semibold ${selected ? "text-white" : "text-darkBlue/80"}`}>
                            {formatTime(seconds)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {!hasAiPaces && listId && (
                  <button
                    type="button"
                    onClick={handleGenerateAiSuggestions}
                    disabled={generatingAiSuggestions || loadingAiSuggestions}
                    className="text-sm font-bold text-purple underline underline-offset-2 disabled:opacity-60 disabled:no-underline"
                  >
                    {loadingAiSuggestions
                      ? "Loading suggested times..."
                      : generatingAiSuggestions
                      ? "Picking the right pace..."
                      : "✨ Suggest times for my grade"}
                  </button>
                )}

                {/* Fine-tune any time; the buttons keep it in range, so it can't be invalid */}
                <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border-2 border-blueStroke px-3 py-2">
                  <span className="text-sm sm:text-base font-bold text-darkBlue">Or set your own</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjust(-1)}
                      disabled={timeAmount <= minTime}
                      aria-label="Less time"
                      className="w-11 h-11 rounded-full bg-skyBlue text-darkBlue text-2xl font-bold leading-none disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="min-w-[6.5rem] text-center text-base sm:text-lg font-bold text-darkBlue">
                      {formatTime(timeAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjust(1)}
                      disabled={timeAmount >= maxTime}
                      aria-label="More time"
                      className="w-11 h-11 rounded-full bg-skyBlue text-darkBlue text-2xl font-bold leading-none disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6 border-t-2 border-white flex flex-col items-center gap-3">
            <p className="text-sm sm:text-base font-semibold text-darkBlue text-center">{summary}</p>
            <CustomButton
              label="Start Quiz"
              variant="primary"
              size="small"
              onClick={() => onStart(timerType, timeAmount)}
              className="w-full max-w-xs py-3 text-lg"
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

const MODES: { type: TimerType; icon: string; label: string }[] = [
  { type: "none", icon: "😌", label: "No timer" },
  { type: "word", icon: "⏱️", label: "Each word" },
  { type: "list", icon: "⏳", label: "Whole quiz" },
];

// Used when the list has no AI-suggested paces (seconds per word)
const STANDARD_PACES = [
  { label: "Quick", perWord: 15 },
  { label: "Steady", perWord: 30 },
  { label: "Slow", perWord: 60 },
];

export default QuizTimerModal;
