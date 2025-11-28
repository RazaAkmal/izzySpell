"use client";

import { useDrag } from 'react-dnd';
import { useEffect, useState } from 'react';

interface LetterTileProps {
  letter: string;
  id: string;
  isUsed: boolean;
  onTileUsed: (tileId: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function LetterTile({ letter, id, isUsed, onTileUsed, className = "", disabled = false }: LetterTileProps) {
  const [isShaking, setIsShaking] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'letter',
    item: { id, letter },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isUsed && !disabled,
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        onTileUsed(id);
      }
    },
  });

  // Add shake animation for incorrect placement feedback
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  useEffect(() => {
    // Expose shake function to parent component
    (window as any)[`shakeTile_${id}`] = triggerShake;
    return () => {
      delete (window as any)[`shakeTile_${id}`];
    };
  }, [id]);

  // Calculate responsive width based on content length
  const getResponsiveWidth = () => {
    const letterLength = letter.length;
    if (letterLength <= 2) return 'w-16 md:w-20';
    if (letterLength <= 4) return 'w-20 md:w-24';
    if (letterLength <= 6) return 'w-24 md:w-28';
    return 'w-28 md:w-32'; // For very long syllables
  };

  return (
    <div
      ref={drag as any}
      className={`
        ${className}
        ${isUsed || disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-move hover:scale-105 active:scale-95'}
        ${isDragging ? 'opacity-50 scale-110' : ''}
        ${isShaking ? 'animate-wiggle' : ''}
        ${getResponsiveWidth()}
        h-16 md:h-20 
        bg-gradient-to-br from-white to-lightBlue 
        border-4 border-blue 
        rounded-xl 
        flex items-center justify-center 
        font-bold text-lg md:text-xl lg:text-2xl text-darkBlue
        shadow-lg 
        transition-all duration-200
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
      {letter}
    </div>
  );
}
