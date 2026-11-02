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
    // Every unresolved mistake for this user and list, from any quiz attempt.
    // A mistake row is deleted by resolvePracticedMistake once practised, so the rows
    // that still exist are exactly the unresolved ones.
    const mistakes = await prisma.quizMistake.findMany({
      where: {
        userId: userId,
        quizAttempt: { userId: userId, spellingListId: spellingListId },
      },
      include: {
        word: true,
      },
      // Newest attempt first, so distinct keeps the most recent wrong answer per word
      orderBy: { quizAttempt: { createdAt: 'desc' } },
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
