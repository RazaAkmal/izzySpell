// Word Builder Game Data
export interface WordBuilderWord {
  id: number;
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageGroup: '4-6' | '6-8' | '9-11' | '11-13+';
  mode: 'picture' | 'phonics' | 'syllable' | 'morphology';
  
  // Picture Builder (Ages 4-6)
  image?: string;
  imageAlt?: string;
  shadowOutline?: string;
  
  // Phonics Builder (Ages 6-8)
  phonemes?: string[];
  phonemeAudio?: string[];
  soundBars?: number;
  sentence?: string;
  
  // Syllable Builder (Ages 9-11)
  syllables?: string[];
  syllableExplanation?: string;
  syllableType?: 'open' | 'closed' | 'silent-e' | 'r-controlled' | 'vowel-team';
  
  // Morphology Builder (Ages 11-13+)
  morphology?: {
    root: string;
    prefix?: string;
    suffix?: string;
    rootMeaning: string;
    prefixMeaning?: string;
    suffixMeaning?: string;
  };
  
  // Common properties
  definition: string;
  exampleSentence: string;
  hints: string[];
  audio: string;
  category: string;
  
  // Challenge modes
  timeLimit?: number; // seconds for timed mode
  maxMoves?: number; // for limited moves mode
  decoyTiles?: string[]; // extra wrong letters for hard mode
}

