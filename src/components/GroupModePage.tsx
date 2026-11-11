"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import { GroupedWord } from "@prisma/client";
import { useRouter } from "next/navigation";
import TextToSpeech from "./TextToSpeach";
import ConfirmationModal from "./ConfirmationModal";
import StudyCompletionModal from "./StudyCompletionModal";
import { autoSaveGroupAsStudied, markGroupsAsStudied } from "@/app/actions/prismaActions";
import { useListName } from "@/context/ListNameContext";
import { useSyncProgressOnLeave } from "@/lib/useSyncProgressOnLeave";
import { playSound } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import PracticeModeLayout, { getTileGap, getTileSize } from "./PracticeModeLayout";

// A word is done when every one of its letters has been checked as correct
const isRowDone = (states?: string[]) => !!states?.every((state) => state === "valid");

interface GroupModePageProps {
  listId: string;
  groupedWords: GroupedWord[];
  studiedPage: number;
}

const GroupModePage: React.FC<GroupModePageProps> = ({
  listId,
  groupedWords,
  studiedPage,
}) => {
  const router = useRouter();
  const { listName } = useListName();
  // A group counts as saved once every word in it is studied (from earlier sessions)
  const studiedGroups = React.useMemo(() => {
    const unstudied = new Set(groupedWords.filter((w) => !w.studied).map((w) => w.groupName));
    return [...new Set(groupedWords.map((w) => w.groupName))].filter((name) => !unstudied.has(name));
  }, [groupedWords]);
  const { autoSave, saveFinishedSession } = useSyncProgressOnLeave(Number(listId), studiedGroups);
  // All state declarations at the top
  // studiedPage is already the next unfinished group (studied groups + 1)
  // TODO: position-based resume breaks after list edits; needs per-group studied tracking
  const [currentPage, setCurrentPage] = useState(studiedPage || 1);
  const [highestReachedPage, setHighestReachedPage] = useState(studiedPage || 1);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(studiedPage - 1 || 0);
  const [userInputs, setUserInputs] = useState<Record<string, string[][]>>({});
  const [validationStates, setValidationStates] = useState<Record<string, string[][]>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Letter inputs of the current group, keyed "row-box"
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const getInput = (rowIndex: number, boxIndex: number) =>
    inputRefs.current[`${rowIndex}-${boxIndex}`];


   useEffect(() => {
      // Check and handle the start parameter on mount
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const startParam = params.get('start');
        
        if (startParam === '0') {
          setCurrentPage(1);
          setHighestReachedPage(1);
          setCurrentGroupIndex(0);
        }
  
        // Remove the start parameter from URL
        if (startParam && window.history) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('start');
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    }, []);

  const groups = React.useMemo(() => 
    groupedWords.reduce((acc, word) => {
      if (!acc[word.groupName]) {
        acc[word.groupName] = [];
      }
      acc[word.groupName].push(word);
      return acc;
    }, {} as Record<string, GroupedWord[]>)
  , [groupedWords]);

  // Every group is a page, including groups with a single word
  const validGroups = React.useMemo(() => 
    Object.keys(groups)
  , [groups]);

  // Saves only groups not saved yet; on a repeat run of a finished list it makes no call
  const saveSession = () =>
    saveFinishedSession(validGroups, (names) => markGroupsAsStudied(names, Number(listId)));

  const currentGroupName = validGroups[currentGroupIndex];
  const currentGroup = React.useMemo(() => 
    groups[currentGroupName] || [], 
    [groups, currentGroupName]
  );

  const correctCount = currentGroup.filter((_, rowIndex) =>
    isRowDone(validationStates[currentGroupName]?.[rowIndex])
  ).length;

  // Handlers
  const handlePageChange = React.useCallback((page: number) => {
    if (page >= 1 && page <= validGroups.length && page <= highestReachedPage) {
      const newGroupIndex = page - 1;
      setCurrentGroupIndex(newGroupIndex);
      setCurrentPage(page);
      
      // Reset the user inputs and validation states for the new page
      setUserInputs(prev => ({
        ...prev,
        [validGroups[newGroupIndex]]: groups[validGroups[newGroupIndex]]?.map(word => 
          Array(word.word.length).fill("")
        )
      }));
      setValidationStates(prev => ({
        ...prev,
        [validGroups[newGroupIndex]]: groups[validGroups[newGroupIndex]]?.map(word => 
          Array(word.word.length).fill("default")
        )
      }));
    }
  }, [validGroups, groups, highestReachedPage]);

  const handleInputChange = (
    rowIndex: number,
    boxIndex: number,
    value: string
  ) => {
    const currentInputs = [...(userInputs[currentGroupName] || [])];
    currentInputs[rowIndex] = [...(currentInputs[rowIndex] || [])];
    // If word length is <= 2, don't offset the index
    const targetIndex = currentGroup[rowIndex].word.length > 2 ? boxIndex + 2 : boxIndex;
    currentInputs[rowIndex][targetIndex] = value.slice(-1);
    
    setUserInputs(prev => ({
      ...prev,
      [currentGroupName]: currentInputs
    }));

    // Move focus to the next input box if it exists — only when a letter was typed.
    // On delete (Backspace) the cursor must stay in the emptied box.
    if (value.slice(-1) !== "") {
      getInput(rowIndex, boxIndex + 1)?.focus();
    }

    //  word is fully type or not
    const word = currentGroup[rowIndex].word.toLowerCase();
    const userWord = word.length > 2
      ? [...word.slice(0, 2), ...currentInputs[rowIndex].slice(2)].join("").toLowerCase()
      : (currentInputs[rowIndex] || []).join("").toLowerCase();

    const currentValidation = [...(validationStates[currentGroupName] || [])];
    currentValidation[rowIndex] = [...(currentValidation[rowIndex] || [])];
    
    if (userWord.length === word.length) {
      const isMatch = word === userWord;
      currentValidation[rowIndex] = Array(word.length).fill(isMatch ? "valid" : "invalid");
      if (isMatch) {
        celebrate();
        playSound("correct");
        // Carry on to the next word that isn't finished yet
        const nextRow = currentGroup.findIndex(
          (_, i) => i > rowIndex && !isRowDone(currentValidation[i])
        );
        if (nextRow !== -1) focusInput(nextRow, 0);
      } else {
        playSound("wrong");
      }
    } else {
      // Reset to default during typing
      const targetIndex = word.length > 2 ? boxIndex + 2 : boxIndex;
      currentValidation[rowIndex][targetIndex] = "default";
    }
    
    setValidationStates(prev => ({
      ...prev,
      [currentGroupName]: currentValidation
    }));
  };

  const focusInput = (rowIndex: number, boxIndex: number) => {
    // After React has re-rendered (a reset row is read-only until then)
    setTimeout(() => getInput(rowIndex, boxIndex)?.focus(), 0);
  };

  const handleKeyDown = (rowIndex: number, boxIndex: number, key: string) => {
    // Same index mapping as handleInputChange (no offset for words of 2 letters or fewer)
    const targetIndex = currentGroup[rowIndex].word.length > 2 ? boxIndex + 2 : boxIndex;
    // Arrow keys move between the boxes of a word
    if (key === "ArrowLeft" || key === "ArrowRight") {
      getInput(rowIndex, boxIndex + (key === "ArrowLeft" ? -1 : 1))?.focus();
      return;
    }
    if (
      key === "Backspace" &&
      boxIndex > 0 &&
      !userInputs[currentGroupName]?.[rowIndex]?.[targetIndex]
    ) {
      getInput(rowIndex, boxIndex - 1)?.focus();
    }
  };

  //reset buttonn
  const handleReset = (rowIndex: number) => {
    const currentInputs = [...(userInputs[currentGroupName] || [])];
    currentInputs[rowIndex] = Array(currentGroup[rowIndex].word.length).fill("");
    setUserInputs(prev => ({
      ...prev,
      [currentGroupName]: currentInputs
    }));

    const currentValidation = [...(validationStates[currentGroupName] || [])];
    currentValidation[rowIndex] = Array(
      currentGroup[rowIndex].word.length
    ).fill("default");
    setValidationStates(prev => ({
      ...prev,
      [currentGroupName]: currentValidation
    }));
    focusInput(rowIndex, 0);
  };

  // Start each group with the cursor in the first box. Not on touch screens: there it would
  // pop the keyboard up over the words before the kid has listened to anything.
  useEffect(() => {
    if (!currentGroupName || window.matchMedia("(pointer: coarse)").matches) return;
    const timer = setTimeout(() => inputRefs.current["0-0"]?.focus(), 0);
    return () => clearTimeout(timer);
  }, [currentGroupName]);

  // Effects
  useEffect(() => {
    if (currentGroupName && currentGroup.length > 0) {
      // Initialize states only if they don't exist for current group
      if (!userInputs[currentGroupName]) {
        setUserInputs(prev => ({
          ...prev,
          [currentGroupName]: currentGroup.map(word => Array(word.word.length).fill(""))
        }));
      }
      if (!validationStates[currentGroupName]) {
        setValidationStates(prev => ({
          ...prev,
          [currentGroupName]: currentGroup.map(word => Array(word.word.length).fill("default"))
        }));
      }
    }
  }, [currentGroupName, currentGroup, userInputs, validationStates]);

  useEffect(() => {
    if (!validationStates[currentGroupName]) return;

    const allWordsCorrect = currentGroup.every((_, rowIndex) =>
      isRowDone(validationStates[currentGroupName][rowIndex])
    );

    if (allWordsCorrect) {
      console.log(`All words correct in group: ${currentGroupName}`);

      // Auto-save in the background so progress survives back/refresh/closing the tab.
      // autoSave skips groups already saved (this effect re-runs often) and retries failed ones.
      const savedGroupName = currentGroupName;
      autoSave(savedGroupName, () => autoSaveGroupAsStudied(savedGroupName, Number(listId)));

      // If we're on the last page, show completion modal
      if (currentPage === validGroups.length) {
        setHighestReachedPage(prevHighest => Math.max(prevHighest, currentPage));
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 2000);
        return;
      }
      
      // Otherwise, prepare to move to the next page
      setHighestReachedPage(prevHighest => Math.max(prevHighest, currentPage + 1));
      
      const timer = setTimeout(() => {
        console.log(`Moving to next group: ${currentGroupName}`);
        handlePageChange(currentPage + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentGroupName, currentGroup, validationStates, currentPage, validGroups.length, handlePageChange, listId, autoSave]);

  return (
    <PracticeModeLayout
      title="Word Group Mode"
      listName={listName}
      onClose={() => setShowConfirmation(true)}
      closeDisabled={isConfirmLoading}
      currentPage={currentPage}
      totalPages={validGroups.length}
      highestReachedPage={highestReachedPage}
      onPageChange={handlePageChange}
      itemLabel="Group"
      instruction="Hear each word, then type the missing letters!"
    >
      <p className="sr-only" role="status" aria-live="polite">
        {`${correctCount} of ${currentGroup.length} words correct`}
      </p>
      <div className="w-full max-w-3xl flex flex-col gap-3 sm:gap-4 text-darkBlue">
        {/* Render current group of words */}
        {currentGroup.map((word, rowIndex) => {
          const hint = word.word.length > 2 ? word.word.slice(0, 2).split("") : [];
          const rowStates = validationStates[currentGroupName]?.[rowIndex];
          const isRowCorrect = isRowDone(rowStates);
          const isRowWrong = rowStates?.includes("invalid");
          const tileSize = getTileSize(word.word.length);
          const tileGap = getTileGap(word.word.length);

          return (
            <div
              key={rowIndex}
              role="group"
              aria-label={`Word ${rowIndex + 1}${isRowCorrect ? ", correct" : isRowWrong ? ", not right yet" : ""}`}
              // Mobile: speaker / label / status on top, letters full width below.
              // From sm up everything sits on one row.
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:gap-x-4 rounded-2xl border-2 p-2.5 sm:p-4 shadow-sm transition-colors ${
                isRowCorrect
                  ? "bg-greenLite border-deepGreen"
                  : isRowWrong
                  ? "bg-red-50 border-red-600 motion-safe:animate-wiggle"
                  : "bg-white border-blueStroke"
              }`}
            >
              {/* Speaker Button */}
              <div className="col-start-1 row-start-1 transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-95">
                <TextToSpeech
                  spell={word.word}
                  heightWidth={52}
                  label={`Hear word ${rowIndex + 1}`}
                  imgClassName="w-11 h-11 sm:w-[52px] sm:h-[52px]"
                />
              </div>

              <span className="col-start-2 row-start-1 sm:hidden text-sm font-bold">
                Word {rowIndex + 1}
              </span>

              <div className={`col-span-3 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 flex flex-wrap items-center justify-center ${tileGap}`}>
                {/* letters already shown at the start */}
                {hint.map((letter, index) => (
                  <div
                    className={`${tileSize} flex items-center justify-center border-2 border-darkGreen bg-skyBlue text-inkGreen rounded-xl font-bold`}
                    key={index}
                    aria-label={`Letter ${index + 1}: ${letter} (given)`}
                  >
                    {letter}
                  </div>
                ))}

                {/* Input Boxes */}
                {Array.from({
                  length: word.word.length - hint.length,
                }).map((_, boxIndex) => {
                  const targetIndex = boxIndex + hint.length;
                  const state = rowStates?.[targetIndex];
                  return (
                    <input
                      ref={(el) => {
                        inputRefs.current[`${rowIndex}-${boxIndex}`] = el;
                      }}
                      type="text"
                      key={boxIndex}
                      maxLength={1}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-label={`Word ${rowIndex + 1}, letter ${targetIndex + 1}`}
                      readOnly={isRowCorrect}
                      value={userInputs[currentGroupName]?.[rowIndex]?.[targetIndex] || ""}
                      onChange={(e) =>
                        handleInputChange(rowIndex, boxIndex, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(rowIndex, boxIndex, e.key)}
                      className={`${tileSize} p-0 text-center border-2 rounded-xl font-bold lowercase transition-colors focus:outline-none focus:ring-4 focus:ring-blue/40 focus:border-blue ${
                        state === "valid"
                          ? "border-deepGreen bg-deepGreen text-white"
                          : state === "invalid"
                          ? "border-red-600 bg-red-100 text-red-700"
                          : "border-darkGreen bg-white text-darkBlue"
                      }`}
                    />
                  );
                })}
              </div>

              <div className="col-start-3 row-start-1 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                {isRowCorrect ? (
                  <Image
                    src="/images/completeIcon.svg"
                    alt="Correct"
                    width={48}
                    height={48}
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  />
                ) : isRowWrong ? (
                  <Button
                    onClick={() => handleReset(rowIndex)}
                    aria-label={`Try word ${rowIndex + 1} again`}
                    className="rounded-full transition-transform motion-safe:hover:scale-110 motion-safe:active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue"
                  >
                    <Image
                      src="/images/resetIcon.svg"
                      alt=""
                      width={48}
                      height={48}
                      className="w-10 h-10 sm:w-12 sm:h-12"
                    />
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => !isConfirmLoading && setShowConfirmation(false)}
        // Each completed group is auto-saved when finished, so leaving needs no save
        onConfirm={() => router.push(`/spellPractice/${listId}`)}
        title="Leave Practice"
        message={error || "Your completed groups are already saved. Leave this practice?"}
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
            setCurrentGroupIndex(0);
            // Reset user inputs and validation states for the first group
            const firstGroupName = validGroups[0];
            if (firstGroupName && groups[firstGroupName]) {
              setUserInputs({
                [firstGroupName]: groups[firstGroupName].map((word) =>
                  Array(word.word.length).fill("")
                ),
              });
              setValidationStates({
                [firstGroupName]: groups[firstGroupName].map((word) =>
                  Array(word.word.length).fill("default")
                ),
              });
            }
          }
        }}
        onContinue={async () => {
          try {
            setIsConfirmLoading(true);
            await saveSession();
            router.push(`/spellPractice/${listId}`);
          } catch (err) {
            setError(
              `Failed to save progress: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
            console.log("Error marking groups as studied:", err);
            setIsConfirmLoading(false);
          }
        }}
        isLoading={isConfirmLoading}
        mode="Group Mode"
      />
    </PracticeModeLayout>
  );
};

export default GroupModePage;
