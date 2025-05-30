"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import CustomButton from "./HeadlessButton";

// Reusable ModeCard Component
type ModeType =
  | "DefualtModePratice"
  | "SyllabusModePractice"
  | "GroupModePractice";

type ModeCardType = {
  imageSrc: string;
  altText: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  progress?: number;
  total?: number;
  completed?: number;
};

const ModeCard = ({
  imageSrc,
  altText,
  label,
  isSelected,
  onClick,
  progress = 0,
  total = 0,
  completed = 0
}: ModeCardType) => (
  <div
    className={`bg-white flex flex-col items-center justify-end gap-2 p-3 sm:p-4 rounded-lg shadow-md w-full sm:max-w-[250px] lg:max-w-[220px] xl:max-w-xs h-auto pt-6 sm:pt-8 cursor-pointer transition-all duration-200 ${
      isSelected
        ? "border-2 border-green shadow-lg scale-105"
        : "border border-transparent hover:bg-lightBlue"
    }`}
    onClick={onClick}
  >
    <Image
      src={imageSrc}
      alt={altText}
      className="w-16 h-14 sm:w-20 sm:h-16 lg:w-[80px] xl:w-24 lg:h-[70px] xl:h-20"
      width={40}
      height={40}
      priority
    />
    <span className="text-base sm:text-lg font-bold text-blue mb-1">{label}</span>
    
    {/* Progress indicator */}
    {total > 0 && (
      <div className="w-full mt-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{completed}/{total} completed</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )}
  </div>
);

interface PracticeWordModalProps {
  totalWords: number;
  studiedCount: number;
  studiedSyllableCount: number;
  studiedGroupCount: number;
  totalStudiedGroups: number;
  totalGroups: number;
}

const PracticeWordModal: React.FC<PracticeWordModalProps> = ({
  totalWords,
  studiedCount,
  studiedSyllableCount,
  studiedGroupCount,
  totalGroups,
  totalStudiedGroups
}) => {
  const router = useRouter();
  const { listId } = useParams();
  const [selectedMode, setSelectedMode] = 
    React.useState<ModeType>("DefualtModePratice");
    
  // Create a mapping for mode-specific data to avoid repetitive conditionals
  const modesConfig = React.useMemo(() => [
    {
      id: "DefualtModePratice" as const,
      imageSrc: "/images/DefaultMode.svg",
      altText: "Default Mode",
      label: "Default Mode",
      completed: studiedCount,
      total: totalWords,
      progress: totalWords > 0 ? Math.round((studiedCount / totalWords) * 100) : 0,
      showContinue: studiedCount > 0,
      continueFrom: studiedCount
    },
    {
      id: "SyllabusModePractice" as const,
      imageSrc: "/images/SyllabusMode.svg",
      altText: "syllables Mode",
      label: "Syllables Mode",
      completed: studiedSyllableCount,
      total: totalWords,
      progress: totalWords > 0 ? Math.round((studiedSyllableCount / totalWords) * 100) : 0,
      showContinue: studiedSyllableCount > 0,
      continueFrom: studiedSyllableCount
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
      continueFrom: totalStudiedGroups
    }
  ], [totalWords, studiedCount, studiedSyllableCount, studiedGroupCount, totalGroups, totalStudiedGroups]);
  
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

  return (
    <>
      <div className="flex flex-col gap-6 sm:gap-8 justify-center px-2 sm:px-4">
        <div className="flex gap-1 sm:gap-2 justify-center">
          <CustomButton
            size="small"
            label="Study"
            variant={selectedMode ? "primary" : "secondary"}
            radius="rounded"
            img="/images/bookIcon.svg"
            disabled={!selectedMode}
          />
          <CustomButton
            size="small"
            label="Quiz"
            variant="secondary"
            radius="rounded"
            img="/images/QuizIcon.svg"
            disabled={true}
          />
          <CustomButton
            size="small"
            label="Extra"
            variant="secondary"
            radius="rounded"
            img="/images/PencelIcon.svg"
            disabled={true}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 justify-items-center gap-4 sm:gap-6 mb-8">
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
            />
          ))}
        </div>
        {/* Continue/Start Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 w-full px-4">
          {/* Show the Continue button conditionally based on the selected mode */}
          {currentModeData.showContinue && (
            <CustomButton
              label={
                <div className="flex items-center justify-center w-full sm:w-40 md:w-52 lg:w-48 xl:w-60">
                  <span className="text-sm sm:text-base whitespace-nowrap">{`Continue Learning (${currentModeData.completed}/${currentModeData.total})`}</span>
                </div>
              }
              size="small"
              variant="success"
              radius="rounded"
              onClick={() => navigateTo(selectedMode + `?start=${currentModeData.continueFrom}`)}
              img="/images/bookIcon.svg"
              disabled={!selectedMode}
              className="w-full sm:w-auto"
            />
          )}

          <CustomButton
            label={
              <div className="flex items-center justify-center w-full sm:w-40 md:w-52 lg:w-48 xl:w-60">
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
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </>
  );
};

export default PracticeWordModal;
