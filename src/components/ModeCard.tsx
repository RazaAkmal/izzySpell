"use client";

import React from "react";
import Image from "next/image";

export type ModeType =
  | "DefualtModePratice"
  | "SyllablesModePractice"
  | "GroupModePractice"
  | "QuizMode"
  | "RecentAttempts"
  | "MistakesPractice"
  | "ScrambleWords"
  | "FlashCards"
  | "WordMatch";

export type QuizAttempt = {
  id: number;
  grade: number; // Converted from Decimal type for serialization
  createdAt: Date;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
};

export type ModeCardProps = {
  imageSrc?: string;
  altText?: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  progress?: number;
  total?: number;
  completed?: number;
  isRecentAttempts?: boolean;
  recentAttempts?: QuizAttempt[];
  isMistakesPractice?: boolean;
  isLoading?: boolean;
};

const ModeCard: React.FC<ModeCardProps> = ({
  imageSrc,
  altText,
  label,
  isSelected,
  onClick,
  progress = 0,
  total = 0,
  completed = 0,
  isRecentAttempts = false,
  recentAttempts = [],
  isMistakesPractice = false,
  isLoading = false,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isRecentAttempts) {
    return (
      <div
        className={`bg-white flex flex-col gap-3 p-4 sm:p-6 rounded-lg shadow-md w-full sm:max-w-[320px] lg:max-w-[350px] xl:max-w-[380px] min-h-[250px] sm:min-h-[280px] cursor-pointer transition-all duration-200 ${
          isSelected
            ? "border-2 border-green shadow-lg scale-105"
            : "border border-transparent hover:bg-lightBlue"
        }`}
        onClick={onClick}
      >
        <span className="text-lg sm:text-xl font-bold text-blue mb-2 text-center pt-4 sm:pt-6">
          {label}
        </span>

        {isLoading ? (
          <div className="flex flex-col gap-2 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-10 animate-pulse" />
            ))}
          </div>
        ) : recentAttempts.length > 0 ? (
          <div className="flex flex-col gap-2 flex-1">
            <div className="text-center text-sm text-gray-600 mb-2">
              {recentAttempts.length} Recent Attempt
              {recentAttempts.length > 1 ? "s" : ""}
            </div>
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Date</span>
                  <span className="text-xs text-gray-500">Grade</span>
                  <span className="text-xs text-gray-500">Stats</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-darkBlue">
                    {formatDate(new Date(attempt.createdAt))}
                  </div>
                  <div className="text-xs text-darkBlue">
                    {attempt.grade.toFixed(0)}%
                  </div>
                  <div className="text-xs text-darkBlue">
                    {attempt.correctAnswers}/{attempt.totalQuestions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm">No quiz attempts yet</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white flex flex-col gap-4 p-4 sm:p-6 rounded-lg shadow-md w-full sm:max-w-[320px] lg:max-w-[350px] xl:max-w-[380px] min-h-[250px] sm:min-h-[280px] cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-2 border-green shadow-lg scale-105"
          : "border border-transparent hover:bg-lightBlue"
      }`}
      onClick={onClick}
    >
      {/* Main content area - always takes the same space */}
      <div className="flex flex-col items-center justify-center flex-1 gap-3 min-h-[160px]">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={altText || ""}
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
            width={80}
            height={80}
            priority
          />
        )}
        <span className="text-lg sm:text-xl font-bold text-blue text-center">
          {label}
        </span>
      </div>

      {/* Bottom section - consistent height whether content exists or not */}
      <div className="h-[40px] flex items-center justify-center">
        {/* For mistake practice, show count badge */}
        {isMistakesPractice && isLoading ? (
          <div className="h-7 w-40 bg-gray-200 rounded-full animate-pulse" />
        ) : isMistakesPractice && total > 0 ? (
          <div className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
            {total} {total === 1 ? 'mistake' : 'mistakes'} to practice
          </div>
        ) : total > 0 && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {completed}/{total} completed
              </span>
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
    </div>
  );
};

export default ModeCard;
