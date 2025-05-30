"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import { GroupedWord } from "@prisma/client";
import { useRouter } from "next/navigation";
import CustomPagination from "./CustomPagination";
import TextToSpeech from "./TextToSpeach";
import ConfirmationModal from "./ConfirmationModal";
import { markGroupAsStudied } from "@/app/actions/prismaActions";

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
  console.log(studiedPage, 'studiedPage');
  // All state declarations at the top
  const [currentPage, setCurrentPage] = useState(studiedPage || 1);
  const [highestReachedPage, setHighestReachedPage] = useState(studiedPage || 1);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(studiedPage - 1 || 0);
  const [userInputs, setUserInputs] = useState<Record<string, string[][]>>({});
  const [validationStates, setValidationStates] = useState<Record<string, string[][]>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


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

  const validGroups = React.useMemo(() => 
    Object.keys(groups).filter((groupName) => groups[groupName].length > 1)
  , [groups]);

  const currentGroupName = validGroups[currentGroupIndex];
  const currentGroup = React.useMemo(() => 
    groups[currentGroupName] || [], 
    [groups, currentGroupName]
  );

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

    // Move focus to the next input box if it exists
    const nextInput = document.getElementById(
      `input-${rowIndex}-${boxIndex + 1}`
    );
    if (nextInput) {
      (nextInput as HTMLInputElement).focus();
    }

    //  word is fully type or not
    const word = currentGroup[rowIndex].word.toLowerCase();
    const userWord = word.length > 2
      ? [...word.slice(0, 2), ...currentInputs[rowIndex].slice(2)].join("").toLowerCase()
      : (currentInputs[rowIndex] || []).join("").toLowerCase();

    const currentValidation = [...(validationStates[currentGroupName] || [])];
    currentValidation[rowIndex] = [...(currentValidation[rowIndex] || [])];
    
    if (userWord.length === word.length) {
      currentValidation[rowIndex] =
        word === userWord
          ? Array(word.length).fill("valid")
          : Array(word.length).fill("invalid");
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

  const handleKeyDown = (rowIndex: number, boxIndex: number, key: string) => {
    if (
      key === "Backspace" &&
      boxIndex > 0 &&
      !userInputs[currentGroupName]?.[rowIndex]?.[boxIndex + 2]
    ) {
      const prevInput = document.getElementById(
        `input-${rowIndex}-${boxIndex - 1}`
      );
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
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
  };

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
      validationStates[currentGroupName][rowIndex]?.every((state) => state === "valid")
    );

    if (allWordsCorrect) {
      console.log(`All words correct in group: ${currentGroupName}`);
      
      // If we're on the last page, just update the highest reached page
      if (currentPage === validGroups.length) {
        setHighestReachedPage(prevHighest => Math.max(prevHighest, currentPage));
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
  }, [currentGroupName, currentGroup, validationStates, currentPage, validGroups.length, handlePageChange]);

  return (
    <div className="bg-skyBlue m-5 max-h-max rounded-md p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Icon */}
        <Image
          src="/images/settingIcon.svg"
          alt="Settings Icon"
          width={24}
          height={24}
          className="w-8 h-8"
        />

        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple text-center">
          Word Group Mode
        </p>
        <Button
          className="focus:outline-none"
          onClick={() => setShowConfirmation(true)}
          disabled={isConfirmLoading}
        >
          <Image
            src="/images/Vector.svg"
            alt="Cancel Button"
            width={24}
            height={24}
            className="w-8 h-8"
          />
        </Button>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <CustomPagination
          currentPage={currentPage}
          totalPages={validGroups.length}
          onPageChange={handlePageChange}
          highestReachedPage={highestReachedPage}
        />
      </div>

      <p className="text-xl text-darkBlue mb-6 text-center mt-7">
        Tap the speaker to hear the word, then type it below.
      </p>

      <div className="space-y-6 text-darkBlue">
        {/* Render current group of words */}
        {currentGroup.map((word, rowIndex) => (
          <div
            className="flex flex-wrap items-center justify-start flex-row md:justify-center gap-4"
            key={rowIndex}
          >
            {/* letters already shown at the start */}
            {word.word.length > 2 && word.word
              .split("")
              .slice(0, 2)
              .map((letter, index) => (
                <div
                  className="w-12 h-12 flex items-center justify-center border-[3px] border-darkGreen bg-gray-100 rounded-lg font-bold text-2xl"
                  key={index}
                >
                  {letter}
                </div>
              ))}

            {/* Input Boxes */}
            {Array.from({ length: word.word.length > 2 ? word.word.length - 2 : word.word.length }).map((_, boxIndex) => (
              <input
                id={`input-${rowIndex}-${boxIndex}`}
                type="text"
                key={boxIndex}
                maxLength={1}
                value={word.word.length > 2 
                  ? (userInputs[currentGroupName]?.[rowIndex]?.[boxIndex + 2] || "")
                  : (userInputs[currentGroupName]?.[rowIndex]?.[boxIndex] || "")}
                onChange={(e) =>
                  handleInputChange(rowIndex, boxIndex, e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(rowIndex, boxIndex, e.key)}
                className={`w-12 h-12 text-center border-[3px] rounded-lg text-2xl border-darkGreen font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  word.word.length > 2
                    ? validationStates[currentGroupName]?.[rowIndex]?.[boxIndex + 2] === "valid"
                    : validationStates[currentGroupName]?.[rowIndex]?.[boxIndex] === "valid"
                    ? "border-green-500"
                    : validationStates[currentGroupName]?.[rowIndex]?.[boxIndex + 2] === "invalid"
                    ? "border-red-500"
                    : "border-lightGreen "
                }`}
              />
            ))}

            {/* Speaker Button */}
            <TextToSpeech spell={word.word} heightWidth={48} />

            {validationStates[currentGroupName]?.[rowIndex]?.every((state) => state === "valid") ? (
              <Image
                src="/images/completeIcon.svg"
                alt="Correct"
                width={55}
                height={55}
              />
            ) : validationStates[currentGroupName]?.[rowIndex]?.includes("invalid") ? (
              <Button onClick={() => handleReset(rowIndex)}>
                <Image
                  src="/images/resetIcon.svg"
                  alt="Reset"
                  width={55}
                  height={55}
                />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => !isConfirmLoading && router.push(`/spellPractice/${listId}`)}
        onConfirm={async () => {
          try {
            setIsConfirmLoading(true);
            setError(null);
            // Mark each completed group as studied
            for (let pageIndex = 0; pageIndex < highestReachedPage; pageIndex++) {
              const groupName = validGroups[pageIndex];
              const groupValidation = validationStates[groupName];
              const groupWords = groups[groupName] || [];
              
              // Check if all words in this group are correct
              const allWordsInGroupCorrect = groupWords.every((_, rowIndex) =>
                groupValidation?.[rowIndex]?.every((state) => state === "valid")
              );

              if (allWordsInGroupCorrect) {
                await markGroupAsStudied(groupName, Number(listId));
              }
            }

            router.push(`/spellPractice/${listId}`);
          } catch (err) {
            setError(`Failed to save study progress: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('Error marking groups as studied:', err);
          } finally {
            setIsConfirmLoading(false);
          }
        }}
        title="Mark Groups as Studied"
        message={error || "Would you like to mark your completed groups as studied before leaving?"}
        isLoading={isConfirmLoading}
        confirmText="Yes"
      />
    </div>
  );
};

export default GroupModePage;
