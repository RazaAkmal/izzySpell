"use client";

import React, {useEffect, useState} from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import CustomButton from "./HeadlessButton";
import { getRecentQuizAttempts } from "@/app/actions/getRecentQuizAttempts";
import ModeCard, { ModeType, QuizAttempt } from "./ModeCard";
import { checkFlashCardsExist } from "@/app/actions/prismaActions";
import { generateAndSaveFlashCards } from "@/app/actions/AiService";

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
  words: string[]; // Array of word strings for flash card generation
}

const PracticeWordModal: React.FC<PracticeWordModalProps> = ({
  totalWords,
  studiedCount,
  studiedSyllableCount,
  studiedGroupCount,
  totalGroups,
  totalStudiedGroups,
  words
}) => {
  const router = useRouter();
  const { listId } = useParams();
  const [selectedTab, setSelectedTab] = React.useState<"study" | "quiz" | "extra">("study");
  const [selectedMode, setSelectedMode] = React.useState<ModeType>("DefualtModePratice");
  const [recentAttempts, setRecentAttempts] = React.useState<QuizAttempt[]>([]);
  const [mistakesCount, setMistakesCount] = React.useState(0);
  const [isGeneratingFlashCards, setIsGeneratingFlashCards] = useState(false);
  
  // Fetch recent quiz attempts and mistakes count when quiz tab is selected
  useEffect(() => {
    if (selectedTab === "quiz" && listId) {
      getRecentQuizAttempts(parseInt(listId as string, 10))
        .then((data) => {
          setRecentAttempts(data.attempts);
          setMistakesCount(data.uniqueMistakesCount);
        })
        .catch((error: Error) => {
          console.error("Failed to fetch quiz data:", error);
          setRecentAttempts([]);
          setMistakesCount(0);
        });
    }
  }, [selectedTab, listId]);

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
          imageSrc: "/images/QuizIcon.svg",
          altText: "Word Match",
          label: "Word Match",
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
    router.push(`/spellPractice/${listId}/${path}`);
  };

  const handleFlashCardsNavigation = async () => {
    if (!listId || words.length === 0) {
      console.error("No list ID or words available");
      return;
    }

    setIsGeneratingFlashCards(true);
    
    try {
      const numericListId = parseInt(listId as string, 10);
      
      // Check if flash cards already exist
      const checkResult = await checkFlashCardsExist(numericListId);
      
      if (checkResult.success && checkResult.exists) {
        // Flash cards exist, navigate directly
        navigateTo("FlashCards?start=0");
      } else {
        // Generate flash cards first
        const generateResult = await generateAndSaveFlashCards(numericListId, words);
        
        if (generateResult.success) {
          // Generation successful, navigate to game
          navigateTo("FlashCards?start=0");
        } else {
          console.error("Failed to generate flash cards:", generateResult.error);
          // You could show an error modal here
          alert("Failed to generate flash cards. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error in flash cards navigation:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsGeneratingFlashCards(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:gap-8 justify-center px-2 sm:px-4">
        <div className="flex gap-1 sm:gap-2 justify-center">
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
        <div className="flex justify-center items-center w-full">
          <Image
            src="/images/titles/ChooseModeTitle.svg"
            alt="Choose a Mode to Practice Your Word List"
            width={400}
            height={30}
            className="mx-auto w-full max-w-md"
            priority
          />
        </div>

        {/* Mode Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-10 mx-auto max-w-[1200px] justify-items-center">
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
            />
          ))}
        </div>
        {/* Button Container - Fixed height and consistent layout */}
        <div className="h-[120px] sm:h-[80px] mb-6 w-full">
          {/* Center container for buttons */}
          <div className="flex justify-center w-full">
            {/* Fixed-width container to maintain consistent layout */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-[700px] px-4">
              {selectedMode === "RecentAttempts" ? (
                <div className="w-full flex justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-sm">Select a quiz option to continue</div>
                  </div>
                </div>
              ) : selectedMode === "MistakesPractice" && mistakesCount === 0 ? (
                <div className="w-full flex justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-sm">No mistakes to practice. Take a quiz first!</div>
                  </div>
                </div>
              ) : selectedTab === "extra" ? (
                <div className="w-full flex justify-center">
                  <CustomButton
                    label={
                      <div className="flex items-center justify-center w-full">
                        <span>{isGeneratingFlashCards && selectedMode === "FlashCards" ? "Generating..." : "Play Game"}</span>
                      </div>
                    }
                    size="small"
                    variant="primary"
                    radius="rounded"
                    onClick={() => {
                      if (selectedMode === "FlashCards") {
                        handleFlashCardsNavigation();
                      } else if (selectedMode) {
                        navigateTo(selectedMode + "?start=0");
                      }
                    }}
                    disabled={!selectedMode || (isGeneratingFlashCards && selectedMode === "FlashCards")}
                    className="w-full sm:w-60"
                  />
                </div>
              ) : currentModeData?.showContinue ? (
                // When two buttons are shown, display them side by side with equal width
                <>
                  <CustomButton
                    label={
                      <div className="flex items-center justify-center w-full">
                        <span className="text-sm sm:text-base whitespace-nowrap">{`Continue Learning (${currentModeData.completed}/${currentModeData.total})`}</span>
                      </div>
                    }
                    size="small"
                    variant="success"
                    radius="rounded"
                    onClick={() => navigateTo(selectedMode + `?start=${currentModeData.continueFrom}`)}
                    img="/images/bookIcon.svg"
                    disabled={!selectedMode}
                    className="w-full sm:w-60"
                  />
                  
                  <CustomButton
                    label={
                      <div className="flex items-center justify-center w-full">
                        <span>Begin Again</span>
                      </div>
                    }
                    size="small"
                    variant="primary"
                    radius="rounded"
                    onClick={() =>
                      selectedMode && navigateTo(selectedMode + "?start=0")
                    }
                    img="/images/resetIcon.svg"
                    disabled={!selectedMode}
                    className="w-full sm:w-60"
                  />
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <CustomButton
                    label={
                      <div className="flex items-center justify-center w-full">
                        <span>{selectedMode === "MistakesPractice" ? "Practice Now" : "Start learning"}</span>
                      </div>
                    }
                    size="small"
                    variant="primary"
                    radius="rounded"
                    onClick={() =>
                      selectedMode && navigateTo(selectedMode + "?start=0")
                    }
                    disabled={!selectedMode || (selectedMode === "MistakesPractice" && mistakesCount === 0)}
                    className="w-full sm:w-60"
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
