'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface QuizStats {
  total: number;
  correct: number;
  incorrect: number;
  grade: number;
}

interface QuizMistake {
  wordId: number;
  userAnswer: string;
}

export const saveQuizAttempt = async (
  listId: number,
  stats: QuizStats,
  mistakes: QuizMistake[]
) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  const userId = session.user.id;

  try {
    await prisma.quizAttempt.create({
      data: {
        spellingListId: listId,
        userId: userId,
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        incorrectAnswers: stats.incorrect,
        grade: stats.grade,
        mistakes: {
          create: mistakes.map(mistake => ({
            wordId: mistake.wordId,
            userAnswer: mistake.userAnswer,
            userId: userId,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Failed to save quiz attempt:', error);
    throw new Error('Failed to save quiz attempt.');
  }
};
