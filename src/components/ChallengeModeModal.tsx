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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-lightBlue">
          <div>
            <h2 className="text-2xl font-bold text-purple">Choose Your Challenge</h2>
            <p className="text-sm text-darkBlue mt-1">Select a challenge mode to start your word building adventure!</p>
          </div>
          <Button 
            onClick={onClose}
            className="p-2 hover:bg-lightBlue rounded-lg transition-colors"
          >
            <Image
              src="/images/Vector.svg"
              alt="Close"
              width={24}
              height={24}
            />
          </Button>
        </div>

        {/* Challenge Mode Options */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengeModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`
                  cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 hover:scale-102
                  ${selectedMode === mode.id 
                    ? 'border-purple bg-gradient-to-br from-purple/10 to-blue/10 shadow-lg' 
                    : 'border-lightBlue bg-gradient-to-br from-white to-lightBlue/30 hover:border-blue'
                  }
                `}
              >
                {/* Mode Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-darkBlue">{mode.title}</h3>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-bold text-white
                    ${mode.difficulty === 'Easy' ? 'bg-green' : 
                      mode.difficulty === 'Medium' ? 'bg-orange' : 'bg-darkOrange'}
                  `}>
                    {mode.difficulty}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-darkBlue mb-4">{mode.description}</p>

                {/* Features */}
                <div className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-darkBlue">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${mode.color}`} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedMode === mode.id && (
                  <div className="mt-4 flex items-center gap-2 text-purple font-bold text-sm">
                    <span className="text-lg">✓</span>
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-lightBlue bg-gradient-to-r from-lightBlue/20 to-skyBlue/20">
          <div className="flex items-center gap-2 text-sm text-darkBlue">
            <span className="text-lg">💡</span>
            <span>You can always change the challenge mode later!</span>
          </div>
          
          <div className="flex gap-3">
            <CustomButton
              label="Cancel"
              variant="secondary"
              size="small"
              onClick={onClose}
              className="px-6"
            />
            <CustomButton
              label="Start Challenge"
              variant="primary"
              size="small"
              onClick={handleConfirm}
              className="px-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}