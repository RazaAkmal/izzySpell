"use client";

import React from "react";
import CustomButton from "./HeadlessButton";

interface GameCompletionContentProps {
  // Game info
  gameTitle: string;
  
  // Statistics
  totalQuestions: number;
  totalAttempts: number;
  
  // Actions
  onPlayAgain: () => void;
  onBackToExercises: () => void;
  
  // Customization
  motivationalMessage?: string;
  successEmoji?: string;
  customStats?: Array<{
    label: string;
    value: string | number;
  }>;
}

const GameCompletionContent: React.FC<GameCompletionContentProps> = ({
  gameTitle,
  totalQuestions,
  totalAttempts,
  onPlayAgain,
  onBackToExercises,
  motivationalMessage,
  successEmoji = "🎊",
  customStats = []
}) => {
  // Calculate default statistics
  const accuracy = totalAttempts > 0 ? Math.round((totalQuestions / totalAttempts) * 100) : 100;
  const avgAttempts = totalAttempts > 0 ? (totalAttempts / totalQuestions).toFixed(1) : '1.0';
  
  // Default statistics
  const defaultStats = [
    {
      label: "Words Completed",
      value: totalQuestions
    },
    {
      label: "Total Tries", 
      value: totalAttempts
    },
    {
      label: "Your Wins",
      value: `${accuracy}%`
    },
    {
      label: "Avg Attempts",
      value: avgAttempts
    }
  ];
  
  // Use custom stats if provided, otherwise use defaults
  const statsToShow = customStats.length > 0 ? customStats : defaultStats;
  
  return (
    <>
      {/* Success Content */}
      <div className="flex flex-col items-center justify-center px-4 md:px-6 pb-8">
        <div className="success-reveal bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-lightBlue max-w-4xl w-full">
          <div className="text-center">
            <div className="text-6xl mb-6">{successEmoji}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-purple mb-4">
              Fantastic Work!
            </h2>
            <p className="text-xl text-textColor mb-6">
              {motivationalMessage || `You completed the ${gameTitle.replace(/^\w+\s/, '')} challenge!`}
            </p>
            
            <div className="bg-gradient-to-r from-purple to-blue text-white rounded-2xl p-6 mb-8">
              <h3 className="text-2xl font-bold mb-4">Spelling Success</h3>
              
              <div className={`grid gap-4 text-center ${
                statsToShow.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 
                statsToShow.length === 3 ? 'grid-cols-3' :
                statsToShow.length === 2 ? 'grid-cols-2' :
                'grid-cols-1'
              }`}>
                {statsToShow.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">🎯 100% Completion!</div>
                  <div className="text-sm opacity-90">
                    You successfully completed all challenges!
                    {totalAttempts === totalQuestions 
                      ? " Perfect first-try performance!" 
                      : " Great persistence - you got there in the end!"
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CustomButton
                label="Play Again"
                variant="primary"
                size="large"
                onClick={onPlayAgain}
              />
              <CustomButton
                label="Back to Exercises"
                variant="secondary"
                size="large"
                onClick={onBackToExercises}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameCompletionContent;
