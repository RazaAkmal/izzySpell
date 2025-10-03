import React from 'react';

interface SyllableBuilderFeaturesProps {
  mode: 'picture' | 'phonics' | 'syllable' | 'morphology';
  currentWordIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  timeRemaining: number | null;
  challengeMode?: 'normal' | 'timed' | 'limited' | 'hard';
  movesRemaining?: number | null;
  personalBest?: number | null;
  wordFamilyUnlocked?: boolean;
}

export default function SyllableBuilderFeatures({
  mode,
  currentWordIndex,
  totalQuestions,
  score,
  streak,
  timeRemaining,
  challengeMode,
  movesRemaining,
  personalBest,
  wordFamilyUnlocked,
}: SyllableBuilderFeaturesProps) {
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = (seconds: number, isLight: boolean = false) => {
    if (isLight) {
      // Gentle colors for syllable mode light timer
      if (seconds > 60) return 'text-green';
      if (seconds > 30) return 'text-orange';
      return 'text-darkOrange';
    }
    
    // More urgent colors for timed challenges
    if (seconds > 30) return 'text-green';
    if (seconds > 10) return 'text-orange';
    return 'text-darkOrange';
  };

  return (
    <div className="px-4 md:px-6 mb-6">
      {/* Progress and Stats Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-lightBlue">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Progress Counter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-darkBlue">Progress:</span>
            <div className="bg-gradient-to-r from-blue to-purple text-white px-3 py-1 rounded-full text-sm font-bold">
              {currentWordIndex + 1} / {totalQuestions}
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-darkBlue">Score:</span>
            <div className="bg-gradient-to-r from-green to-lightGreen text-white px-3 py-1 rounded-full text-sm font-bold">
              {score} pts
            </div>
          </div>

          {/* Syllable Mode Streak Bonus */}
          {mode === 'syllable' && streak > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-darkBlue">Streak:</span>
              <div className="bg-gradient-to-r from-orange to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                🔥 {streak}
                {streak >= 2 && (
                  <span className="text-xs">
                    (+{Math.floor(streak / 2)} bonus)
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Morphology Mode Word Family Counter */}
          {mode === 'morphology' && wordFamilyUnlocked && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-darkBlue">Families:</span>
              <div className="bg-gradient-to-r from-purple to-pink text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                🧬 {currentWordIndex + 1}
              </div>
            </div>
          )}
          
          {/* Personal Best Display */}
          {challengeMode === 'timed' && personalBest !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-darkBlue">Best:</span>
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                🏅 {personalBest ? formatTime(personalBest) : '0:00'}
              </div>
            </div>
          )}

          {/* Timer Display */}
          {timeRemaining !== null && timeRemaining > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-darkBlue">Time:</span>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                challengeMode === 'timed' 
                  ? getTimerColor(timeRemaining, false)
                  : getTimerColor(timeRemaining, true)
              }`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            </div>
          )}

          {/* Moves Remaining (Limited Mode) */}
          {movesRemaining !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-darkBlue">Moves:</span>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                (movesRemaining ?? 0) <= 3 ? 'text-darkOrange' : 'text-blue'
              }`}>
                🎯 {movesRemaining}
              </div>
            </div>
          )}
        </div>

        {/* Syllable Mode Encouragement */}
        {mode === 'syllable' && timeRemaining !== null && timeRemaining < 30 && (
          <div className="mt-3 bg-lightBlue border border-blueStroke rounded-lg p-3">
            <p className="text-sm text-darkBlue text-center">
              💡 Take your time! Breaking words into syllables helps with spelling.
            </p>
          </div>
        )}

        {/* Streak Achievement Messages */}
        {mode === 'syllable' && streak > 0 && streak % 3 === 0 && (
          <div className="mt-3 bg-lightBlue border border-orange rounded-lg p-3">
            <p className="text-sm text-orange text-center font-medium">
              🏆 Amazing streak! You&apos;re mastering syllable patterns!
            </p>
          </div>
        )}
        
        {/* Morphology Mode Word Family Unlock Messages */}
        {mode === 'morphology' && wordFamilyUnlocked && (
          <div className="mt-3 bg-lightBlue border border-purple rounded-lg p-3">
            <p className="text-sm text-purple text-center font-medium">
              🧬 Word family unlocked! You&apos;re building vocabulary power!
            </p>
          </div>
        )}
        
        {/* Hard Mode Encouragement */}
        {challengeMode === 'hard' && (
          <div className="mt-3 bg-lightBlue border border-darkOrange rounded-lg p-3">
            <p className="text-sm text-darkOrange text-center font-medium">
              🔥 Hard Mode Active - You&apos;re a spelling warrior!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}