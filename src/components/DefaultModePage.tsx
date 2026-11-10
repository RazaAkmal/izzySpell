"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { Word } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useDrag, useDrop } from "react-dnd";
import DragDropProvider from "./WordBuilder/DragDropProvider";
import ConfirmationModal from "./ConfirmationModal";
import StudyCompletionModal from "./StudyCompletionModal";
import { autoSaveWordAsStudied, markWordsAsStudied } from "@/app/actions/prismaActions";
import { useListName } from "@/context/ListNameContext";
import { useSyncProgressOnLeave } from "@/lib/useSyncProgressOnLeave";
import { shuffleArray } from "@/lib/shuffle";
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

interface DefaultModePageProps {
  words: Pick<Word, "id" | "word">[];
  listId: string;
  // Words already saved as studied (from earlier sessions)
  studiedWordIds: number[];
  // After a wrong answer, show which letters are in the right spot (younger grades)
  showLetterHints: boolean;
}

// Wrong tries on a word before the Hint button appears
const HINT_AFTER_WRONG_TRIES = 2;

// What is being dragged: a tile from the letter pool or a filled answer box
interface DragItem {
  from: "pool" | "slot";
  index: number;
}

const ItemTypes = {
  LETTER: "letter",
};

// All letter moves go through this reducer, so drag/drop and click handlers only
// dispatch and can never act on a stale copy of the letters. Letters are lowercase
// (a capital tile would give away the first letter); the answer is checked against the
// lowercased word.
interface Board {
  slots: string[];
  pool: string[];
}

type BoardAction =
  | { type: "reset"; word: string; pool: string[] }
  // Into the given box (replacing what's there), or the first empty box
  | { type: "place"; poolIndex: number; slot?: number }
  | { type: "move"; from: number; to: number }
  | { type: "return"; slot: number }
  // Put the next correct letter in place (target is the lowercased word)
  | { type: "hint"; target: string };

const boardReducer = (board: Board, action: BoardAction): Board => {
  switch (action.type) {
    case "reset":
      return { slots: Array(action.word.length).fill(""), pool: action.pool };
    case "place": {
      const letter = board.pool[action.poolIndex];
      const slot = action.slot ?? board.slots.indexOf("");
      if (letter === undefined || slot === -1) return board;
      const pool = board.pool.filter((_, i) => i !== action.poolIndex);
      const slots = [...board.slots];
      if (slots[slot]) pool.push(slots[slot]);
      slots[slot] = letter;
      return { slots, pool };
    }
    case "move": {
      const slots = [...board.slots];
      [slots[action.from], slots[action.to]] = [slots[action.to], slots[action.from]];
      return { ...board, slots };
    }
    case "return": {
      const letter = board.slots[action.slot];
      if (!letter) return board;
      const slots = [...board.slots];
      slots[action.slot] = "";
      return { slots, pool: [...board.pool, letter] };
    }
    case "hint": {
      const slot = board.slots.findIndex((letter, i) => letter !== action.target[i]);
      if (slot === -1) return board;
      const needed = action.target[slot];
      const slots = [...board.slots];
      const pool = [...board.pool];
      // Clear a wrong letter out of the box first
      if (slots[slot]) pool.push(slots[slot]);
      slots[slot] = "";
      const poolIndex = pool.indexOf(needed);
      if (poolIndex !== -1) {
        pool.splice(poolIndex, 1);
      } else {
        // The letter is sitting in the wrong box: move it over
        const from = slots.findIndex((letter, i) => letter === needed && letter !== action.target[i]);
        if (from === -1) return board;
        slots[from] = "";
      }
      slots[slot] = needed;
      return { slots, pool };
    }
  }
};

