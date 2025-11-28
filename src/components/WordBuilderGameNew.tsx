"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@headlessui/react';
import JSConfetti from 'js-confetti';

// Import our custom components
import DragDropProvider from './WordBuilder/DragDropProvider';
import LetterTile from './WordBuilder/LetterTile';
import DropSlot from './WordBuilder/DropSlot';
import HintSystem from './WordBuilder/HintSystem';
import SyllableBuilderFeatures from './WordBuilder/SyllableBuilderFeatures';
import CustomButton from './HeadlessButton';
import TextToSpeech from './TextToSpeach';
import ConfirmationModal from './ConfirmationModal';
import GameCompletionContent from './GameCompletionContent';
import ChallengeModeModal from './ChallengeModeModal';

// Import data and types
import { getWordsByAgeGroup, WordBuilderWord } from '../data/wordBuilderData';
import { useListName } from '@/context/ListNameContext';

interface WordBuilderGameProps {
  listId: string;
  ageGroup: '4-6' | '6-8' | '9-11' | '11-13+';
  mode: 'picture' | 'phonics' | 'syllable' | 'morphology';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameTile {
  id: string;
  letter: string;
  isUsed: boolean;
}

interface WordSlot {
  index: number;
  letter: string | null;
  isCorrect: boolean | null;
}

export default function WordBuilderGameNew({ 
  listId, 
  ageGroup, 
  mode, 
  difficulty
}: WordBuilderGameProps) {
  const { listName } = useListName();
  const router = useRouter();
  const confettiRef = useRef<JSConfetti | null>(null);

  // Game state
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'completed'>('loading');
  const [words, setWords] = useState<WordBuilderWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gameTiles, setGameTiles] = useState<GameTile[]>([]);
  const [wordSlots, setWordSlots] = useState<WordSlot[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  
  // Syllable Builder specific features
  const [streak, setStreak] = useState(0);
  const [hintPenalty, setHintPenalty] = useState(0);
  
  // Morphology Builder specific features
  const [wordFamilyUnlocked, setWordFamilyUnlocked] = useState(false);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  
  // Challenge mode states
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [movesRemaining, setMovesRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Challenge mode states
  const [challengeMode, setChallengeMode] = useState<'normal' | 'timed' | 'limited' | 'hard' | null>(null);
  const [showChallengeModeModal, setShowChallengeModeModal] = useState(true);
  
  // Limited moves tracking
  const [totalMovesUsed, setTotalMovesUsed] = useState(0);
  const [totalMovesAvailable, setTotalMovesAvailable] = useState(0);
  const [wordsCompletedWithinMoveLimit, setWordsCompletedWithinMoveLimit] = useState(0);
  
  // UI states
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isConfirmLoading] = useState(false);
  const [isTimeOut, setIsTimeOut] = useState(false);
  const [isMovesExhausted, setIsMovesExhausted] = useState(false);

  const currentWord = words[currentWordIndex];
  const totalQuestions = words.length;

  // Initialize confetti and load personal best
  useEffect(() => {
    confettiRef.current = new JSConfetti();
    
    // Load personal best from localStorage
    const savedBest = localStorage.getItem(`wordBuilder_${mode}_best`);
    if (savedBest) {
      setPersonalBest(parseInt(savedBest));
    }
  }, [mode]);

  // Load words based on criteria
  useEffect(() => {
    if (!ageGroup || !mode || !difficulty) return;
    const selectedWords = getWordsByAgeGroup(ageGroup);
    setWords(selectedWords);
    setGameState('playing');
  }, [ageGroup, mode, difficulty]);

  // Initialize current word
  useEffect(() => {
    if (!currentWord) return;

    // Reset states for new word
    setHintsUsed([]);
    setShowFeedback(false);
    setHintPenalty(0);
    setIsTimeOut(false);
    setIsMovesExhausted(false);

    // Create letter tiles based on mode
    const wordLetters = currentWord.word.split('');
    let tilesToCreate: string[] = [];
    
    if (mode === 'syllable' && currentWord.syllables) {
      tilesToCreate = currentWord.syllables;
    } else if (mode === 'phonics' && currentWord.phonemes) {
      tilesToCreate = currentWord.phonemes;
    } else {
      tilesToCreate = wordLetters;
    }

    // Add decoy tiles for hard mode
    if (challengeMode === 'hard' && currentWord.decoyTiles) {
      tilesToCreate = [...tilesToCreate, ...currentWord.decoyTiles];
    }

    // Shuffle tiles
    const shuffledTiles = [...tilesToCreate].sort(() => 0.5 - Math.random());
    const tiles: GameTile[] = shuffledTiles.map((letter, index) => ({
      id: `tile-${index}`,
      letter: letter.toUpperCase(),
      isUsed: false,
    }));
    setGameTiles(tiles);

    // Create word slots to match tiles
    let slotsToCreate: string[] = [];
    if (mode === 'syllable' && currentWord.syllables) {
      slotsToCreate = currentWord.syllables;
    } else if (mode === 'phonics' && currentWord.phonemes) {
      slotsToCreate = currentWord.phonemes;
    } else {
      slotsToCreate = wordLetters;
    }

    const slots: WordSlot[] = slotsToCreate.map((_, index) => ({
      index,
      letter: null,
      isCorrect: null,
    }));
    setWordSlots(slots);

    // Set up timers
    if (challengeMode === 'timed' && currentWord.timeLimit) {
      setTimeRemaining(currentWord.timeLimit);
      setIsTimerRunning(true);
    } else if (mode === 'syllable' && currentWord.timeLimit) {
      // Light timer for syllable mode
      setTimeRemaining(currentWord.timeLimit + 30);
      setIsTimerRunning(true);
    }

    if (challengeMode === 'limited' && currentWord.maxMoves) {
      setMovesRemaining(currentWord.maxMoves);
      setTotalMovesAvailable(prev => prev + currentWord.maxMoves!); // Track total moves available
    }

  }, [currentWord, mode, challengeMode]);

  // Handle timeout for timed challenges
  const handleTimeOut = useCallback(() => {
    setIsTimerRunning(false);
    
    // Only show timeout feedback for timed challenges
    if (challengeMode === 'timed') {
      setIsTimeOut(true);
      setShowFeedback(true);
      
      // Get correct sequence to compare against
      let correctSequence: string[] = [];
      if (mode === 'syllable' && currentWord.syllables) {
        correctSequence = currentWord.syllables.map(s => s.toUpperCase());
      } else if (mode === 'phonics' && currentWord.phonemes) {
        correctSequence = currentWord.phonemes.map(p => p.toUpperCase());
      } else {
        correctSequence = currentWord.word.split('').map(l => l.toUpperCase());
      }
      
      // Smart timeout feedback: only mark as incorrect if letter is wrong or missing
      const timeoutSlots = wordSlots.map((slot, index) => ({
        ...slot,
        isCorrect: slot.letter !== null 
          ? slot.letter.toUpperCase() === correctSequence[index] 
          : false // Empty slots are marked as incorrect
      }));
      setWordSlots(timeoutSlots);
      
      setStreak(0); // Reset streak on timeout
      setTotalAttempts(prev => prev + 1); // Count as an attempt
    }
    // For syllable mode, just hide the timer but let user continue
  }, [challengeMode, wordSlots, mode, currentWord]);

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleTimeOut();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev! - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, isTimerRunning, handleTimeOut]);

  // Handle next word
  const handleNextWord = useCallback(() => {
    if (currentWordIndex >= words.length - 1) {
      setGameState('completed');
    } else {
      setCurrentWordIndex(prev => prev + 1);
      setGameState('playing');
    }
  }, [currentWordIndex, words.length]);

  // Handle dropping a letter into a slot
  const handleDrop = (letter: string, slotIndex: number) => {
    if (gameState !== 'playing' || isTimeOut || isMovesExhausted) return;

    // First, place the letter in the slot
    const newSlots = [...wordSlots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      letter: letter,
      isCorrect: null, // Don't show feedback until completion
    };
    setWordSlots(newSlots);

    // Then handle move counting for limited mode
    if (challengeMode === 'limited' && movesRemaining !== null) {
      const newMovesRemaining = movesRemaining - 1;
      setMovesRemaining(newMovesRemaining);
      setTotalMovesUsed(prev => prev + 1); // Track total moves used
      if (newMovesRemaining <= 0) {
        setIsMovesExhausted(true);
        // Don't immediately end the game - let player try to check word with the letter they just placed
        return;
      }
    }

    // Only check word completion if all slots are filled AND not in limited moves mode
    if (challengeMode !== 'limited' && newSlots.every(slot => slot.letter !== null)) {
      checkWordCompletion(newSlots);
    }
  };

  // Mark a tile as used
  const handleTileUsed = (tileId: string) => {
    setGameTiles(prev => prev.map(tile => 
      tile.id === tileId ? { ...tile, isUsed: true } : tile
    ));
  };

  // Handle removing a letter from a slot (for limited moves mode)
  const handleRemoveLetter = (slotIndex: number) => {
    if (challengeMode !== 'limited' || isMovesExhausted || gameState !== 'playing') return;
    
    const slot = wordSlots[slotIndex];
    if (!slot.letter) return; // Nothing to remove
    
    // Letter removal is FREE - doesn't consume moves
    // This allows players to correct mistakes without penalty
    
    // Find the tile that was in this slot and mark it as unused
    setGameTiles(prev => prev.map(tile => 
      tile.letter === slot.letter ? { ...tile, isUsed: false } : tile
    ));
    
    // Clear the slot
    const newSlots = [...wordSlots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      letter: null,
      isCorrect: null
    };
    setWordSlots(newSlots);
  };

  // Manual word check for limited moves mode
  const handleCheckWord = () => {
    if (challengeMode === 'limited') {
      checkWordCompletion(wordSlots);
    }
  };

  // Auto-fail after timeout when moves are exhausted
  useEffect(() => {
    if (isMovesExhausted && challengeMode === 'limited' && !showFeedback) {
      const timer = setTimeout(() => {
        // If player hasn't checked word within 10 seconds, auto-fail
        setShowFeedback(true);
        setTotalAttempts(prev => prev + 1);
        setStreak(0);
        setTimeout(handleNextWord, 2000);
      }, 10000); // 10 second grace period
      
      return () => clearTimeout(timer);
    }
  }, [isMovesExhausted, challengeMode, showFeedback, handleNextWord]);

  // Check if the completed word is correct
  const checkWordCompletion = (slots: WordSlot[]) => {
    // Increment attempts when a word is completed (right or wrong)
    setTotalAttempts(prev => prev + 1);
    
    const playerSequence = slots.map(slot => slot.letter);
    
    let correctSequence: string[] = [];
    if (mode === 'syllable' && currentWord.syllables) {
      correctSequence = currentWord.syllables.map(s => s.toUpperCase());
    } else if (mode === 'phonics' && currentWord.phonemes) {
      correctSequence = currentWord.phonemes.map(p => p.toUpperCase());
    } else {
      correctSequence = currentWord.word.split('').map(l => l.toUpperCase());
    }
    
    const isCorrect = playerSequence.length === correctSequence.length &&
      playerSequence.every((letter, index) => letter === correctSequence[index]);
    
    if (isCorrect) {
      handleCorrectWord(slots);
    } else {
      handleIncorrectWord(slots, correctSequence);
    }
  };

  // Handle correct word
  const handleCorrectWord = (slots: WordSlot[]) => {
    const updatedSlots = slots.map(slot => ({ ...slot, isCorrect: true }));
    setWordSlots(updatedSlots);
    setShowFeedback(true);
    
    // Clear moves exhausted state if word was completed successfully
    if (isMovesExhausted) {
      setIsMovesExhausted(false);
    }
    
    // Track successful completion for limited moves mode
    if (challengeMode === 'limited') {
      setWordsCompletedWithinMoveLimit(prev => prev + 1);
    }

    // Update streak for syllable mode
    setStreak(prev => prev + 1);

    // Calculate score with streak bonus and penalty
    const baseScore = 1;
    let streakBonus = 0;
    if (mode === 'syllable' && streak >= 2) {
      streakBonus = Math.floor(streak / 2);
    }
    const finalScore = Math.max(0, baseScore + streakBonus - hintPenalty);
    setScore(prev => prev + finalScore);

    // Morphology Builder: Unlock word family mini-quest
    if (mode === 'morphology' && currentWord.morphology) {
      setWordFamilyUnlocked(true);
      
      // Special confetti for morphology success
      if (confettiRef.current) {
        confettiRef.current.addConfetti({
          emojis: ['🧬', '🔬', '📚', '💡', '🎯'],
          emojiSize: 60,
          confettiNumber: 150,
        });
      }
    } else {
      // Regular confetti for other modes
      if (confettiRef.current) {
        confettiRef.current.addConfetti({
          emojis: ['🎉', '⭐', '🌟', '✨'],
          emojiSize: 50,
          confettiNumber: 100,
        });
      }
    }
  };

  // Handle incorrect word
  const handleIncorrectWord = (slots: WordSlot[], correctSequence: string[]) => {
    const updatedSlots = slots.map((slot, index) => ({
      ...slot,
      isCorrect: slot.letter === correctSequence[index],
    }));
    
    setWordSlots(updatedSlots);
    setShowFeedback(true);
    setStreak(0); // Reset streak on incorrect answer
    
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Reset current word state
  const resetCurrentWord = () => {
    setShowFeedback(false);
    setIsTimeOut(false);
    setIsMovesExhausted(false);
    setGameTiles(prev => prev.map(tile => ({ ...tile, isUsed: false })));
    setWordSlots(prev => prev.map(slot => ({ ...slot, letter: null, isCorrect: null })));
    
    // Restart timer if it was running
    if (challengeMode === 'timed' && currentWord.timeLimit) {
      setTimeRemaining(currentWord.timeLimit);
      setIsTimerRunning(true);
    } else if (mode === 'syllable' && currentWord.timeLimit) {
      // Restart gentle timer for syllable mode
      setTimeRemaining(currentWord.timeLimit + 30);
      setIsTimerRunning(true);
    }
    
    // Reset moves for limited mode
    if (challengeMode === 'limited' && currentWord.maxMoves) {
      setMovesRemaining(currentWord.maxMoves);
    }
  };

  // Handle hint usage
  const handleHintUsed = (hintType: string) => {
    if (!hintsUsed.includes(hintType)) {
      setHintsUsed(prev => [...prev, hintType]);
      
      // Add penalty for peek syllable hint
      if (mode === 'syllable' && hintType === 'peekSyllable') {
        setHintPenalty(prev => prev + 0.5);
      }
    }
  };

  // Handle challenge mode selection
  const handleChallengeModeSelect = (selectedMode: 'normal' | 'timed' | 'limited' | 'hard') => {
    setChallengeMode(selectedMode);
    setShowChallengeModeModal(false);
  };

  // Handle modal close (redirect to spell practice)
  const handleModalClose = () => {
    router.push(`/spellPractice/${listId}`);
  };

  // Handle game exit
  const handleClose = () => setShowExitModal(true);
  const handleExit = () => router.push(`/spellPractice/${listId}`);
  const handleRestartGame = () => {
    // Save personal best for timed challenges
    if (challengeMode === 'timed' && timeRemaining !== null) {
      const currentTime = timeRemaining;
      if (personalBest === null || currentTime > personalBest) {
        setPersonalBest(currentTime);
        // Store in localStorage for persistence
        localStorage.setItem(`wordBuilder_${mode}_best`, currentTime.toString());
      }
    }
    
    setCurrentWordIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setStreak(0);
    setHintPenalty(0);
    setWordFamilyUnlocked(false);
    setTotalMovesUsed(0);
    setTotalMovesAvailable(0);
    setWordsCompletedWithinMoveLimit(0);
    setGameState('playing');  
  };

  // Loading state or challenge mode selection
  if (gameState === 'loading' || challengeMode === null) {
    return (
      <>
        <div className="min-h-[75vh] bg-gradient-to-br from-lightBlue via-skyBlue to-lightGreen rounded-md mx-4 md:mx-8 lg:mx-7 flex items-center justify-center">
          <div className="text-center">
            {gameState === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
                <p className="text-lg text-purple">Loading Word Builder...</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🧩</div>
                <p className="text-lg text-purple">Select your challenge mode to begin!</p>
              </>
            )}
          </div>
        </div>
        
        <ChallengeModeModal
          isOpen={showChallengeModeModal}
          onClose={handleModalClose}
          onSelectMode={handleChallengeModeSelect}
        />
      </>
    );
  }

  if (!currentWord && gameState !== 'completed') {
    return (
      <div className="min-h-[75vh] mb-10 pb-10 bg-gradient-to-br from-lightBlue via-skyBlue to-lightGreen rounded-md mx-4 md:mx-8 lg:mx-7 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-purple">No words available for this mode.</p>
          <CustomButton
            label="Go Back"
            variant="primary"
            size="small"
            onClick={handleExit}
            className="mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <DragDropProvider>
      <div className="min-h-[75vh] mb-10 pb-10 bg-gradient-to-br from-lightBlue via-skyBlue to-lightGreen rounded-md mx-4 md:mx-8 lg:mx-7 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 sm:gap-0 items-center p-6">
          <div className="order-2 sm:order-1 flex justify-start">
            <CustomButton
              label={`List name ${listName}`}
              variant="success"
              size="small"
              img="/images/bookIcon.svg"
            />
          </div>
          <div className="order-3 sm:order-2 flex justify-center">
            <p className="text-2xl md:text-4xl md:ml-8 font-bold text-center w-full text-purple">
              {gameState === 'completed' 
                ? '🧩 Word Builder Complete!' 
                : "🧩 Word Builder Challenge"
              }
            </p>
          </div>
          <div className="order-1 sm:order-3 flex justify-end">
            <Button 
              className="focus:outline-none" 
              disabled={isConfirmLoading}
            >
              <Image
                src="/images/Vector.svg"
                alt="Cancel Button"
                width={30}
                height={30}
                onClick={handleClose}
              />
            </Button>
          </div>
        </div>

        {/* Game Content */}
        {gameState === 'completed' ? (
          <GameCompletionContent
            gameTitle="Word Builder Challenge"
            totalQuestions={totalQuestions}
            totalAttempts={totalAttempts}
            onPlayAgain={handleRestartGame}
            onBackToExercises={handleExit}
            motivationalMessage={
              challengeMode === 'limited' 
                ? "You completed the Limited Moves challenge! Strategic thinking at its finest!" 
                : "You completed the Word Builder challenge!"
            }
            successEmoji={challengeMode === 'limited' ? '🎯' : '🧩'}
            customStats={
              challengeMode === 'limited' ? [
                {
                  label: "Words Completed",
                  value: totalQuestions
                },
                {
                  label: "Total Moves Used",
                  value: totalMovesUsed
                },
                {
                  label: "Move Efficiency",
                  value: totalMovesAvailable > 0 ? `${Math.round(((totalMovesAvailable - totalMovesUsed) / totalMovesAvailable) * 100)}%` : '100%'
                },
                {
                  label: "Strategic Success",
                  value: `${wordsCompletedWithinMoveLimit}/${totalQuestions}`
                }
              ] : undefined
            }
          />
        ) : (
          <>
            {/* Game Progress with Syllable Builder Features */}
            <SyllableBuilderFeatures
              mode={mode}
              currentWordIndex={currentWordIndex}
              totalQuestions={totalQuestions}
              score={score}
              streak={streak}
              timeRemaining={timeRemaining}
              challengeMode={challengeMode || 'normal'}
              movesRemaining={movesRemaining}
              personalBest={personalBest}
              wordFamilyUnlocked={wordFamilyUnlocked}
            />

            {/* Progress Bar */}
            <div className="mx-20 mb-6">
              <div className="bg-white/60 rounded-full h-3 overflow-hidden border border-lightBlue">
                <div 
                  className="bg-gradient-to-r from-green to-blue h-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentWordIndex / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Game Area */}
            <div className="flex flex-col lg:flex-row items-start justify-center px-4 md:px-6 pb-8 gap-6 max-w-7xl mx-auto">
              
              {/* Left Column - Game Elements */}
              <div className="flex flex-col space-y-6 lg:w-2/3">
                {/* Word Slots */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-lightBlue">
                  <h3 className="text-lg font-bold text-center text-darkBlue mb-4">Drop letters here:</h3>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {wordSlots.map((slot) => (
                      <DropSlot
                        key={slot.index}
                        index={slot.index}
                        letter={slot.letter}
                        isCorrect={slot.isCorrect}
                        onDrop={handleDrop}
                        onRemove={handleRemoveLetter}
                        showFeedback={showFeedback}
                        showRemoveButton={challengeMode === 'limited'}
                        className="relative"
                      />
                    ))}
                  </div>
                </div>

                {/* Check Word Button for Limited Moves Mode */}
                {challengeMode === 'limited' && !showFeedback && (
                  <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 text-center ${
                    isMovesExhausted ? 'border-darkOrange' : 'border-lightBlue'
                  }`}>
                    <CustomButton
                      label={isMovesExhausted ? "Final Check - No More Moves!" : "Check Word"}
                      variant="primary"
                      size="medium"
                      onClick={handleCheckWord}
                      disabled={wordSlots.every(slot => slot.letter === null)}
                      className={`font-bold px-8 py-3 ${
                        isMovesExhausted 
                          ? 'bg-gradient-to-r from-darkOrange to-orange text-white animate-pulse' 
                          : 'bg-gradient-to-r from-purple to-blue text-white'
                      }`}
                    />
                    <p className="text-xs mt-2 ${
                      isMovesExhausted ? 'font-bold' : '!text-darkBlue'
                    }">
                      {isMovesExhausted 
                        ? '⚠️ No more moves! Check your word now or it will auto-fail!' 
                        : '💡 Click to check your word when ready!'
                      }
                    </p>
                  </div>
                )}

                {/* Letter Tiles */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-lightBlue">
                  <h3 className="text-lg font-bold text-center text-darkBlue mb-4">Drag these letters:</h3>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {gameTiles.map((tile) => (
                      <LetterTile
                        key={tile.id}
                        id={tile.id}
                        letter={tile.letter}
                        isUsed={tile.isUsed}
                        onTileUsed={handleTileUsed}
                        disabled={isTimeOut}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Hint System */}
              <div className="lg:w-1/3 w-full">
                <HintSystem
                  word={currentWord}
                  showImageHint={mode === 'picture' && challengeMode !== 'hard'}
                  showAudioHint={challengeMode !== 'hard'}
                  showDefinitionHint={mode !== 'picture' && challengeMode !== 'hard'}
                  showMorphologyHint={mode === 'morphology'}
                  onHintUsed={handleHintUsed}
                  hintsUsed={hintsUsed}
                  resetActiveHint={!showFeedback}
                  challengeMode={challengeMode || 'normal'}
                />
              </div>
            </div>

            {/* Feedback Messages */}
            <div className="px-4 md:px-6">
              {/* Success Message */}
              {showFeedback && wordSlots.every(slot => slot.isCorrect) && (
                <div className="bg-gradient-to-r from-green to-lightGreen text-white rounded-2xl p-6 shadow-lg text-center animate-fadeIn max-w-md mx-auto">
                  <h3 className="text-2xl font-bold mb-2">
                    {mode === 'morphology' ? '🧬 Word DNA Decoded!' : '🎉 Perfect!'}
                  </h3>
                  <p className="text-lg mb-2">You built: <span className="font-bold">{currentWord.word.toUpperCase()}</span></p>
                  
                  {/* Syllable Mode Streak Bonus */}
                  {mode === 'syllable' && streak > 1 && (
                    <p className="text-sm mb-2">🔥 Streak Bonus: +{Math.floor(streak / 2)} points!</p>
                  )}
                  
                  {/* Morphology Mode Word Family Unlock */}
                  {mode === 'morphology' && wordFamilyUnlocked && currentWord.morphology && (
                    <div className="bg-white/20 rounded-lg p-3 mb-3 text-sm">
                      <p className="font-bold mb-1 text-darkBlue">🏆 Word Family Unlocked!</p>
                      <p className="text-xs">
                        You can now recognize {currentWord.morphology.root}-family words!
                      </p>
                    </div>
                  )}
                  
                  {/* Personal Best Achievement */}
                  {challengeMode === 'timed' && timeRemaining !== null && personalBest !== null && timeRemaining > personalBest && (
                    <p className="text-sm mb-2 bg-yellow-400/20 rounded px-2 py-1">
                      🏅 New Personal Best: {timeRemaining}s remaining!
                    </p>
                  )}
                  
                  <div className="flex justify-center mb-4">
                    <TextToSpeech heightWidth={40} spell={currentWord.word} />
                  </div>
                  <CustomButton
                    label={currentWordIndex >= words.length - 1 ? "Finish Game" : "Next Word"}
                    variant="primary"
                    size="small"
                    onClick={handleNextWord}
                    className="bg-white !text-green hover:bg-gray-100 font-bold px-6 py-2 mx-auto"
                  />
                </div>
              )}

              {/* Time Out Message */}
              {showFeedback && isTimeOut && challengeMode === 'timed' && (
                <div className="bg-gradient-to-r from-darkOrange to-orange text-white rounded-2xl p-6 shadow-lg text-center animate-fadeIn max-w-md mx-auto">
                  <h3 className="text-xl font-bold mb-2">⏰ Time&apos;s Up!</h3>
                  <p className="text-lg mb-2">The correct word was: <span className="font-bold">{currentWord.word.toUpperCase()}</span></p>
                  <p className="text-sm mb-4">Don&apos;t worry! Speed comes with practice.</p>
                  <div className="flex justify-center mb-4">
                    <TextToSpeech heightWidth={40} spell={currentWord.word} />
                  </div>
                  <CustomButton
                    label={currentWordIndex >= words.length - 1 ? "Finish Game" : "Next Word"}
                    variant="primary"
                    size="small"
                    onClick={handleNextWord}
                    className="bg-white !text-darkOrange hover:bg-gray-100 font-bold px-6 py-2 mx-auto"
                  />
                </div>
              )}

              {/* Moves Exhausted Message - Only show if word was not completed successfully */}
              {showFeedback && isMovesExhausted && challengeMode === 'limited' && !wordSlots.every(slot => slot.isCorrect) && (
                <div className="bg-gradient-to-r from-darkOrange to-orange text-white rounded-2xl p-6 shadow-lg text-center animate-fadeIn max-w-md mx-auto">
                  <h3 className="text-xl font-bold mb-2">🎯 No More Moves!</h3>
                  <p className="text-lg mb-2">The correct word was: <span className="font-bold">{currentWord.word.toUpperCase()}</span></p>
                  <p className="text-sm mb-4">Plan your moves carefully next time!</p>
                  <div className="flex justify-center mb-4">
                    <TextToSpeech heightWidth={40} spell={currentWord.word} />
                  </div>
                  <CustomButton
                    label={currentWordIndex >= words.length - 1 ? "Finish Game" : "Next Word"}
                    variant="primary"
                    size="small"
                    onClick={handleNextWord}
                    className="bg-white !text-darkOrange hover:bg-gray-100 font-bold px-6 py-2 mx-auto"
                  />
                </div>
              )}

              {/* Try Again Message */}
              {showFeedback && !isTimeOut && !isMovesExhausted && wordSlots.some(slot => slot.isCorrect === false) && (
                <div className="bg-gradient-to-r from-orange to-lightOrange text-white rounded-2xl p-6 shadow-lg text-center animate-fadeIn max-w-md mx-auto">
                  <h3 className="text-xl font-bold mb-2">🤔 Not quite right!</h3>
                  <p className="text-sm mb-4">Keep trying! You&apos;ve got this!</p>
                  <CustomButton
                    label="Try Again"
                    variant="secondary"
                    size="small"
                    onClick={resetCurrentWord}
                    className="bg-white text-orange hover:bg-gray-100 font-bold px-6 py-2"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Exit Confirmation Modal */}
        <ConfirmationModal
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          onConfirm={handleExit}
          title="Exit Word Builder?"
          message="Are you sure you want to exit? Your progress will be lost."
          confirmText="Exit"
          cancelText="Stay"
        />
      </div>
    </DragDropProvider>
  );
}