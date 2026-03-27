"use client";

import React, {useEffect, useState, useTransition} from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import CustomButton from "./HeadlessButton";
import { getRecentQuizAttempts } from "@/app/actions/getRecentQuizAttempts";
import ModeCard, { ModeType, QuizAttempt } from "./ModeCard";
import { checkFlashCardsExist, checkScrambleWordsExist } from "@/app/actions/prismaActions";
import { generateAndSaveFlashCards, generateAndSaveScrambleWords } from "@/app/actions/AiService";

interface ModeConfigItem {
  id: ModeType;
  imageSrc: string;
  altText: string;
  label: string;
  completed: number;
  total: number;
  progress: number;
  showContinue: boolean;
  continueFrom: number;
  isRecentAttempts: boolean;
  recentAttempts?: QuizAttempt[];
  isMistakesPractice?: boolean;
}

interface PracticeWordModalProps {
  totalWords: number;
  studiedCount: number;
  studiedSyllableCount: number;
  studiedGroupCount: number;
  totalStudiedGroups: number;
  totalGroups: number;
  words: string[];
  initialRecentAttempts: QuizAttempt[];
  initialMistakesCount: number;
}

const PracticeWordModal: React.FC<PracticeWordModalProps> = ({
  totalWords,
  studiedCount,
  studiedSyllableCount,
  studiedGroupCount,
  totalGroups,
  totalStudiedGroups,
  words,
  initialRecentAttempts,
  initialMistakesCount,
}) => {
  const router = useRouter();
  const { listId } = useParams();
  const [isPending, startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = React.useState<"study" | "quiz" | "extra">("study");
  const [selectedMode, setSelectedMode] = React.useState<ModeType>("DefualtModePratice");
  const [recentAttempts, setRecentAttempts] = React.useState<QuizAttempt[]>(initialRecentAttempts);
  const [mistakesCount, setMistakesCount] = React.useState(initialMistakesCount);
  const [isLoadingQuizData, setIsLoadingQuizData] = React.useState(false);
  // Track whether we've already shown the pre-fetched data so we don't
  // re-fetch (and show a loading spinner) on the very first quiz tab click
  const hasShownInitialQuizData = React.useRef(false);
  const [isGeneratingFlashCards, setIsGeneratingFlashCards] = useState(false);
  const [isGeneratingScrambleWords, setIsGeneratingScrambleWords] = useState(false);
  const [flashCardsExist, setFlashCardsExist] = useState<boolean | null>(null); // null = checking, true = exist, false = don't exist
  const [scrambleWordsExist, setScrambleWordsExist] = useState<boolean | null>(null); // null = checking, true = exist, false = don't exist
  
  // Fetch recent quiz attempts when quiz tab is selected.
  // First click: skip (server pre-fetched). Subsequent clicks: refresh silently
  // in the background — show existing data immediately, update when done.
  useEffect(() => {
    if (selectedTab === "quiz" && listId) {
      if (!hasShownInitialQuizData.current) {
        hasShownInitialQuizData.current = true;
        return;
      }
      // No loading spinner — stale-while-revalidate pattern
      getRecentQuizAttempts(parseInt(listId as string, 10))
        .then((data) => {
          setRecentAttempts(data.attempts);
          setMistakesCount(data.uniqueMistakesCount);
        })
        .catch((error: Error) => {
          console.error("Failed to fetch quiz data:", error);
        });
    }
  }, [selectedTab, listId]);

  // Check if flash cards exist for this list on component mount
  useEffect(() => {
    if (listId) {
      const numericListId = parseInt(listId as string, 10);
      checkFlashCardsExist(numericListId)
        .then((result) => {
          setFlashCardsExist(result.success && result.exists);
        })
        .catch((error) => {
          console.error("Error checking flash cards:", error);
          setFlashCardsExist(false);
        });
    }
  }, [listId]);

  // Check if scramble words exist for this list on component mount
  useEffect(() => {
    if (listId) {
      const numericListId = parseInt(listId as string, 10);
      checkScrambleWordsExist(numericListId)
        .then((result) => {
          setScrambleWordsExist(result.success && result.exists);
        })
        .catch((error) => {
          console.error("Error checking scramble words:", error);
          setScrambleWordsExist(false);
        });
    }
  }, [listId]);

  // Update selected mode when tab changes
  useEffect(() => {
    if (selectedTab === "quiz") {
      setSelectedMode("RecentAttempts");
    } else if (selectedTab === "study") {
      setSelectedMode("DefualtModePratice");
    } else if (selectedTab === "extra") {
      setSelectedMode("ScrambleWords");
    }
  }, [selectedTab]);

  // Create mode configurations based on selected tab
  const modesConfig = React.useMemo<ModeConfigItem[]>(() => {
    if (selectedTab === "quiz") {
      return [
        {
          id: "RecentAttempts" as const,
          imageSrc: "",
          altText: "",
          label: "Recent Attempts",
          completed: 0,
          total: 0,
          progress: 0,
          showContinue: false,
          continueFrom: 0,
          isRecentAttempts: true,
          recentAttempts: recentAttempts,
          isMistakesPractice: false
        },
        {
          id: "QuizMode" as const,
          imageSrc: "/images/QuizMode.svg",
          altText: "Quiz Mode",
          label: "Start Quiz",
          completed: 0,
          total: 0,
          progress: 0,
          showContinue: false,
          continueFrom: 0,
          isRecentAttempts: false,
          isMistakesPractice: false
        },
        {
          id: "MistakesPractice" as const,
          imageSrc: "/images/PencelIcon.svg",
          altText: "Practice Mistakes",
          label: "Practice Mistakes",
          completed: 0,
          total: mistakesCount,
          progress: 0,
          showContinue: false,
          continueFrom: 0,
          isRecentAttempts: false,
          isMistakesPractice: true
        }
      ];
    }

    if (selectedTab === "extra") {
      return [
        {
          id: "ScrambleWords" as const,
          imageSrc: "/images/puzzlePiece.svg",
          altText: "Scramble Words",
          label: "Scramble Words",
          completed: 0,
          total: 0,
          progress: 0,
          showContinue: false,
          continueFrom: 0,
          isRecentAttempts: false,
          isMistakesPractice: false
        },
        {
          id: "FlashCards" as const,
          imageSrc: "/images/notesIcon.svg",
          altText: "Flash Cards",
          label: "Flash Cards",
          completed: 0,
          total: 0,
          progress: 0,
          showContinue: false,
          continueFrom: 0,
          isRecentAttempts: false,
          isMistakesPractice: false
        },
        {
          id: "WordMatch" as const,
          imageSrc: "/images/puzzlePiece.svg",
          altText: "Word Builder",
          label: "Word Builder",
          completed: 0,
          total: 0,
          progress: 0,
          showContinue: false,
          continueFrom: 0,
          isRecentAttempts: false,
          isMistakesPractice: false
        }
      ];
    }
    
    return [
      {
        id: "DefualtModePratice" as const,
        imageSrc: "/images/DefaultMode.svg",
        altText: "Default Mode",
        label: "Default Mode",
        completed: studiedCount,
        total: totalWords,
        progress: totalWords > 0 ? Math.round((studiedCount / totalWords) * 100) : 0,
        showContinue: studiedCount > 0,
        continueFrom: studiedCount,
        isRecentAttempts: false,
        recentAttempts: [],
        isMistakesPractice: false
      },
      {
        id: "SyllablesModePractice" as const,
        imageSrc: "/images/SyllabusMode.svg",
        altText: "syllables Mode",
        label: "Syllables Mode",
        completed: studiedSyllableCount,
        total: totalWords,
        progress: totalWords > 0 ? Math.round((studiedSyllableCount / totalWords) * 100) : 0,
        showContinue: studiedSyllableCount > 0,
        continueFrom: studiedSyllableCount,
        isRecentAttempts: false,
        recentAttempts: [],
        isMistakesPractice: false
      },
      {
        id: "GroupModePractice" as const,
        imageSrc: "/images/GroupMode.svg",
        altText: "Word Groups Mode",
        label: "Word Groups Mode",
        completed: totalStudiedGroups,
        total: totalGroups,
        progress: studiedGroupCount,
        showContinue: totalStudiedGroups > 0,
        continueFrom: totalStudiedGroups,
        isRecentAttempts: false,
        recentAttempts: [],
        isMistakesPractice: false
      }
    ];
  }, [selectedTab, totalWords, studiedCount, studiedSyllableCount, studiedGroupCount, totalGroups, totalStudiedGroups, recentAttempts, mistakesCount]);
  
  // Create a mapping for quick access
  const modeData = React.useMemo(() => {
    const map = {} as Record<ModeType, typeof modesConfig[0]>;
    modesConfig.forEach(mode => {
      map[mode.id] = mode;
    });
    return map;
  }, [modesConfig]);
  
  // Get current mode data
  const currentModeData = modeData[selectedMode];

  const navigateTo = (path: string) => {
    startTransition(() => {
      router.push(`/spellPractice/${listId}/${path}`);
    });
  };

  const handleFlashCardsNavigation = async () => {
    if (!listId || words.length === 0) {
      console.error("No list ID or words available");
      return;
    }

    // If we already know flash cards exist, navigate directly
    if (flashCardsExist === true) {
      navigateTo("FlashCards?start=0");
      return;
    }

    setIsGeneratingFlashCards(true);
    
    try {
      const numericListId = parseInt(listId as string, 10);
      
      // If we haven't checked yet or they don't exist, check again
      if (flashCardsExist === null || flashCardsExist === false) {
        const checkResult = await checkFlashCardsExist(numericListId);
        
        if (checkResult.success && checkResult.exists) {
          // Flash cards exist, update state and navigate directly
          setFlashCardsExist(true);
          navigateTo("FlashCards?start=0");
          return;
        }
      }

      // Generate flash cards if they don't exist
      const generateResult = await generateAndSaveFlashCards(numericListId, words);
      
      if (generateResult.success) {
        // Generation successful, update state and navigate to game
        setFlashCardsExist(true);
        navigateTo("FlashCards?start=0");
      } else {
        console.error("Failed to generate flash cards:", generateResult.error);
        alert("Failed to generate flash cards. Please try again.");
      }
    } catch (error) {
      console.error("Error in flash cards navigation:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsGeneratingFlashCards(false);
    }
  };

  const handleScrambleWordsNavigation = async () => {
    if (!listId || words.length === 0) {
      console.error("No list ID or words available");
      return;
    }

    // If we already know scramble words exist, navigate directly
    if (scrambleWordsExist === true) {
      navigateTo("ScrambleWords?start=0");
      return;
    }

    setIsGeneratingScrambleWords(true);
    
    try {
      const numericListId = parseInt(listId as string, 10);
      
      // If we haven't checked yet or they don't exist, check again
      if (scrambleWordsExist === null || scrambleWordsExist === false) {
        const checkResult = await checkScrambleWordsExist(numericListId);
        
        if (checkResult.success && checkResult.exists) {
          // Scramble words exist, update state and navigate directly
          setScrambleWordsExist(true);
          navigateTo("ScrambleWords?start=0");
          return;
        }
      }

      // Generate scramble words if they don't exist
      const generateResult = await generateAndSaveScrambleWords(numericListId, words);
      
      if (generateResult.success) {
        // Generation successful, update state and navigate to game
        setScrambleWordsExist(true);
        navigateTo("ScrambleWords?start=0");
      } else {
        console.error("Failed to generate scramble words:", generateResult.error);
        alert("Failed to generate scramble words. Please try again.");
      }
    } catch (error) {
      console.error("Error in scramble words navigation:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsGeneratingScrambleWords(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 justify-center px-2 sm:px-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <CustomButton
            size="small"
            label="Study"
            variant={selectedTab === "study" ? "primary" : "secondary"}
            radius="rounded"
            img="/images/bookIcon.svg"
            onClick={() => setSelectedTab("study")}
          />
          <CustomButton
            size="small"
            label="Quiz"
            variant={selectedTab === "quiz" ? "primary" : "secondary"}
            radius="rounded"
            img="/images/QuizIcon.svg"
            onClick={() => setSelectedTab("quiz")}
          />
          <CustomButton
            size="small"
            label="Extra"
            variant={selectedTab === "extra" ? "primary" : "secondary"}
            radius="rounded"
            img="/images/PencelIcon.svg"
            onClick={() => setSelectedTab("extra")}
          />
        </div>

        {/* Modal Title */}
        <div className="flex justify-center items-center w-full px-2">
          <Image
            src="/images/titles/ChooseModeTitle.svg"
            alt="Choose a Mode to Practice Your Word List"
            width={400}
            height={30}
            className="mx-auto w-full max-w-[90%] sm:max-w-md h-auto"
            priority
          />
        </div>

        {/* Mode Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10 mx-auto max-w-[1200px] justify-items-center w-full">
          {modesConfig.map((mode) => (
            <ModeCard
              key={mode.id}
              imageSrc={mode.imageSrc}
              altText={mode.altText}
              label={mode.label}
              isSelected={selectedMode === mode.id}
              onClick={() => setSelectedMode(mode.id)}
              progress={mode.progress}
              total={mode.total}
              completed={mode.completed}
              isRecentAttempts={mode.isRecentAttempts}
              recentAttempts={mode.recentAttempts}
              isMistakesPractice={mode.isMistakesPractice}
              isLoading={isLoadingQuizData && (mode.isRecentAttempts || mode.isMistakesPractice)}
            />
          ))}
        </div>
        {/* Button Container - Fixed height and consistent layout */}
        <div className="min-h-[100px] sm:min-h-[80px] mb-4 sm:mb-6 w-full">
          {/* Center container for buttons */}
          <div className="flex justify-center w-full">
            {/* Fixed-width container to maintain consistent layout */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 sm:gap-4 w-full max-w-[700px] px-2 sm:px-4">
              {selectedMode === "RecentAttempts" ? (
                <div className="w-full flex justify-center px-2">
                  <div className="text-center text-gray-500">
                    <div className="text-xs sm:text-sm">Select a quiz option to continue</div>
                  </div>
                </div>
              ) : selectedMode === "MistakesPractice" && !isLoadingQuizData && mistakesCount === 0 ? (
                <div className="w-full flex justify-center px-2">
                  <div className="text-center text-gray-500">
                    <div className="text-xs sm:text-sm">No mistakes to practice. Take a quiz first!</div>
                  </div>
                </div>
              ) : selectedTab === "extra" ? (
                <div className="w-full flex justify-center">
                  <CustomButton
                    label={
                      selectedMode === "FlashCards" && isGeneratingFlashCards ? "Generating..." :
                      selectedMode === "ScrambleWords" && isGeneratingScrambleWords ? "Generating..." :
                      selectedMode === "FlashCards" ? "Flash Cards" :
                      selectedMode === "ScrambleWords" ? "Scramble Words" :
                      selectedMode === "WordMatch" ? "Word Builder" :
                      "Play Game"
                    }
                    size="small"
                    variant="primary"
                    radius="rounded"
                    onClick={() => {
                      if (selectedMode === "FlashCards") {
                        handleFlashCardsNavigation();
                      } else if (selectedMode === "ScrambleWords") {
                        handleScrambleWordsNavigation();
                      } else if (selectedMode === "WordMatch") {
                        navigateTo("WordBuilder?start=0");
                      } else if (selectedMode) {
                        navigateTo(selectedMode + "?start=0");
                      }
                    }}
                    disabled={!selectedMode || (isGeneratingFlashCards && selectedMode === "FlashCards") || (isGeneratingScrambleWords && selectedMode === "ScrambleWords")}
                    className="w-full sm:w-auto sm:min-w-[240px] !h-auto flex items-center justify-center"
                  />
                </div>
              ) : currentModeData?.showContinue ? (
                // When two buttons are shown, display them side by side with equal width
                <>
                  <CustomButton
                    label={isPending ? "Loading..." : "Continue Learning"}
                    size="small"
                    variant="success"
                    radius="rounded"
                    onClick={() => navigateTo(selectedMode + `?start=${currentModeData.continueFrom}`)}
                    img="/images/bookIcon.svg"
                    disabled={!selectedMode || isPending}
                    className="w-full sm:w-auto sm:min-w-[200px] !h-auto flex items-center justify-center"
                  />
                  
                  <CustomButton
                    label={isPending ? "Loading..." : "Begin Again"}
                    size="small"
                    variant="primary"
                    radius="rounded"
                    onClick={() =>
                      selectedMode && navigateTo(selectedMode + "?start=0")
                    }
                    img="/images/resetIcon.svg"
                    disabled={!selectedMode || isPending}
                    className="w-full sm:w-auto sm:min-w-[200px] !h-auto flex items-center justify-center"
                  />
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <CustomButton
                    label={isPending ? "Loading..." : (selectedMode === "MistakesPractice" ? "Practice Now" : "Start Learning")}
                    size="small"
                    variant="primary"
                    radius="rounded"
                    onClick={() =>
                      selectedMode && navigateTo(selectedMode + "?start=0")
                    }
                    disabled={!selectedMode || (selectedMode === "MistakesPractice" && (isLoadingQuizData || mistakesCount === 0)) || isPending}
                    className="w-full sm:w-auto sm:min-w-[240px] !h-auto flex items-center justify-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PracticeWordModal;
