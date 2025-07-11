'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const getRecentQuizAttempts = async (spellingListId: number) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  const userId = session.user.id;

  try {
    // Get the most recent 3 quiz attempts
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: userId,
        spellingListId: spellingListId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
      select: {
        id: true,
        grade: true,
        createdAt: true,
        totalQuestions: true,
        correctAnswers: true,
        incorrectAnswers: true,
      },
    });
    
    // Get IDs of the recent attempts
    const attemptIds = recentAttempts.map(attempt => attempt.id);
    
    // Get unique mistake words count
    const uniqueMistakes = await prisma.quizMistake.findMany({
      where: {
        quizAttemptId: {
          in: attemptIds,
        },
        userId: userId,
      },
      distinct: ['wordId'],
      select: {
        wordId: true,
      },
    });
    
    // Convert Decimal to number to make it serializable for client components
    return {
      attempts: recentAttempts.map(attempt => ({
        ...attempt,
        grade: attempt.grade ? Number(attempt.grade) : 0,
      })),
      uniqueMistakesCount: uniqueMistakes.length
    };
  } catch (error) {
    console.error('Failed to fetch recent quiz attempts:', error);
    throw new Error('Failed to fetch recent quiz attempts.');
  }
};
