"use client";
import React, { ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { isMuted, setMuted, subscribeMuted } from "@/lib/sounds";
import { prefersReducedMotion } from "@/lib/confetti";
import ListNamePill from "./ListNamePill";
import TextToSpeech from "./TextToSpeach";

// Round white icon button used in the header (sound toggle, close)
const ROUND_ICON_BUTTON =
  "w-11 h-11 rounded-full flex items-center justify-center bg-white text-darkBlue border-2 border-blueStroke shadow-sm transition-transform motion-safe:hover:scale-110 motion-safe:active:scale-95 hover:border-blue focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2";

interface PracticeModeLayoutProps {
  title: string;
  // Optional image title (e.g. the Default Mode SVG); the text title is still used as alt text
  titleImage?: string;
  listName?: string | null;
  onClose: () => void;
  closeDisabled?: boolean;
  currentPage: number;
  totalPages: number;
  highestReachedPage: number;
  // Without it the star track is display-only (Quiz mode moves with Previous/Next)
  onPageChange?: (page: number) => void;
  // "Word" or "Group": used in the star track's labels
  itemLabel?: string;
  // "answered" (Quiz): done words get a neutral blue star, since gold would suggest correct
  starTone?: "done" | "answered";
  // Hide the sound-effects toggle in modes that play no sound effects (Quiz)
  showSoundToggle?: boolean;
  instruction: ReactNode;
  children: ReactNode;
}

// Shared card, header and star track for the practice modes (Default, Syllables, Group)
const PracticeModeLayout: React.FC<PracticeModeLayoutProps> = ({
  title,
  titleImage,
  listName,
  onClose,
  closeDisabled = false,
  currentPage,
  totalPages,
  highestReachedPage,
  onPageChange,
  itemLabel = "Word",
  starTone = "done",
  showSoundToggle = true,
  instruction,
  children,
}) => {
  return (
    <div className="mx-6 mt-2 mb-6 md:mx-14 md:mt-0 lg:mx-[5.5rem] bg-skyBlue rounded-3xl shadow-lg p-3 sm:p-6 lg:p-8 flex flex-col">
      {/* Header: list name + close on one row on mobile, title centred between them from md up */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-4">
        <div className="flex justify-start min-w-0">
          <ListNamePill listName={listName} />
        </div>

        <div className="col-span-2 row-start-2 md:col-span-1 md:row-start-1 md:col-start-2 flex justify-center">
          {titleImage ? (
            <h1>
              <Image
                src={titleImage}
                alt={title}
                width={250}
                height={69}
                priority
                className="w-[180px] sm:w-[220px] lg:w-[250px] h-auto"
              />
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-purple [text-shadow:_2px_2px_0_#fff,_-1px_-1px_0_#fff,_1px_-1px_0_#fff,_-1px_1px_0_#fff,_3px_4px_0_rgba(149,108,252,0.35)]">
              {title}
            </h1>
          )}
        </div>

        <div className="flex justify-end gap-2 md:col-start-3">
          {showSoundToggle && <SoundToggle />}
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Leave practice"
            className={`${ROUND_ICON_BUTTON} disabled:opacity-50`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <StarTrack
        currentPage={currentPage}
        totalPages={totalPages}
        highestReachedPage={highestReachedPage}
        onPageChange={onPageChange}
        itemLabel={itemLabel}
        tone={starTone}
      />

      <p className="mt-3 md:mt-4 text-lg sm:text-xl md:text-2xl font-bold text-darkBlue text-center">
        {instruction}
      </p>

      {/* The card hugs its content and the game sits right under the instruction, so
          there are no large empty gaps on tall or wide screens */}
      <div className="flex flex-col items-center w-full pt-3 pb-2 md:pt-4 md:pb-4">
        {children}
      </div>
    </div>
  );
};

const starSize = (total: number) =>
  total <= 10 ? "w-8 h-8 sm:w-10 sm:h-10" : total <= 20 ? "w-6 h-6 sm:w-8 sm:h-8" : "w-5 h-5 sm:w-6 sm:h-6";

// One star per word: filled for done words, a bigger glowing star for the current word.
// Easier for young kids to read than page numbers, and every word stays visible (the old
// numbered pagination hid some numbers behind an ellipsis). Done words can be revisited.
const StarTrack: React.FC<{
  currentPage: number;
  totalPages: number;
  highestReachedPage: number;
  onPageChange?: (page: number) => void;
  itemLabel: string;
  tone: "done" | "answered";
}> = ({ currentPage, totalPages, highestReachedPage, onPageChange, itemLabel, tone }) => {
  const size = starSize(totalPages);
  const doneLabel = tone === "answered" ? "answered" : "done";
  return (
    <nav
      aria-label={`${itemLabel} ${currentPage} of ${totalPages}`}
      className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
    >
      <ol className="flex flex-wrap justify-center gap-1 sm:gap-1.5 max-w-2xl">
        {Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          const isCurrent = page === currentPage;
          const isDone = page < highestReachedPage;
          const isReachable = page <= highestReachedPage;
          const label = `${itemLabel} ${page}${isDone ? `, ${doneLabel}` : ""}`;
          const star = (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-full h-full">
              <path
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
                strokeLinejoin="round"
                strokeWidth={1.8}
                className={
                  isDone
                    ? tone === "answered"
                      ? "fill-blueStroke stroke-blue"
                      : "fill-lightOrange stroke-darkOrange"
                    : isCurrent
                    ? "fill-white stroke-purple motion-safe:animate-pulse"
                    : isReachable
                    ? "fill-white stroke-blue"
                    : "fill-white/60 stroke-blueStroke"
                }
              />
            </svg>
          );
          const shape = `${size} rounded-full flex items-center justify-center transition-transform ${
            isCurrent ? "scale-125" : ""
          }`;
          return (
            <li key={page} aria-current={!onPageChange && isCurrent ? "step" : undefined}>
              {onPageChange ? (
                <button
                  type="button"
                  disabled={!isReachable}
                  onClick={() => !isCurrent && onPageChange(page)}
                  aria-label={`${label}${isReachable ? "" : ", locked"}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`${shape} focus:outline-none focus-visible:ring-4 focus-visible:ring-blue ${
                    isCurrent ? "" : isReachable ? "motion-safe:hover:scale-110" : "cursor-not-allowed"
                  }`}
                >
                  {star}
                </button>
              ) : (
                <span role="img" aria-label={label} className={shape}>
                  {star}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <span className="text-sm font-semibold text-darkBlue whitespace-nowrap" aria-hidden="true">
        {currentPage} / {totalPages}
      </span>
    </nav>
  );
};

// Turns the practice sound effects on/off (the spoken word is not affected)
const SoundToggle: React.FC = () => {
  // Server render assumes "on"; the saved choice is read on the client
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={!muted}
      aria-label="Sound effects"
      title={muted ? "Sound effects off" : "Sound effects on"}
      className={ROUND_ICON_BUTTON}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />}
      </svg>
    </button>
  );
};

// Letter-box size that keeps a whole word on one row where possible: long words get
// smaller boxes instead of wrapping (wrapping is still the fallback on very narrow screens)
export const getTileSize = (length: number) => {
  if (length <= 4) return "w-12 h-12 text-2xl sm:w-16 sm:h-16 sm:text-3xl lg:w-20 lg:h-20 lg:text-4xl";
  if (length <= 6) return "w-9 h-9 text-xl sm:w-14 sm:h-14 sm:text-3xl lg:w-[4.5rem] lg:h-[4.5rem] lg:text-4xl";
  if (length <= 8) return "w-7 h-7 text-lg sm:w-12 sm:h-12 sm:text-2xl lg:w-16 lg:h-16 lg:text-3xl";
  if (length <= 11) return "w-6 h-6 text-base sm:w-11 sm:h-11 sm:text-2xl";
  return "w-6 h-6 text-base sm:w-9 sm:h-9 sm:text-xl";
};

// Gap that goes with getTileSize so narrow tiles don't sit far apart
export const getTileGap = (length: number) =>
  length <= 4 ? "gap-2 sm:gap-3" : length <= 6 ? "gap-1.5 sm:gap-3" : "gap-1 sm:gap-2";

export type AnswerStatus = "idle" | "correct" | "wrong";

// Colours for a letter box in the answer tray
export const tileStatusClass = (status: AnswerStatus, filled: boolean) =>
  !filled
    ? "bg-greenLite border-darkGreen border-dashed"
    : status === "correct"
    ? "bg-deepGreen border-deepGreen"
    : status === "wrong"
    ? "bg-red-600 border-red-600"
    : "bg-darkGreen border-darkGreen";

// The big "hear the word" speaker above the answer; says each new word by itself
export const ListenButton: React.FC<{ spell: string; onUnavailable?: () => void }> = ({
  spell,
  onUnavailable,
}) => (
  <div className="flex flex-col items-center gap-1">
    <div className="rounded-2xl transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-95 drop-shadow-md">
      <TextToSpeech
        heightWidth={64}
        spell={spell}
        imgClassName="w-16 h-16 lg:w-20 lg:h-20"
        onUnavailable={onUnavailable}
        autoPlay
      />
    </div>
    <span className="text-xs sm:text-sm font-semibold text-darkBlue">Listen</span>
  </div>
);

// Varied, upbeat praise so a correct answer feels like a small win each time
const PRAISE = ["Great job!", "Awesome!", "You got it!", "Super speller!", "Fantastic!", "Way to go!"];
export const getPraise = (seed: number) => PRAISE[Math.abs(seed) % PRAISE.length];

// Same motion as the `wiggle` animation in tailwind.config.ts; keep the two in step
const SHAKE: Keyframe[] = [0, -5, 5, -5, 5, -5, 5, -5, 5, 0].map((x) => ({
  transform: `translateX(${x}px)`,
}));

// White tray around the answer boxes. A wrong answer shakes it; the shake is replayed
// with the Web Animations API so the boxes inside are never remounted. Pass shakeKey to
// shake again when a new wrong answer keeps the status at "wrong".
export const AnswerTray: React.FC<{
  status: AnswerStatus;
  label: string;
  shakeKey?: unknown;
  children: ReactNode;
}> = ({ status, label, shakeKey, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "wrong" && !prefersReducedMotion()) {
      ref.current?.animate?.(SHAKE, { duration: 600, easing: "ease-in-out" });
    }
  }, [status, shakeKey]);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={`max-w-full bg-white rounded-2xl sm:rounded-3xl border-[3px] p-3 sm:p-4 shadow-md transition-colors ${
        status === "correct" ? "border-deepGreen" : status === "wrong" ? "border-red-600" : "border-darkGreen"
      }`}
    >
      {children}
    </div>
  );
};

// Status under an answer. The live region is always mounted (an aria-live region added
// together with its text often isn't announced).
export const AnswerFeedback: React.FC<{
  state: AnswerStatus;
  onReset?: () => void;
  correctText: string;
  wrongText?: string;
}> = ({ state, onReset, correctText, wrongText = "Almost! Try again." }) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex items-center justify-center ${state !== "idle" ? "min-h-[56px]" : ""}`}
  >
    {state === "correct" && (
      <div className="flex items-center gap-2 bg-white rounded-full pl-1 pr-5 py-1 shadow-md motion-safe:animate-pop">
        <Image src="/images/completeIcon.svg" alt="" width={44} height={44} className="w-10 h-10 sm:w-11 sm:h-11" />
        <span className="text-lg sm:text-xl font-bold text-deepGreen">{correctText}</span>
      </div>
    )}
    {state === "wrong" && (
      <div className={`flex items-center gap-2 bg-white rounded-full shadow-md ${onReset ? "pl-5 pr-1 py-1" : "px-5 py-2"}`}>
        <span className="text-lg sm:text-xl font-bold text-red-600">{wrongText}</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Start this word again"
            className="rounded-full transition-transform motion-safe:hover:scale-110 motion-safe:active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue"
          >
            <Image src="/images/resetIcon.svg" alt="" width={44} height={44} className="w-10 h-10 sm:w-11 sm:h-11" />
          </button>
        )}
      </div>
    )}
  </div>
);

export default PracticeModeLayout;
