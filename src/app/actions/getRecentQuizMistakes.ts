'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const getRecentQuizMistakes = async (spellingListId: number) => {
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
      },
    });

    // Extract quiz attempt IDs
    const quizAttemptIds = recentAttempts.map(attempt => attempt.id);

    // Get all the mistakes from these attempts along with the associated words
    const mistakes = await prisma.quizMistake.findMany({
      where: {
        quizAttemptId: {
          in: quizAttemptIds,
        },
        userId: userId,
      },
      include: {
        word: true,
      },
      distinct: ['wordId'], // Only get unique word mistakes
    });

    // Return the mistakes with relevant word information
    return mistakes.map(mistake => ({
      id: mistake.id,
      wordId: mistake.wordId,
      userAnswer: mistake.userAnswer,
      word: {
        id: mistake.word.id,
        word: mistake.word.word,
      },
    }));
  } catch (error) {
    console.error('Failed to fetch recent quiz mistakes:', error);
    throw new Error('Failed to fetch recent quiz mistakes.');
  }
};
