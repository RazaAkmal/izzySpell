"use client";

import { useState } from 'react';
import { Button } from '@headlessui/react';
import Image from 'next/image';
import CustomButton from './HeadlessButton';

interface ChallengeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'normal' | 'timed' | 'limited' | 'hard') => void;
}

export default function ChallengeModeModal({
  isOpen,
  onClose,
  onSelectMode
}: ChallengeModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<'normal' | 'timed' | 'limited' | 'hard'>('normal');

  const challengeModes = [
    {
      id: 'normal' as const,
      title: '🎯 Normal Mode',
      description: 'Take your time to build words with hints available.',
      features: ['Unlimited time', 'All hints available', 'Perfect for learning'],
      difficulty: 'Easy',
      color: 'from-blue to-lightBlue'
    },
    {
      id: 'timed' as const,
      title: '⏰ Timed Challenge',
      description: 'Race against the clock to build words quickly!',
      features: ['Limited time per word', 'Speed bonus points', 'Personal best tracking'],
      difficulty: 'Medium',
      color: 'from-orange to-lightOrange'
    },
    {
      id: 'limited' as const,
      title: '🎯 Limited Moves',
      description: 'Build words with a limited number of moves.',
      features: ['Restricted moves per word', 'Strategic thinking required', 'Precision matters'],
      difficulty: 'Medium',
      color: 'from-purple to-blue'
    },
    {
      id: 'hard' as const,
      title: '🔥 Hard Mode',
      description: 'Ultimate challenge with decoy letters and no visual hints!',
      features: ['Extra decoy letters', 'No image/audio hints', 'For spelling experts'],
      difficulty: 'Hard',
      color: 'from-darkOrange to-orange'
    }
  ];

  const handleConfirm = () => {
    onSelectMode(selectedMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col sm:mx-4">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-lightBlue flex-shrink-0 bg-white">
          <div className="flex-1 pr-2">
            <h2 className="text-xl sm:text-2xl font-bold text-purple">Choose Your Challenge</h2>
            <p className="text-xs sm:text-sm text-darkBlue mt-1 hidden sm:block">Select a challenge mode to start your word building adventure!</p>
          </div>
          <Button 
            onClick={onClose}
            className="p-2 hover:bg-lightBlue rounded-lg transition-colors flex-shrink-0 touch-manipulation"
          >
            <Image
              src="/images/Vector.svg"
              alt="Close"
              width={24}
              height={24}
            />
          </Button>
        </div>

        {/* Challenge Mode Options - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {challengeModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`
                  cursor-pointer rounded-xl p-4 sm:p-6 border-2 transition-all duration-200 active:scale-[0.98] md:hover:scale-[1.02] touch-manipulation
                  ${selectedMode === mode.id 
                    ? 'border-purple bg-gradient-to-br from-purple/10 to-blue/10 shadow-lg' 
                    : 'border-lightBlue bg-gradient-to-br from-white to-lightBlue/30 md:hover:border-blue'
                  }
                `}
              >
                {/* Mode Header */}
                <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-darkBlue flex-1">{mode.title}</h3>
                  <div className={`
                    px-2.5 py-0.5 rounded-full text-xs font-bold text-white flex-shrink-0
                    ${mode.difficulty === 'Easy' ? 'bg-green' : 
                      mode.difficulty === 'Medium' ? 'bg-orange' : 'bg-darkOrange'}
                  `}>
                    {mode.difficulty}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-darkBlue mb-2.5 sm:mb-4">{mode.description}</p>

                {/* Features */}
                <div className="space-y-1.5 sm:space-y-2">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-darkBlue">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${mode.color} flex-shrink-0 mt-1`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedMode === mode.id && (
                  <div className="mt-2.5 sm:mt-4 flex items-center gap-1.5 text-purple font-bold text-xs sm:text-sm">
                    <span className="text-base sm:text-lg">✓</span>
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 border-t border-lightBlue bg-gradient-to-r from-lightBlue/20 to-skyBlue/20 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-darkBlue justify-center sm:justify-start">
            <span className="text-lg">💡</span>
            <span>You can always change the mode later!</span>
          </div>
          
          <div className="flex gap-2.5 w-full sm:w-auto">
            <CustomButton
              label="Cancel"
              variant="secondary"
              size="small"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-semibold touch-manipulation min-h-[44px]"
            />
            <CustomButton
              label="Start Challenge"
              variant="primary"
              size="small"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-semibold touch-manipulation min-h-[44px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}