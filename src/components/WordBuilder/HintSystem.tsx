"use client";

import { useState, useEffect } from 'react';
import TextToSpeech from '../TextToSpeach';
import { WordBuilderWord } from '../../data/wordBuilderData';

interface HintSystemProps {
  word: WordBuilderWord;
  showImageHint: boolean;
  showAudioHint: boolean;
  showDefinitionHint: boolean;
  showMorphologyHint: boolean;
  onHintUsed: (hintType: string) => void;
  hintsUsed: string[];
  resetActiveHint?: boolean;
  challengeMode?: 'normal' | 'timed' | 'limited' | 'hard';
}

export default function HintSystem({
  word,
  showImageHint,
  showAudioHint,
  showDefinitionHint,
  showMorphologyHint,
  onHintUsed,
  hintsUsed,
  resetActiveHint = false,
  challengeMode = 'normal'
}: HintSystemProps) {
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Reset active hint when word changes
  useEffect(() => {
    if (resetActiveHint) {
      setActiveHint(null);
    }
  }, [resetActiveHint]);

  const handleHintClick = (hintType: string) => {
    if (!hintsUsed.includes(hintType)) {
      onHintUsed(hintType);
    }
    setActiveHint(activeHint === hintType ? null : hintType);
  };

  return (
    <div className="bg-gradient-to-r from-white/95 to-lightBlue/30 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-blue/20 w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-purple mb-1">
          {challengeMode === 'hard' ? '� Hard Mode - Limited Hints!' : '�🔍 Need a hint?'}
        </h3>
        <div className="w-12 h-0.5 bg-gradient-to-r from-purple to-blue rounded-full mx-auto"></div>
        {challengeMode === 'hard' && (
          <p className="text-xs text-darkOrange mt-1 font-medium">⚠️ Visual and audio hints disabled</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {/* Image Hint */}
        {showImageHint && word.image && (
          <button
            onClick={() => handleHintClick('image')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('image') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-blue/20 to-lightBlue/40 hover:from-blue/30 hover:to-lightBlue/50 text-darkBlue border border-blue/30'
              }
            `}
          >
            <div className="text-xl mb-1">🖼️</div>
            <div className="text-xs font-medium">Picture</div>
            {hintsUsed.includes('image') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}

        {/* Audio Hint */}
        {showAudioHint && (
          <button
            onClick={() => handleHintClick('audio')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('audio') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-orange/20 to-lightOrange/40 hover:from-orange/30 hover:to-lightOrange/50 text-darkBlue border border-orange/30'
              }
            `}
          >
            <div className="text-xl mb-1">🔊</div>
            <div className="text-xs font-medium">Sound</div>
            {hintsUsed.includes('audio') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}

        {/* Definition Hint */}
        {showDefinitionHint && (
          <button
            onClick={() => handleHintClick('definition')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('definition') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-purple/20 to-blue/40 hover:from-purple/30 hover:to-blue/50 text-darkBlue border border-purple/30'
              }
            `}
          >
            <div className="text-xl mb-1">📖</div>
            <div className="text-xs font-medium">Meaning</div>
            {hintsUsed.includes('definition') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}

        {/* Sentence Hint for Phonics Mode */}
        {word.mode === 'phonics' && word.sentence && (
          <button
            onClick={() => handleHintClick('sentence')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('sentence') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-lightOrange/20 to-orange/40 hover:from-lightOrange/30 hover:to-orange/50 text-darkBlue border border-lightOrange/30'
              }
            `}
          >
            <div className="text-xl mb-1">💬</div>
            <div className="text-xs font-medium">Sentence</div>
            {hintsUsed.includes('sentence') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}

        {/* Reveal Sound Hint for Phonics Mode */}
        {word.mode === 'phonics' && word.phonemes && (
          <button
            onClick={() => handleHintClick('revealSound')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('revealSound') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-darkGreen/20 to-lightGreen/40 hover:from-darkGreen/30 hover:to-lightGreen/50 text-darkBlue border border-darkGreen/30'
              }
            `}
          >
            <div className="text-xl mb-1">🔍</div>
            <div className="text-xs font-medium">One Sound</div>
            {hintsUsed.includes('revealSound') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}

        {/* Peek Syllable Hint for Syllable Mode */}
        {word.mode === 'syllable' && word.syllables && (
          <button
            onClick={() => handleHintClick('peekSyllable')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('peekSyllable') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-darkBlue/20 to-blue/40 hover:from-darkBlue/30 hover:to-blue/50 text-darkBlue border border-darkBlue/30'
              }
            `}
          >
            <div className="text-xl mb-1">👀</div>
            <div className="text-xs font-medium">Peek</div>
            <div className="text-xs opacity-75">(-0.5 pts)</div>
            {hintsUsed.includes('peekSyllable') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}

        {/* Syllable Explanation Hint for Syllable Mode */}
        {word.mode === 'syllable' && word.syllableExplanation && (
          <button
            onClick={() => handleHintClick('syllableExplanation')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('syllableExplanation') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-purple/20 to-purple/40 hover:from-purple/30 hover:to-purple/50 text-darkBlue border border-purple/30'
              }
            `}
          >
            <div className="text-xl mb-1">💡</div>
            <div className="text-xs font-medium">Why Split?</div>
            {hintsUsed.includes('syllableExplanation') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}

        {/* Morphology Hint */}
        {showMorphologyHint && word.morphology && (
          <button
            onClick={() => handleHintClick('morphology')}
            className={`
              relative overflow-hidden rounded-lg p-3 transition-all duration-300 transform hover:scale-105 active:scale-95
              ${hintsUsed.includes('morphology') 
                ? 'bg-gradient-to-br from-green to-lightGreen text-white shadow-md' 
                : 'bg-gradient-to-br from-pink/20 to-purple/40 hover:from-pink/30 hover:to-purple/50 text-darkBlue border border-pink/30'
              }
            `}
          >
            <div className="text-xl mb-1">🧩</div>
            <div className="text-xs font-medium">Word Parts</div>
            {hintsUsed.includes('morphology') && (
              <div className="absolute top-0.5 right-0.5 text-white text-xs">✓</div>
            )}
          </button>
        )}
      </div>

      {/* Active Hint Display */}
      {activeHint && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-white/90 to-lightBlue/20 border border-blue/30 shadow-md animate-fadeIn">
          {activeHint === 'image' && word.image && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue/10 to-lightBlue/20 rounded-xl p-4 mb-3">
                <div className="text-6xl mb-2">{word.image}</div>
              </div>
              <p className="text-sm font-medium text-darkBlue">{word.imageAlt}</p>
            </div>
          )}

          {activeHint === 'audio' && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange/10 to-lightOrange/20 rounded-xl p-4 mb-3 flex justify-center items-center">
                <TextToSpeech heightWidth={60} spell={word.word} />
              </div>
              <p className="text-sm font-medium text-darkBlue">🎵 Listen to how it sounds</p>
            </div>
          )}

          {activeHint === 'definition' && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple/10 to-blue/20 rounded-xl p-4 space-y-3">
                <div className="text-2xl">📚</div>
                <p className="text-lg font-bold text-purple mb-2">{word.definition}</p>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-sm italic text-darkBlue">&ldquo;{word.exampleSentence}&rdquo;</p>
                </div>
              </div>
            </div>
          )}

          {activeHint === 'sentence' && word.sentence && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-lightOrange/10 to-orange/20 rounded-xl p-4 space-y-3">
                <div className="text-2xl">💬</div>
                <h4 className="text-sm font-bold text-purple mb-3">Say it in a sentence:</h4>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-lg italic text-darkBlue">&ldquo;{word.sentence}&rdquo;</p>
                </div>
              </div>
            </div>
          )}

          {activeHint === 'revealSound' && word.phonemes && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-darkGreen/10 to-lightGreen/20 rounded-xl p-4 space-y-3">
                <div className="text-2xl">🔍</div>
                <h4 className="text-sm font-bold text-purple mb-3">First Sound Revealed:</h4>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple mb-2">{word.phonemes[0]}</div>
                  <p className="text-sm text-darkBlue">This is the first sound in the word!</p>
                </div>
              </div>
            </div>
          )}

          {activeHint === 'peekSyllable' && word.syllables && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-darkBlue/10 to-blue/20 rounded-xl p-4 space-y-3">
                <div className="text-2xl">👀</div>
                <h4 className="text-sm font-bold text-darkBlue mb-3">Peek at First Syllable:</h4>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-darkBlue mb-2">{word.syllables[0]}</div>
                  <p className="text-sm text-darkBlue">This is the first syllable!</p>
                  <div className="mt-2 text-xs text-darkOrange font-medium">⚠️ -0.5 points penalty</div>
                </div>
              </div>
            </div>
          )}

          {activeHint === 'syllableExplanation' && word.syllableExplanation && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple/10 to-purple/20 rounded-xl p-4 space-y-3">
                <div className="text-2xl">💡</div>
                <h4 className="text-sm font-bold text-darkBlue mb-3">Why We Split This Way:</h4>
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex justify-center gap-1 flex-wrap mb-3">
                    {word.syllables?.map((syllable, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-purple/30 text-purple px-3 py-1 rounded-lg text-sm font-bold"
                      >
                        {syllable}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-darkBlue italic">
                    &ldquo;{word.syllableExplanation}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeHint === 'morphology' && word.morphology && (
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink/10 to-purple/20 rounded-xl p-4 space-y-3">
                <div className="text-2xl">🧬</div>
                <h4 className="text-sm font-bold text-purple mb-3">🔬 Word DNA Analysis:</h4>
                
                {/* Word Building Formula */}
                <div className="flex justify-center items-center gap-1 flex-wrap mb-3">
                  {word.morphology.prefix && (
                    <div className="bg-gradient-to-r from-orange to-lightOrange text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-transform">
                      {word.morphology.prefix}
                    </div>
                  )}
                  {word.morphology.prefix && <span className="text-lg font-bold text-purple animate-pulse">+</span>}
                  <div className="bg-gradient-to-r from-blue to-lightBlue text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-transform">
                    {word.morphology.root}
                  </div>
                  {word.morphology.suffix && <span className="text-lg font-bold text-purple animate-pulse">+</span>}
                  {word.morphology.suffix && (
                    <div className="bg-gradient-to-r from-green to-lightGreen text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md transform hover:scale-105 transition-transform">
                      {word.morphology.suffix}
                    </div>
                  )}
                </div>
                
                {/* Meaning Breakdown */}
                <div className="bg-white/70 rounded-lg p-3 mb-3">
                  <h5 className="text-xs font-bold text-purple mb-2">💡 Meaning Chunks:</h5>
                  <div className="space-y-1 text-xs">
                    {word.morphology.prefix && (
                      <p className='text-darkBlue'><span className="font-bold text-orange">{word.morphology.prefix}</span> = {word.morphology.prefixMeaning}</p>
                    )}
                    <p className='text-darkBlue'><span className="font-bold text-blue">{word.morphology.root}</span> = {word.morphology.rootMeaning}</p>
                    {word.morphology.suffix && (
                      <p className='text-darkBlue'><span className="font-bold text-green">{word.morphology.suffix}</span> = {word.morphology.suffixMeaning}</p>
                    )}
                  </div>
                </div>
                
                {/* Word Family Vocabulary Transfer */}
                <div className="bg-gradient-to-r from-purple/20 to-blue/20 rounded-lg p-3">
                  <h5 className="text-xs font-bold text-purple mb-2">🌟 Word Family Power:</h5>
                  <p className="text-xs text-darkBlue italic">
                    Now you can understand words like: 
                    {word.morphology.prefix && `${word.morphology.prefix}view, ${word.morphology.prefix}phone, `}
                    {word.morphology.root}s, micro{word.morphology.root}
                    {word.morphology.suffix && `, hope${word.morphology.suffix}, care${word.morphology.suffix}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Syllable Display for Syllable Mode */}
      {word.mode === 'syllable' && word.syllables && hintsUsed.includes('syllables') && (
        <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-green/20 to-lightGreen/20 border border-green/30">
          <h4 className="text-xs font-bold text-center mb-2">📝 Syllable Breakdown:</h4>
          <div className="flex justify-center gap-1 flex-wrap">
            {word.syllables.map((syllable, index) => (
              <span 
                key={index}
                className="inline-block bg-green/30 text-green px-2 py-1 rounded text-xs font-medium"
              >
                {syllable}
              </span>
            ))}
          </div>
          {word.syllableExplanation && (
            <p className="text-xs text-center mt-2 text-darkGray">{word.syllableExplanation}</p>
          )}
        </div>
      )}

      {/* Phoneme Display for Phonics Mode */}
      {word.mode === 'phonics' && word.phonemes && hintsUsed.includes('phonemes') && (
        <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-orange/20 to-lightOrange/20 border border-orange/30">
          <h4 className="text-xs font-bold text-center mb-2">🔤 Sound Breakdown:</h4>
          <div className="flex justify-center gap-1 flex-wrap">
            {word.phonemes.map((phoneme, index) => (
              <span 
                key={index}
                className="inline-block bg-orange/30 text-purple px-2 py-1 rounded text-xs font-medium"
              >
                {phoneme}
              </span>
            ))}
          </div>
          {word.soundBars && (
            <div className="flex justify-center mt-2 gap-1">
              {Array.from({ length: word.soundBars }, (_, i) => (
                <div key={i} className="w-3 h-4 bg-orange/40 rounded-sm"></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