export const wordBuilderDatabase: WordBuilderWord[] = [
  // Picture Builder (Ages 4-6) - Simple 3-4 letter words
  {
    id: 1,
    word: "CAT",
    difficulty: 'easy',
    ageGroup: '4-6',
    mode: 'picture',
    image: "🐱",
    imageAlt: "A cute cat",
    shadowOutline: "C_A_T",
    definition: "A small furry animal that says meow",
    exampleSentence: "The cat is sleeping on the mat.",
    hints: ["It's a pet that meows", "Rhymes with hat", "Has whiskers"],
    audio: "/audio/cat.mp3",
    category: "animals",
    timeLimit: 60,
    maxMoves: 5,
    decoyTiles: ["D", "B", "R"]
  },
  {
    id: 2,
    word: "DOG",
    difficulty: 'easy',
    ageGroup: '4-6',
    mode: 'picture',
    image: "🐶",
    imageAlt: "A friendly dog",
    shadowOutline: "D_O_G",
    definition: "A loyal animal that barks and wags its tail",
    exampleSentence: "The dog runs in the park.",
    hints: ["It's a pet that barks", "Man's best friend", "Has a tail"],
    audio: "/audio/dog.mp3",
    category: "animals",
    timeLimit: 60,
    maxMoves: 5,
    decoyTiles: ["C", "F", "L"]
  },
  {
    id: 3,
    word: "SUN",
    difficulty: 'easy',
    ageGroup: '4-6',
    mode: 'picture',
    image: "☀️",
    imageAlt: "The bright sun",
    shadowOutline: "S_U_N",
    definition: "The bright star that gives us light and warmth",
    exampleSentence: "The sun is shining brightly today.",
    hints: ["It's bright and hot", "Shines in the sky", "Gives us warmth"],
    audio: "/audio/sun.mp3",
    category: "nature",
    timeLimit: 60,
    maxMoves: 5,
    decoyTiles: ["M", "T", "P"]
  },
  {
    id: 4,
    word: "TREE",
    difficulty: 'easy',
    ageGroup: '4-6',
    mode: 'picture',
    image: "🌳",
    imageAlt: "A green tree",
    shadowOutline: "T_R_E_E",
    definition: "A tall plant with leaves and branches",
    exampleSentence: "The bird sits on the tree.",
    hints: ["It's tall and green", "Birds sit on it", "Has leaves"],
    audio: "/audio/tree.mp3",
    category: "nature",
    timeLimit: 90,
    maxMoves: 6,
    decoyTiles: ["S", "L", "M"]
  },

  // Phonics Builder (Ages 6-8) - Words with digraphs and phonemes
  {
    id: 5,
    word: "SHIP",
    difficulty: 'medium',
    ageGroup: '6-8',
    mode: 'phonics',
    phonemes: ["SH", "I", "P"],
    phonemeAudio: ["/audio/sh.mp3", "/audio/i.mp3", "/audio/p.mp3"],
    soundBars: 3,
    sentence: "The ship sails on the ocean.",
    definition: "A large boat that travels on water",
    exampleSentence: "The ship carries people across the sea.",
    hints: ["It has the 'sh' sound", "It floats on water", "Larger than a boat"],
    audio: "/audio/ship.mp3",
    category: "transportation",
    timeLimit: 120,
    maxMoves: 6,
    decoyTiles: ["C", "T", "K", "B"]
  },
  {
    id: 6,
    word: "NIGHT",
    difficulty: 'medium',
    ageGroup: '6-8',
    mode: 'phonics',
    phonemes: ["N", "IGH", "T"],
    phonemeAudio: ["/audio/n.mp3", "/audio/igh.mp3", "/audio/t.mp3"],
    soundBars: 3,
    sentence: "The stars shine at night.",
    definition: "The time when it's dark and we sleep",
    exampleSentence: "I sleep at night and wake up in the morning.",
    hints: ["It has the 'igh' sound like light", "When it's dark", "Time for sleeping"],
    audio: "/audio/night.mp3",
    category: "time",
    timeLimit: 120,
    maxMoves: 7,
    decoyTiles: ["M", "S", "L", "F"]
  },
  {
    id: 7,
    word: "CHAIR",
    difficulty: 'medium',
    ageGroup: '6-8',
    mode: 'phonics',
    phonemes: ["CH", "AI", "R"],
    phonemeAudio: ["/audio/ch.mp3", "/audio/ai.mp3", "/audio/r.mp3"],
    soundBars: 3,
    sentence: "I sit on the chair.",
    definition: "A piece of furniture you sit on",
    exampleSentence: "The wooden chair is very comfortable.",
    hints: ["It has the 'ch' sound", "You sit on it", "Has four legs"],
    audio: "/audio/chair.mp3",
    category: "furniture",
    timeLimit: 120,
    maxMoves: 7,
    decoyTiles: ["T", "B", "K", "S"]
  },

  // Syllable Builder (Ages 9-11) - Multi-syllable words
  {
    id: 8,
    word: "BASKETBALL",
    difficulty: 'medium',
    ageGroup: '9-11',
    mode: 'syllable',
    syllables: ["BAS", "KET", "BALL"],
    syllableExplanation: "This word has 3 syllables: BAS-KET-BALL",
    syllableType: 'closed',
    definition: "A sport played with a ball and hoops",
    exampleSentence: "We play basketball in the gym.",
    hints: ["A sport with hoops", "You bounce the ball", "Played on a court"],
    audio: "/audio/basketball.mp3",
    category: "sports",
    timeLimit: 180,
    maxMoves: 8,
    decoyTiles: ["F", "M", "P", "R", "W"]
  },
  {
    id: 9,
    word: "ELEPHANT",
    difficulty: 'medium',
    ageGroup: '9-11',
    mode: 'syllable',
    syllables: ["EL", "E", "PHANT"],
    syllableExplanation: "This word has 3 syllables: EL-E-PHANT",
    syllableType: 'open',
    definition: "A large gray animal with a long trunk",
    exampleSentence: "The elephant sprays water with its trunk.",
    hints: ["Largest land animal", "Has a long trunk", "Found in Africa and Asia"],
    audio: "/audio/elephant.mp3",
    category: "animals",
    timeLimit: 180,
    maxMoves: 9,
    decoyTiles: ["S", "R", "M", "B", "K"]
  },
  {
    id: 10,
    word: "COMPUTER",
    difficulty: 'hard',
    ageGroup: '9-11',
    mode: 'syllable',
    syllables: ["COM", "PU", "TER"],
    syllableExplanation: "This word has 3 syllables: COM-PU-TER",
    syllableType: 'r-controlled',
    definition: "An electronic device used for work and games",
    exampleSentence: "I use the computer to do my homework.",
    hints: ["Electronic device", "Has a screen and keyboard", "Used for typing"],
    audio: "/audio/computer.mp3",
    category: "technology",
    timeLimit: 180,
    maxMoves: 9,
    decoyTiles: ["B", "F", "S", "L", "W"]
  },

  // Morphology Builder (Ages 11-13+) - Root words with prefixes/suffixes
  {
    id: 11,
    word: "TELESCOPE",
    difficulty: 'hard',
    ageGroup: '11-13+',
    mode: 'morphology',
    morphology: {
      root: "SCOPE",
      prefix: "TELE",
      rootMeaning: "to see or watch",
      prefixMeaning: "far or distant"
    },
    definition: "An instrument used to see distant objects like stars",
    exampleSentence: "The astronomer uses a telescope to study the stars.",
    hints: ["Used to see far away", "Combines 'far' + 'see'", "Used in astronomy"],
    audio: "/audio/telescope.mp3",
    category: "science",
    timeLimit: 10,
    maxMoves: 10,
    decoyTiles: ["M", "R", "N", "B", "F", "K"]
  },
  {
    id: 12,
    word: "WONDERFUL",
    difficulty: 'hard',
    ageGroup: '11-13+',
    mode: 'morphology',
    morphology: {
      root: "WONDER",
      suffix: "FUL",
      rootMeaning: "to think about with curiosity",
      suffixMeaning: "full of"
    },
    definition: "Full of wonder; amazing or excellent",
    exampleSentence: "The sunset was wonderful to watch.",
    hints: ["Full of wonder", "Means amazing", "Ends with 'ful'"],
    audio: "/audio/wonderful.mp3",
    category: "emotions",
    timeLimit: 240,
    maxMoves: 10,
    decoyTiles: ["S", "T", "M", "P", "B", "K"]
  },
  {
    id: 13,
    word: "PREHISTORIC",
    difficulty: 'hard',
    ageGroup: '11-13+',
    mode: 'morphology',
    morphology: {
      root: "HISTORIC",
      prefix: "PRE",
      rootMeaning: "relating to history",
      prefixMeaning: "before"
    },
    definition: "Existing before recorded history",
    exampleSentence: "Dinosaurs lived in prehistoric times.",
    hints: ["Before history", "Like dinosaur times", "Starts with 'pre'"],
    audio: "/audio/prehistoric.mp3",
    category: "history",
    timeLimit: 300,
    maxMoves: 12,
    decoyTiles: ["M", "S", "F", "L", "B", "K", "W"]
  },

  // Additional words for variety
  {
    id: 14,
    word: "FISH",
    difficulty: 'easy',
    ageGroup: '4-6',
    mode: 'picture',
    image: "🐟",
    imageAlt: "A colorful fish",
    shadowOutline: "F_I_S_H",
    definition: "An animal that lives in water and has fins",
    exampleSentence: "The fish swims in the pond.",
    hints: ["Lives in water", "Has fins", "Can swim"],
    audio: "/audio/fish.mp3",
    category: "animals",
    timeLimit: 90,
    maxMoves: 6,
    decoyTiles: ["T", "P", "M"]
  },
  {
    id: 15,
    word: "RAINBOW",
    difficulty: 'medium',
    ageGroup: '6-8',
    mode: 'phonics',
    phonemes: ["R", "AI", "N", "B", "OW"],
    phonemeAudio: ["/audio/r.mp3", "/audio/ai.mp3", "/audio/n.mp3", "/audio/b.mp3", "/audio/ow.mp3"],
    soundBars: 5,
    sentence: "A rainbow appears after the rain.",
    definition: "Colorful arc in the sky after rain",
    exampleSentence: "The rainbow has seven beautiful colors.",
    hints: ["Appears after rain", "Has many colors", "Arc in the sky"],
    audio: "/audio/rainbow.mp3",
    category: "nature",
    timeLimit: 150,
    maxMoves: 8,
    decoyTiles: ["T", "S", "L", "M", "K"]
  }
];

// Helper functions to filter words by criteria
export const getWordsByAgeGroup = (ageGroup: '4-6' | '6-8' | '9-11' | '11-13+') => {
  return wordBuilderDatabase.filter(word => word.ageGroup === ageGroup);
};

export const getWordsByMode = (mode: 'picture' | 'phonics' | 'syllable' | 'morphology') => {
  return wordBuilderDatabase.filter(word => word.mode === mode);
};

export const getWordsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return wordBuilderDatabase.filter(word => word.difficulty === difficulty);
};

export const getWordsByCategory = (category: string) => {
  return wordBuilderDatabase.filter(word => word.category === category);
};