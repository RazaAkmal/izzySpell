// syllableData.ts
export interface SyllableOption {
    id: number;
    text: string;
    isCorrect: boolean;
  }
  
  export const syllableData: SyllableOption[][] = [
    [
      { id: 1, text: "AP-PLE", isCorrect: true },
      { id: 2, text: "APP-LE", isCorrect: false },
      { id: 3, text: "A-PPLE", isCorrect: false },
      { id: 4, text: "APPL-E", isCorrect: false },
    ],
    [
      { id: 1, text: "OR-ANGE", isCorrect: true },
      { id: 2, text: "ORA-NGE", isCorrect: false },
      { id: 3, text: "O-RANGE", isCorrect: false },
      { id: 4, text: "ORANG-E", isCorrect: false },
    ],
    [
      { id: 1, text: "BAN-ANA", isCorrect: true },
      { id: 2, text: "BA-NANA", isCorrect: false },
      { id: 3, text: "BANA-NA", isCorrect: false },
      { id: 4, text: "BANAN-A", isCorrect: false },
    ],
  ];
  