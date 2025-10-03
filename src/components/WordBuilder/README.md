/**
 * Integration guide for WordBuilderGameNew component
 * 
 * This component provides a comprehensive drag-and-drop Word Builder game
 * with age-aligned modes and challenge features.
 */

// COMPONENT STRUCTURE:
// - WordBuilderGameNew.tsx - Main game component
// - WordBuilder/DragDropProvider.tsx - Drag & drop context
// - WordBuilder/LetterTile.tsx - Draggable letter tiles
// - WordBuilder/DropSlot.tsx - Drop zones for letters
// - WordBuilder/HintSystem.tsx - Comprehensive hint system
// - data/wordBuilderData.ts - Static word database

// USAGE EXAMPLE:
/*
import WordBuilderGameNew from '@/components/WordBuilderGameNew';

// In your page component:
<WordBuilderGameNew
  listId="your-list-id"
  ageGroup="6-8" // '4-6' | '6-8' | '9-11' | '11-13+'
  mode="phonics" // 'picture' | 'phonics' | 'syllable' | 'morphology'
  difficulty="medium" // 'easy' | 'medium' | 'hard'
  challengeMode="normal" // 'normal' | 'timed' | 'limited' | 'hard'
/>
*/

// AGE-ALIGNED MODES:
// 4-6: Picture Builder - Big emojis, simple words, auto-snap
// 6-8: Phonics Builder - Digraphs, phoneme audio, sound bars
// 9-11: Syllable Builder - Multi-syllable words with breakdown
// 11-13+: Morphology Builder - Root words + prefixes/suffixes

// CHALLENGE MODES:
// normal: Standard gameplay
// timed: 30-60s time limits per word
// limited: Solve in N moves only
// hard: Extra decoy tiles added

// ACCESSIBILITY FEATURES:
// - Audio support for all words and phonemes
// - 44px minimum touch targets
// - Color-blind safe design
// - Dyslexia-friendly spacing
// - Clear visual feedback

// DATABASE INTEGRATION:
// The static word database can be moved to your database by:
// 1. Creating a WordBuilderWords table with the WordBuilderWord interface
// 2. Seeding it with data from wordBuilderData.ts
// 3. Updating getRandomWords() to fetch from DB instead

export {};
