"use client";

import { useDrop } from 'react-dnd';

interface DropSlotProps {
  index: number;
  letter: string | null;
  isCorrect: boolean | null;
  onDrop: (letter: string, index: number) => void;
  onRemove?: (index: number) => void;
  showFeedback: boolean;
  showRemoveButton?: boolean;
  className?: string;
}

export default function DropSlot({ 
  index, 
  letter, 
  isCorrect, 
  onDrop, 
  onRemove,
  showFeedback, 
  showRemoveButton = false,
  className = "" 
}: DropSlotProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'letter',
    drop: (item: { id: string; letter: string }) => {
      onDrop(item.letter, index);
    },
    canDrop: () => {
      // Prevent dropping if slot already has a letter
      return letter === null;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getSlotStyle = () => {
    if (showFeedback && letter) {
      return isCorrect 
        ? 'bg-gradient-to-br from-green to-lightGreen border-darkGreen text-white'
        : 'bg-gradient-to-br from-orange to-lightOrange border-darkOrange text-white';
    }
    
    if (isOver && canDrop) {
      return 'bg-lightBlue/50 border-blue border-dashed scale-105';
    }
    
    if (letter) {
      return 'bg-gradient-to-br from-white to-lightBlue border-blue text-darkBlue';
    }
    
    return 'bg-white/60 border-gray-300 border-dashed';
  };

  // Calculate responsive width based on content length
  const getResponsiveWidth = () => {
    if (!letter) return 'w-16 md:w-20'; // Default size for empty slots
    
    const letterLength = letter.length;
    if (letterLength <= 2) return 'w-16 md:w-20';
    if (letterLength <= 4) return 'w-20 md:w-24';
    if (letterLength <= 6) return 'w-24 md:w-28';
    return 'w-28 md:w-32'; // For very long syllables
  };

  return (
    <div
      ref={drop as any}
      className={`
        ${className}
        ${getSlotStyle()}
        ${getResponsiveWidth()}
        h-16 md:h-20
        border-4 
        rounded-xl 
        flex items-center justify-center 
        font-bold text-lg md:text-xl lg:text-2xl
        shadow-lg 
        transition-all duration-300
        select-none
        touch-none
        px-2
      `}
      style={{
        minWidth: '44px', // Accessibility: minimum touch target
        minHeight: '44px',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {letter && (
        <span className={showFeedback && isCorrect ? 'animate-bounce' : ''}>
          {letter}
        </span>
      )}
      {/* Remove button for limited moves mode */}
      {showRemoveButton && letter && onRemove && !showFeedback && (
        <button
          onClick={() => onRemove(index)}
          className="absolute -top-1 -right-1 bg-darkOrange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-orange transition-colors"
          title="Remove letter (FREE - no move cost)"
        >
          ×
        </button>
      )}
      {/* Show feedback only when word is complete or timeout occurs */}
      {showFeedback && letter && isCorrect && (
        <div className="absolute -top-2 -right-2">
          <span className="text-lg">✅</span>
        </div>
      )}
      {showFeedback && letter && isCorrect === false && (
        <div className="absolute -top-2 -right-2">
          <span className="text-lg">❌</span>
        </div>
      )}
      {/* Show X marks on empty slots when feedback is shown (timeout or completion) */}
      {showFeedback && !letter && (
        <div className="absolute -top-2 -right-2">
          <span className="text-lg">❌</span>
        </div>
      )}
    </div>
  );
}
