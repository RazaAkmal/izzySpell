import { SpellingList, Word } from "@prisma/client";
import { z } from "zod";
export type User = {
  id: string; name: string; password: string; firstName: string | null; lastName: string | null; age: string | null; grade: string | null; profileUpdated: boolean; createdAt: Date; updatedAt: Date;
};

export type SignupFormValues = {
  name: string;
  password: string;
  confirmPassword: string;
};


export type loginFormValues = {
  name: string;
  password: string;
};

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  age: string;
  grade: string;
  profileImage: string;
};
export type CardDetailsFormValues = {
  card_number: number;
  cardName: string;
  expireMonth: string;
  expireYear: number;
  cardCVC: number;
};


export interface SpellingListItem  extends SpellingList {
  id: number;
  listName: string;
  userId: string;
  progress: number;
  color?: string;  
}

export interface SpellingListWithWords extends SpellingListItem {
  words: Word[];
}

export const responseSchema = z.object({
  ListName: z.string(),
  OriginalWords: z.array(z.string()),
  SyllabusWords: z.array(z.object({
    Word: z.string(),
    Options: z.array(z.string()).length(4),
    Answer: z.string()
  })),
  GroupedWords: z.record(z.array(z.string())),
  SightWords: z.array(z.string())
});