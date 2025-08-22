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

interface FlashCardsGameProps {
  listId: string;
  flashCardsData: any[];
}

interface FlashCard {
  id: number;
  listId: number;
  originalWord: string;
  options: string[];
  correctIndex: number;
  definition: string;
  exampleSentence: string;
}

interface GameCard {
  id: number;
  text: string;
  isCorrect: boolean;
  isFlipped: boolean;
  isSelected: boolean;
  hasShake: boolean;
}

const FlashCardsGame: React.FC<FlashCardsGameProps> = ({ listId, flashCardsData }) => {
  const { listName } = useListName();
  const router = useRouter();
  const confettiRef = useRef<JSConfetti | null>(null);
  
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [gameState, setGameState] = useState<"loading" | "introduction" | "playing" | "answered" | "completed">("loading");
  const [score, setScore] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isConfirmLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [lastSelectedWord, setLastSelectedWord] = useState<string>("");
  const [totalAttempts, setTotalAttempts] = useState(0); // Track total attempts across all questions

  const currentFlashCard = flashCards[currentQuestionIndex];
  const totalQuestions = flashCards.length;

  // Load flash cards from props (already fetched in page component)
  useEffect(() => {
    if (flashCardsData && flashCardsData.length > 0) {
      // Convert the JsonValue options to string array
      const convertedFlashCards: FlashCard[] = flashCardsData.map((card) => {
        const options = Array.isArray(card.options) ? card.options as string[] : [];
        
        // Shuffle the options to randomize correct answer position
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
        
        // Find the new correct index after shuffling
        const correctOption = options[card.correctIndex];
        const newCorrectIndex = shuffledOptions.findIndex(option => option === correctOption);
        
        return {
          ...card,
          options: shuffledOptions,
          correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0
        };
      });
      setFlashCards(convertedFlashCards);
      setGameState("playing");
    } else {
      // Fallback to exit if no flash cards
      router.push(`/spellPractice/${listId}`);
    }
  }, [flashCardsData, listId, router]);

  // Initialize game cards when flash card changes
  useEffect(() => {
    if (currentFlashCard && gameState === "playing") {
      const initialGameCards: GameCard[] = currentFlashCard.options.map((option, index) => ({
        id: index,
        text: option,
        isCorrect: index === currentFlashCard.correctIndex,
        isFlipped: false,
        isSelected: false,
        hasShake: false
      }));
      setGameCards(initialGameCards);
      setAttempts(0);
    }
  }, [currentFlashCard, gameState]);

  // Reset hint only when starting a new question (in playing state)
  useEffect(() => {
    if (gameState === "playing" && currentFlashCard) {
      setShowHint(false);
      setLastSelectedWord("");
    }
  }, [gameState, currentQuestionIndex, currentFlashCard]);

  // Initialize confetti
  useEffect(() => {
    confettiRef.current = new JSConfetti();
  }, []);

  const generateHint = (correctWord: string, selectedWord: string) => {
    // More sophisticated hint generation based on word analysis
    const correct = correctWord.toLowerCase();
    const selected = selectedWord.toLowerCase();
    
    if (correct.length !== selected.length) {
      if (correct.length > selected.length) {
        return `The word needs ${correct.length - selected.length} more letter${correct.length - selected.length > 1 ? 's' : ''}!`;
      } else {
        return `The word has ${selected.length - correct.length} too many letter${selected.length - correct.length > 1 ? 's' : ''}!`;
      }
    }
    
    // Find first difference
    const diffIndex = correct.split('').findIndex((char, i) => char !== selected[i]);
    
    if (diffIndex === -1) return "Almost there!";
    
    if (diffIndex < correct.length / 3) {
      return "Check the beginning letters!";
    } else if (diffIndex > (correct.length * 2) / 3) {
      return "Check the ending letters!";
    } else {
      return "Check the middle letters!";
    }
  };

  const handleCardClick = (cardId: number) => {
    if (gameState !== "playing") return;

    const clickedCard = gameCards.find(card => card.id === cardId);
    if (!clickedCard) return;

    // Store the selected word for hint generation
    setLastSelectedWord(clickedCard.text);
    
    // Calculate new attempts count for this question
    const newAttempts = attempts + 1;
    console.log(`Question ${currentQuestionIndex + 1}: Click #${newAttempts}, isCorrect: ${clickedCard.isCorrect}`);
    setAttempts(newAttempts);
    
    // Always increment total attempts for every click
    setTotalAttempts(prev => {
      const newTotal = prev + 1;
      console.log(`Total attempts incremented to: ${newTotal}`);
      return newTotal;
    });

    // Mark the clicked card as selected and flip it
    setGameCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, isSelected: true, isFlipped: true }
          : card
      )
    );

    setGameState("answered");

    // If correct answer, show confetti and increase score
    if (clickedCard.isCorrect) {
      // Hide hint immediately when correct answer is selected
      setShowHint(false);
      
      if (confettiRef.current) {
        confettiRef.current.addConfetti();
      }
      setScore(prevScore => prevScore + 1);
      
      // After a delay, flip all cards to show correct answer
      setTimeout(() => {
        setGameCards(prevCards => 
          prevCards.map(card => ({ ...card, isFlipped: true }))
        );
        
        // Scroll down to show the success reveal content and next button
        setTimeout(() => {
          // First scroll to success element, then to bottom to ensure next button is visible
          const successElement = document.querySelector('.success-reveal');
          if (successElement) {
            successElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            
            // Then scroll to bottom after a brief delay to show next button
            setTimeout(() => {
              window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
              });
            }, 300);
          } else {
            // Fallback: just scroll to bottom
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 500); // Small delay to ensure the success content has rendered
      }, 1000);

      // Auto-advance to next question only on the last question
      if (currentQuestionIndex >= totalQuestions - 1) {
        setTimeout(() => {
          handleNextQuestion();
        }, 5000);
      }
    } else {
      // For incorrect answers, show hint and shake animation
      // Note: attempts are already incremented at the beginning of handleCardClick
      
      // Show shake animation
      setGameCards(prevCards => 
        prevCards.map(card => 
          card.id === cardId 
            ? { ...card, hasShake: true }
            : card
        )
      );

      // Remove shake animation after 600ms
      setTimeout(() => {
        setGameCards(prevCards => 
          prevCards.map(card => ({ ...card, hasShake: false }))
        );
      }, 600);

      // Show hint after first wrong attempt
      if (newAttempts === 1) { // Show hint on first wrong attempt
        setShowHint(true);
      }

      // Reset game state for retry (hint will persist)
      setTimeout(() => {
        setGameCards(prevCards => 
          prevCards.map(card => ({ 
            ...card, 
            isSelected: false, 
            isFlipped: false 
          }))
        );
        setGameState("playing");
      }, 1000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= totalQuestions - 1) {
      setGameState("completed");
      return;
    }

    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    setGameState("playing");
  };

  const handleExit = () => {
    router.push(`/spellPractice/${listId}`);
  };

  const handleRestartGame = () => {
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

  // Loading state
  if (gameState === "loading" || flashCards.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-skyBlue rounded-md mx-4 md:mx-8 lg:mx-7">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-darkBlue">Loading Flash Cards...</h2>
        </div>
      </div>
    );
  }

  // Main game return with conditional content
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
              ? "🕵️ Flash Cards Challenge Complete!" 
              : "🕵️ Spell & Guess Challenge"
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
          gameTitle="Flash Cards Challenge"
          totalQuestions={totalQuestions}
          totalAttempts={totalAttempts}
          onPlayAgain={handleRestartGame}
          onBackToExercises={handleExit}
          motivationalMessage="You completed the Flash Cards challenge!"
          successEmoji="🎊"
        />
      ) : (
        <>
          {/* Game Info */}
          <div className="text-center mb-6">
            <p className="text-sm text-textColor">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            <p className="text-lg font-bold text-green">Score: {score}</p>
          </div>

          {/* Progress Bar */}
          <div className="mx-20 mb-6">
            <div className="bg-white/60 rounded-full h-3 overflow-hidden border border-lightBlue">
              <div 
                className="bg-gradient-to-r from-green to-blue h-full transition-all duration-500 ease-out"
                style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Hint Display */}
          {showHint && (
            <div className="mx-4 mb-4 p-4 bg-orange/90 rounded-lg border-2 border-darkOrange animate-pulse">
              <p className="text-center text-white font-bold">
                💡 Hint: {generateHint(currentFlashCard.originalWord, lastSelectedWord)}
              </p>
            </div>
          )}

          {/* Main Game Area */}
          <div className="flex flex-col items-center justify-center px-4 md:px-6 pb-8">
            {/* Context Reminder */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border-2 border-lightBlue max-w-3xl w-full">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-lightBlue/30 rounded-xl p-4">
                  <h3 className="text-md font-bold text-darkBlue mb-2">📘 Definition:</h3>
                  <p className="text-md text-textColor">{currentFlashCard.definition}</p>
                </div>
                <div className="bg-lightGreen/30 rounded-xl p-4">
                  <h3 className="text-md font-bold text-darkBlue mb-2">📝 Complete this:</h3>
                  <p className="text-md text-textColor">
                    {currentFlashCard.exampleSentence.replace(
                      new RegExp(currentFlashCard.originalWord, 'gi'), 
                      '______'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Instruction */}
            <div className="bg-gradient-to-r from-purple to-blue text-white rounded-2xl p-4 mb-6 shadow-lg">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
                💡 Your mission: Which spelling completes the sentence?
              </h2>
              <div className="flex justify-center">
                <TextToSpeech heightWidth={40} spell={currentFlashCard.originalWord} />
              </div>
              <p className="text-center text-sm mt-2 opacity-90">
                Tap the speaker to hear the word pronunciation
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl w-full">
              {gameCards.map((card) => (
                <div
                  key={card.id}
                  className={`relative h-28 sm:h-32 md:h-40 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                    gameState === "playing" ? "hover:shadow-xl" : ""
                  } ${card.hasShake ? "animate-wiggle" : ""}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className={`flip-card-inner relative w-full h-full text-center transition-transform duration-[600ms] [transform-style:preserve-3d] ${card.isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    {/* Front of card */}
                    <div className="flip-card-front absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-white to-lightBlue rounded-2xl shadow-lg border-4 border-blue flex items-center justify-center p-2">
                      <span className={`font-bold text-darkBlue text-center break-words hyphens-auto leading-tight ${
                        card.text.length > 20 ? 'text-sm sm:text-base md:text-lg' :
                        card.text.length > 15 ? 'text-base sm:text-lg md:text-xl' :
                        card.text.length > 10 ? 'text-lg sm:text-xl md:text-2xl' :
                        'text-xl sm:text-2xl md:text-3xl'
                      }`}>
                        {card.text}
                      </span>
                    </div>
                    
                    {/* Back of card */}
                    <div className={`flip-card-back absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-lg border-4 flex items-center justify-center ${
                      card.isCorrect 
                        ? "bg-gradient-to-br from-green to-lightGreen border-darkGreen" 
                        : "bg-gradient-to-br from-orange to-lightOrange border-darkOrange"
                    }`}>
                      <div className="text-center text-white">
                        {card.isCorrect ? (
                          <>
                            <div className="text-3xl sm:text-4xl md:text-5xl mb-2">✅</div>
                            <p className="text-base sm:text-lg md:text-xl font-bold">Correct!</p>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl sm:text-4xl md:text-5xl mb-2">🤔</div>
                            <p className="text-base sm:text-lg md:text-xl font-bold">Not quite!</p>
                            <p className="text-sm opacity-90">Try again!</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Reveal - Only show when correct answer is selected and cards are flipped */}
            {gameState === "answered" && gameCards.some(card => card.isCorrect && card.isSelected && card.isFlipped) && (
              <div className="success-reveal mt-6 bg-gradient-to-r from-green to-lightGreen rounded-2xl p-6 shadow-lg border-4 border-darkGreen max-w-2xl w-full">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">🎉 Perfect! The word is:</h3>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">{currentFlashCard.originalWord.toUpperCase()}</h2>
                  <p className="text-lg mb-2">
                    &ldquo;{currentFlashCard.exampleSentence}&rdquo;
                  </p>
                  <div className="flex justify-center mt-4">
                    <TextToSpeech heightWidth={40} spell={currentFlashCard.originalWord} />
                  </div>
                </div>
              </div>
            )}

            {/* Next Button */}
            {gameState === "answered" && gameCards.some(card => card.isCorrect && card.isSelected) && (
              <div className="mt-8">
                <CustomButton
                  label={currentQuestionIndex >= totalQuestions - 1 ? "Finish Game" : "Next Question"}
                  variant="primary"
                  size="small"
                  onClick={handleNextQuestion}
                  className="px-6 md:px-8 py-3 text-base md:text-lg"
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
        title="Exit Flash Cards?"
        message="Are you sure you want to exit? Your progress will be lost."
        confirmText="Exit"
        cancelText="Stay"
      />
    </div>
  );
};

export default FlashCardsGame;
