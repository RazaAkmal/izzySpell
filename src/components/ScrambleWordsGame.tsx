"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import ConfirmationModal from "./ConfirmationModal";
import GameCompletionContent from "./GameCompletionContent";
import { useListName } from "@/context/ListNameContext";
import JSConfetti from "js-confetti";
import TextToSpeech from "./TextToSpeach";

interface ScrambleWordsGameProps {
  listId: string;
  scrambleWordsData: any[];
}

interface ScrambleWord {
  id: number;
  originalWord: string;
  scrambledOptions: string[];
  correctIndex: number;
}

interface GameCard {
  id: number;
  text: string;
  isCorrect: boolean;
  isFlipped: boolean;
  isSelected: boolean;
  hasShake: boolean;
}

const ScrambleWordsGame: React.FC<ScrambleWordsGameProps> = ({ listId, scrambleWordsData }) => {
  const { listName } = useListName();
  const router = useRouter();
  const confettiRef = useRef<JSConfetti | null>(null);
  
  const [scrambleWords, setScrambleWords] = useState<ScrambleWord[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [gameState, setGameState] = useState<"playing" | "answered" | "completed">("playing");
  const [score, setScore] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isConfirmLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [lastSelectedWord, setLastSelectedWord] = useState("");
  const [totalAttempts, setTotalAttempts] = useState(0); // Track total attempts across all questions

  const currentScrambleWord = scrambleWords[currentQuestionIndex];
  const totalQuestions = scrambleWords.length;

  // Load scramble words from props (already fetched in page component)
  useEffect(() => {
    if (scrambleWordsData && scrambleWordsData.length > 0) {
      // Convert database format to component format
      const convertedScrambleWords: ScrambleWord[] = scrambleWordsData.map((word: any, index: number) => {
        const options = Array.isArray(word.scrambledOptions) ? word.scrambledOptions as string[] : [];
        
        // Create a shuffled array of options
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
        
        // More robust correct answer detection
        const originalWordSorted = word.originalWord.split('').sort().join('').toLowerCase();
        
        // Find ALL potential correct options (anagrams) with detailed logging
        const anagramAnalysis = shuffledOptions
          .map((option, idx) => ({
            index: idx,
            option: option,
            optionSorted: option.split('').sort().join('').toLowerCase(),
            isAnagram: option.split('').sort().join('').toLowerCase() === originalWordSorted
          }));
        
        const correctIndices = anagramAnalysis
          .filter(item => item.isAnagram)
          .map(item => item.index);
        
        // Enhanced logging for debugging
        console.log(`Anagram analysis for "${word.originalWord}":`, {
          originalSorted: originalWordSorted,
          options: anagramAnalysis,
          correctCount: correctIndices.length,
          correctOptions: correctIndices.map(idx => shuffledOptions[idx])
        });
        
        // If multiple correct options exist, log a detailed warning
        if (correctIndices.length > 1) {
          console.warn(`🚨 MULTIPLE VALID ANAGRAMS DETECTED for "${word.originalWord}":`, 
            correctIndices.map(idx => `"${shuffledOptions[idx]}" (index ${idx})`));
          console.warn('This will cause incorrect game behavior. Consider regenerating scramble words.');
        } else if (correctIndices.length === 0) {
          console.error(`❌ NO VALID ANAGRAM FOUND for "${word.originalWord}". Options:`, shuffledOptions);
        }
        
        // Use the first correct option found, or 0 as fallback
        const correctIndex = correctIndices.length > 0 ? correctIndices[0] : 0;

        return {
          id: index,
          originalWord: word.originalWord,
          scrambledOptions: shuffledOptions,
          correctIndex: correctIndex >= 0 ? correctIndex : 0
        };
      });
      
      setScrambleWords(convertedScrambleWords);
    } else {
      // Fallback to exit if no scramble words
      router.push(`/spellPractice/${listId}`);
    }
  }, [scrambleWordsData, listId, router]);

  // Initialize game cards when scramble word changes
  useEffect(() => {
    if (currentScrambleWord && gameState === "playing") {
      const initialGameCards: GameCard[] = currentScrambleWord.scrambledOptions.map((option, index) => ({
        id: index,
        text: option,
        isCorrect: index === currentScrambleWord.correctIndex,
        isFlipped: false,
        isSelected: false,
        hasShake: false
      }));
      setGameCards(initialGameCards);
      setAttempts(0);
    }
  }, [currentScrambleWord, gameState]);

  // Reset hint only when starting a new question
  useEffect(() => {
    if (gameState === "playing" && currentScrambleWord) {
      setShowHint(false);
      setLastSelectedWord("");
    }
  }, [gameState, currentQuestionIndex, currentScrambleWord]);

  // Initialize confetti
  useEffect(() => {
    confettiRef.current = new JSConfetti();
  }, []);

  const generateHint = (correctWord: string, selectedWord: string) => {
    const correct = correctWord.toLowerCase();
    const selected = selectedWord.toLowerCase();
    
    if (correct.length !== selected.length) {
      if (correct.length > selected.length) {
        return `Good try! The word needs ${correct.length - selected.length} more letter${correct.length - selected.length > 1 ? 's' : ''}. Keep going!`;
      } else {
        return `Nice attempt! The word has ${selected.length - correct.length} too many letter${selected.length - correct.length > 1 ? 's' : ''}. Try another option!`;
      }
    }
    
    // Check for correct letters in wrong positions
    const correctLetters = correct.split('').filter((letter, index) => 
      selected[index] === letter
    ).length;
    
    if (correctLetters === 0) {
      return `Keep trying! The word starts with "${correct[0].toUpperCase()}". You can do this!`;
    } else if (correctLetters < correct.length / 2) {
      return `You're getting warmer! Some letters are in the right places. Try a different arrangement!`;
    } else {
      return `So close! You have most letters correct. Just try moving a few around!`;
    }
  };

  const handleCardClick = (cardIndex: number) => {
    if (gameState !== "playing") return;

    const clickedCard = gameCards[cardIndex];
    setLastSelectedWord(clickedCard.text);
    setAttempts(attempts + 1);

    if (clickedCard.isCorrect) {
      // Correct answer
      setGameCards(prev => prev.map((card, index) => ({
        ...card,
        isFlipped: true,
        isSelected: index === cardIndex
      })));
      
      setGameState("answered");
      setScore(score + 1);
      setShowHint(false);
      
      // Record attempts for this question
      setTotalAttempts(prev => prev + attempts + 1);
      
      // Trigger confetti
      confettiRef.current?.addConfetti({
        // emojis: ["🎉", "✨", "🌟", "🎊"],
        emojiSize: 50,
        confettiNumber: 1000,
      });

      // Smooth scroll to bottom after a brief delay to allow UI updates
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 800);

      // Auto-advance logic - only for final question
      if (currentQuestionIndex >= totalQuestions - 1) {
        setTimeout(() => {
          setGameState("completed");
          document.querySelector('.success-reveal')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 5000);
      }
    } else {
      // Wrong answer - show hint and shake effect
      setShowHint(true);
      
      // Add shake effect to the selected card
      setGameCards(prev => prev.map((card, index) => ({
        ...card,
        hasShake: index === cardIndex,
        isSelected: index === cardIndex
      })));

      // Clear shake effect and selection after animation
      setTimeout(() => {
        setGameCards(prev => prev.map(card => ({
          ...card,
          hasShake: false,
          isSelected: false
        })));
      }, 600);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setGameState("playing");
      setAttempts(0); // Reset attempts for new question
    } else {
      setGameState("completed");
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState("playing");
    setAttempts(0);
    setTotalAttempts(0);
    setShowHint(false);
  };

  const handleClose = () => {
    setShowExitModal(true);
  };

  const handleExitConfirm = () => {
    router.push(`/spellPractice/${listId}`);
  };

  return (
    <div className="m-2 md:m-6 px-8 md:px-4 rounded-2xl shadow-md bg-gradient-to-br from-lightBlue via-skyBlue to-lightGreen">
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
            {gameState === "completed" 
              ? "🧩 Scramble Challenge Complete!" 
              : "🧩 Scramble Challenge"
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

      {/* Conditional Content */}
      {gameState === "completed" ? (
        <GameCompletionContent
          gameTitle="Scramble Challenge"
          totalQuestions={totalQuestions}
          totalAttempts={totalAttempts}
          onPlayAgain={handleRestart}
          onBackToExercises={handleExitConfirm}
          motivationalMessage="You completed the Scramble Words challenge!"
          successEmoji="🎊"
        />
      ) : (
        <>
          {/* Progress Bar */}
          <div className="px-6 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-textColor">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-sm font-medium text-textColor">
                  Score: {score}/{totalQuestions}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple to-blue h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="flex flex-col items-center justify-center px-4 md:px-6 pb-8">
            {/* Target Word Display */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border-2 border-lightBlue max-w-2xl w-full">
              <div className="text-center">
                <h3 className="text-lg font-bold text-darkBlue mb-3">🎯 Unscramble this word:</h3>
                {showHint && lastSelectedWord && (
                  <div 
                    key={lastSelectedWord + attempts} // Re-trigger animation for each new hint
                    className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white rounded-xl p-4 mb-4 shadow-lg border-2 border-red-400 transform transition-all duration-500 ease-out hover:scale-105 animate-pulse"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl animate-bounce">💡</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-darkBlue mb-2 text-lg drop-shadow-lg">💭 Helpful Hint:</h4>
                        <p className="text-darkBlue font-medium leading-relaxed drop-shadow-md">
                          {generateHint(currentScrambleWord.originalWord, lastSelectedWord)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <TextToSpeech heightWidth={40} spell={currentScrambleWord?.originalWord} />
                </div>
                <p className="text-center text-sm mt-2 opacity-90 text-textColor">
                  Tap the speaker to hear the word pronunciation
                </p>
              </div>
            </div>

            {/* Instruction */}
            <div className="bg-gradient-to-r from-purple to-blue text-white rounded-2xl p-4 mb-6 shadow-lg max-w-2xl w-full">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
                🧩 Which scrambled letters spell the word correctly?
              </h2>
              <p className="text-center text-sm opacity-90">
                Choose the correct arrangement of letters
              </p>
            </div>
            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl w-full">
              {gameCards.map((card) => (
                <div
                  key={card.id}
                  className={`relative h-28 sm:h-32 md:h-40 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                    card.hasShake ? 'animate-wiggle' : ''
                  }`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className={`
                    w-full h-full rounded-2xl shadow-lg border-2 transition-all duration-500 flex items-center justify-center
                    ${card.isFlipped 
                      ? (card.isCorrect ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600')
                      : 'bg-white border-lightBlue hover:border-purple hover:shadow-xl'
                    }
                    ${card.isSelected && !card.isFlipped ? 'ring-4 ring-blue-400' : ''}
                  `}>
                    <div className="text-center p-2 sm:p-3 md:p-4 w-full h-full flex items-center justify-center">
                      {card.isFlipped && (
                        <div className="absolute top-2 right-2">
                          {card.isCorrect ? (
                            <div className="text-white text-xl sm:text-2xl">✓</div>
                          ) : (
                            <div className="text-white text-xl sm:text-2xl">✗</div>
                          )}
                        </div>
                      )}
                      <p className={`
                        font-bold tracking-wider break-all text-center leading-tight overflow-hidden
                        ${card.isFlipped ? 'text-white' : 'text-purple'}
                        ${card.text.length <= 4 ? 'text-xl sm:text-2xl md:text-3xl' : 
                          card.text.length <= 8 ? 'text-lg sm:text-xl md:text-2xl' : 
                          card.text.length <= 12 ? 'text-base sm:text-lg md:text-xl' :
                          card.text.length <= 16 ? 'text-sm sm:text-base md:text-lg' :
                          card.text.length <= 20 ? 'text-xs sm:text-sm md:text-base' :
                          'text-xs sm:text-xs md:text-sm'}
                      `}>
                        {card.text.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Button */}
            {gameState === "answered" && (
              <div className="mt-8">
                <CustomButton
                  label={currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "View Results"}
                  variant="primary"
                  size="large"
                  onClick={handleNextQuestion}
                />
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
        title="Exit Scramble Challenge?"
        message="Are you sure you want to exit? Your progress will be lost."
        confirmText="Yes, Exit"
        cancelText="Continue Playing"
        isLoading={isConfirmLoading}
      />
    </div>
  );
};

export default ScrambleWordsGame;