const LetterComponent = ({
  letter,
  index,
  onPick,
  sizeClass,
}: {
  letter: string;
  index: number;
  onPick: (index: number) => void;
  sizeClass: string;
}) => {
  const dragStartPos = React.useRef<{ x: number; y: number } | null>(null);
  const lastDragPos = React.useRef<{ x: number; y: number } | null>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.LETTER,
      item: { from: "pool", index } as DragItem,
      end: (_item, monitor) => {
        // A drag that barely moved and wasn't dropped is really a click — but the browser
        // has already suppressed the real `click` event, so pick the letter here. A real
        // drag let go over empty space just snaps the letter back. The touch backend
        // reports the distance; the HTML5 backend reports 0 when the drop isn't on a
        // target, so also use the native drag events' positions.
        const moved = monitor.getDifferenceFromInitialOffset();
        const nativeStart = dragStartPos.current;
        const nativeEnd = lastDragPos.current;
        const distance = Math.max(
          moved ? Math.hypot(moved.x, moved.y) : 0,
          nativeStart && nativeEnd
            ? Math.hypot(nativeEnd.x - nativeStart.x, nativeEnd.y - nativeStart.y)
            : 0
        );
        if (!monitor.didDrop() && distance < 10) {
          onPick(index);
        }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [index, onPick]
  );

  const ref = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    drag(ref);
  }, [drag]);

  // A real button, so letters can also be picked with Tab + Enter/Space
  return (
    <button
      type="button"
      ref={ref}
      aria-label={`Letter ${letter}`}
      onDragStart={(e) => {
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        lastDragPos.current = { x: e.clientX, y: e.clientY };
      }}
      // The last drag event reports 0,0 in Chrome, so ignore that one
      onDrag={(e) => {
        if (e.clientX || e.clientY) lastDragPos.current = { x: e.clientX, y: e.clientY };
      }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${sizeClass} bg-lightGreen border-2 sm:border-[3px] border-darkGreen text-inkGreen font-bold flex items-center justify-center rounded-xl sm:rounded-2xl cursor-pointer select-none touch-none shadow-[0_4px_0_#058D6E] transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0.5 active:shadow-[0_1px_0_#058D6E] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2`}
      onClick={() => onPick(index)}
    >
      {letter}
    </button>
  );
};

const SlotComponent = ({
  letter,
  index,
  dispatch,
  sizeClass,
  status,
  tone,
}: {
  letter: string;
  index: number;
  dispatch: React.Dispatch<BoardAction>;
  sizeClass: string;
  // Status of the whole word (a correct word is locked)
  status: AnswerStatus;
  // Colour of this box: the word's status, or per letter when letter hints are on
  tone: AnswerStatus;
}) => {
  // A correct word is locked until the next word loads
  const locked = status === "correct";

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.LETTER,
      canDrop: () => !locked,
      collect: (monitor) => ({
        isOver: !!monitor.isOver() && monitor.canDrop(),
      }),
      drop: (item: DragItem) =>
        dispatch(
          item.from === "pool"
            ? { type: "place", poolIndex: item.index, slot: index }
            : { type: "move", from: item.index, to: index }
        ),
    }),
    [index, locked, dispatch]
  );

  const canRemove = !!letter && !locked;

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.LETTER,
      item: { from: "slot", index } as DragItem,
      canDrag: () => canRemove,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [index, canRemove]
  );

  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    drop(ref);
    drag(ref);
  }, [drop, drag]);

  // Tap/Enter on a filled box sends its letter back (the non-drag way to undo a letter)
  const remove = () => canRemove && dispatch({ type: "return", slot: index });

  return (
    <div
      ref={ref}
      role={canRemove ? "button" : undefined}
      tabIndex={canRemove ? 0 : undefined}
      aria-label={
        letter
          ? `Box ${index + 1}: ${letter}${
              status === "wrong" && tone !== status ? ", right spot" : ""
            }${canRemove ? ", tap to take it back" : ""}`
          : `Box ${index + 1}: empty`
      }
      onClick={remove}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          remove();
        }
      }}
      className={`${sizeClass} border-2 rounded-xl flex items-center justify-center font-bold text-white select-none transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2 ${
        isOver ? "bg-yellow-200 border-orange" : tileStatusClass(tone, !!letter)
      } ${canRemove ? "cursor-pointer" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {letter}
    </div>
  );
};

// Defined at module level (not inside DefaultModePage) so React does not remount it
// and its letters on every render
const ScrambledDropZone = ({
  letters,
  dispatch,
  onPick,
  sizeClass,
  gapClass,
  emptyHint,
}: {
  letters: string[];
  dispatch: React.Dispatch<BoardAction>;
  onPick: (index: number) => void;
  sizeClass: string;
  gapClass: string;
  emptyHint?: string;
}) => {
  // Only answer boxes can be dropped here. A pool tile let go over the pool (a wobbly
  // click) is then "not dropped", so LetterComponent treats it as a tap.
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.LETTER,
      canDrop: (item: DragItem) => item.from === "slot",
      drop: (item: DragItem) => dispatch({ type: "return", slot: item.index }),
      collect: (monitor) => ({
        isOver: !!monitor.isOver() && monitor.canDrop(),
      }),
    }),
    [dispatch]
  );

  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    drop(ref);
  }, [drop]);

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Letters to use"
      className={`flex flex-wrap justify-center ${gapClass} px-3 pt-1 pb-2 sm:px-4 rounded-2xl min-h-[4rem] sm:min-h-[5rem] w-full transition-colors ${
        isOver ? "bg-yellow-100" : "bg-transparent"
      }`}
    >
      {letters.length > 0 ? (
        letters.map((letter, index) => (
          <LetterComponent
            letter={letter}
            index={index}
            key={index}
            onPick={onPick}
            sizeClass={sizeClass}
          />
        ))
      ) : emptyHint ? (
        <p className="self-center text-sm sm:text-base font-semibold text-darkBlue text-center">
          {emptyHint}
        </p>
      ) : null}
    </div>
  );
};

const DefaultModePage: React.FC<DefaultModePageProps> = ({
  words,
  listId,
  studiedWordIds,
  showLetterHints,
}) => {
  const wordsSpell = words.map((word) => word.word);
  const { listName } = useListName();
  const router = useRouter();
  const { autoSave, saveFinishedSession } = useSyncProgressOnLeave(Number(listId), studiedWordIds);
  // Saves only words not saved yet; on a repeat run of a finished list it makes no call
  const saveSession = () =>
    saveFinishedSession(
      words.map((word) => word.id),
      markWordsAsStudied
    );
  // Resume on the first unfinished word (the one after the studied ones); when everything is
  // studied this is the last word, and "Begin Again" restarts from the first.
  // TODO: position-based resume breaks after list edits; needs per-word studied tracking
  const resumePage = Math.min(studiedWordIds.length + 1, words.length) || 1;
  // "Begin Again" links here with ?start=0. Read while rendering, not in the mount effect:
  // Strict Mode runs that effect twice, and the second run no longer saw the parameter
  // (the first run removes it), so it jumped to the resume word with the stars reset.
  const startPage = useSearchParams().get("start") === "0" ? 1 : resumePage;
  const [currentPage, setCurrentPage] = useState(startPage);
  const [highestReachedPage, setHighestReachedPage] = useState(startPage);
  // Starts empty and is filled on mount, so the random scramble never runs on the server
  const [board, dispatch] = useReducer(boardReducer, { slots: [], pool: [] });
  // Latest board for the keyboard listener, so it isn't re-attached on every letter move
  const boardRef = useRef(board);
  boardRef.current = board;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [wrongTries, setWrongTries] = useState(0);

  const currentWord = wordsSpell[currentPage - 1];
  const target = currentWord?.toLowerCase() ?? "";

  // Every page change goes through here, so the page and its letters always change in
  // the same render (a fresh scramble each time)
  const goToPage = (page: number) => {
    const word = wordsSpell[page - 1];
    if (!word) return;
    setCurrentPage(page);
    setWrongTries(0);
    dispatch({ type: "reset", word, pool: shuffleArray([...word.toLowerCase()]) });
  };

  useEffect(() => {
    // Deal the first word's letters on mount (startPage is fixed for this render, so a second
    // Strict Mode run does the same thing)
    goToPage(startPage);

    // Remove the start parameter from URL
    if (new URLSearchParams(window.location.search).has("start") && window.history) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("start");
      window.history.replaceState({}, "", newUrl.toString());
    }
    // Runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    // Allow navigation to any page up to the highest reached page
    if (page <= highestReachedPage) {
      goToPage(page);
    }
  };

  const isFilled = board.slots.length > 0 && board.slots.every((letter) => letter !== "");
  const guess = board.slots.join("");
  const answerStatus: AnswerStatus = !isFilled
    ? "idle"
    : guess === target
    ? "correct"
    : "wrong";

  // Sounds: a soft pop as letters land, a chime or an "uh-oh" when the word is complete
  const filledCount = board.slots.filter(Boolean).length;
  const prevFilledCount = useRef(0);
  useEffect(() => {
    if (filledCount > prevFilledCount.current && answerStatus === "idle") playSound("pop");
    prevFilledCount.current = filledCount;
    // Only when the number of placed letters changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filledCount]);

  // Every new wrong arrangement counts, including swapping letters in a full word
  useEffect(() => {
    if (answerStatus !== "wrong") return;
    playSound("wrong");
    setWrongTries((tries) => tries + 1);
  }, [answerStatus, guess]);

  // A correct word: celebrate, auto-save, then move on after a moment
  useEffect(() => {
    if (answerStatus !== "correct") return;
    celebrate();
    playSound("correct");
    // Auto-save in the background so progress survives back/refresh/closing the tab
    const answeredWordId = words[currentPage - 1]?.id;
    if (answeredWordId !== undefined) {
      autoSave(answeredWordId, () => autoSaveWordAsStudied(answeredWordId));
    }
    // Unlock the next word right away, so going back during the pause can't lock it again
    if (currentPage < wordsSpell.length) {
      setHighestReachedPage((highest) => Math.max(highest, currentPage + 1));
    }
    const timer = setTimeout(() => {
      if (currentPage < wordsSpell.length) {
        goToPage(currentPage + 1);
      } else {
        // Last word: show the completion modal
        setShowCompletionModal(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
    // Only when a word becomes correct (the board is locked until the page changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerStatus, currentPage]);

  const pickFromPool = React.useCallback(
    (poolIndex: number) => dispatch({ type: "place", poolIndex }),
    []
  );

  const handleReset = () => {
    // A fresh scramble of the same word; the wrong-try count (for the Hint button) stays
    dispatch({ type: "reset", word: currentWord, pool: shuffleArray([...currentWord.toLowerCase()]) });
  };

  const showHintButton = wrongTries >= HINT_AFTER_WRONG_TRIES && answerStatus !== "correct";

  // Physical keyboard: typing a letter picks a matching tile, Backspace sends the last
  // letter back. Ignored while a modal is open or another field has focus.
  useEffect(() => {
    if (showConfirmation || showCompletionModal || answerStatus === "correct") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (e.key === "Backspace") {
        const lastFilled = boardRef.current.slots.map((l) => l !== "").lastIndexOf(true);
        if (lastFilled !== -1) {
          e.preventDefault();
          dispatch({ type: "return", slot: lastFilled });
        }
        return;
      }
      if (e.key.length !== 1) return;
      // Pool letters are always lowercase
      const index = boardRef.current.pool.indexOf(e.key.toLowerCase());
      if (index !== -1) {
        e.preventDefault();
        dispatch({ type: "place", poolIndex: index });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [answerStatus, showConfirmation, showCompletionModal]);

  const tileSize = getTileSize(currentWord?.length ?? 0);
  const tileGap = getTileGap(currentWord?.length ?? 0);

  return (
    <DragDropProvider>
      <PracticeModeLayout
        title="Default Mode"
        titleImage="/images/titles/DefaultModeTitle.svg"
        listName={listName}
        onClose={() => setShowConfirmation(true)}
        closeDisabled={isConfirmLoading}
        currentPage={currentPage}
        totalPages={wordsSpell.length}
        highestReachedPage={highestReachedPage}
        onPageChange={handlePageChange}
        instruction="Listen and build the word!"
      >
        {currentWord && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-3 sm:gap-4">
            <ListenButton spell={currentWord} />

            <AnswerTray status={answerStatus} label="Your word" shakeKey={guess}>
              <div className={`flex flex-wrap justify-center ${tileGap}`}>
                {board.slots.map((letter, index) => (
                  <SlotComponent
                    // A correct word is shown with its real capitals
                    letter={answerStatus === "correct" ? currentWord[index] : letter}
                    index={index}
                    dispatch={dispatch}
                    key={index}
                    sizeClass={tileSize}
                    status={answerStatus}
                    tone={
                      answerStatus === "wrong" && showLetterHints && letter === target[index]
                        ? "correct"
                        : answerStatus
                    }
                  />
                ))}
              </div>
            </AnswerTray>

            {/* Only takes space once every slot is filled (the letter area is empty by then),
                so no gap is left while the word is being built */}
            <AnswerFeedback
              state={answerStatus}
              onReset={handleReset}
              correctText={getPraise(currentPage)}
            />

            {showHintButton && (
              <button
                type="button"
                onClick={() => dispatch({ type: "hint", target })}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-lightOrange text-darkGray font-bold text-base sm:text-lg border-2 border-darkOrange shadow-[0_3px_0_#C57306] transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0.5 active:shadow-[0_1px_0_#C57306] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue focus-visible:ring-offset-2"
              >
                <span aria-hidden="true">💡</span> Hint
                <span className="sr-only">: put the next letter in place</span>
              </button>
            )}

            <ScrambledDropZone
              letters={board.pool}
              dispatch={dispatch}
              onPick={pickFromPool}
              sizeClass={tileSize}
              gapClass={tileGap}
              emptyHint={
                answerStatus !== "wrong"
                  ? undefined
                  : showLetterHints
                  ? "Green letters are in the right spot. Tap a red one to send it back."
                  : "Tap a letter in your word to send it back"
              }
            />
          </div>
        )}
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
            setHighestReachedPage(1);
            goToPage(1);
          }
        }}
        onContinue={async () => {
          try {
            setIsConfirmLoading(true);
            await saveSession();
            router.push(`/spellPractice/${listId}`);
          } catch (err) {
            setError(`Failed to save progress: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('Error marking words as studied:', err);
            setIsConfirmLoading(false);
          }
        }}
        isLoading={isConfirmLoading}
        mode="Default Mode"
      />
    </DragDropProvider>
  );
};

export default DefaultModePage;
