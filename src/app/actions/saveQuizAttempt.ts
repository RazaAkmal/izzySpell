'use server';

import prisma from '@/lib/prisma';
import { requireListOwner } from '@/lib/requireSession';

interface QuizStats {
  total: number;
  correct: number;
  incorrect: number;
  grade: number;
  isTimed?: boolean;
  timerType?: string;
  timeAmount?: number;
  expiredWords?: number;
  timeElapsed?: number;
}

interface QuizMistake {
  wordId: number;
  userAnswer: string;
}

// Window in which an identical attempt is treated as a retry of the same save
const DUPLICATE_WINDOW_MS = 30_000;

export const saveQuizAttempt = async (
  listId: number,
  stats: QuizStats,
  mistakes: QuizMistake[]
) => {
  try {
    // Enhanced input validation with detailed logging
    if (!listId) {
      throw new Error('List ID is required');
    }
    
    if (!stats) {
      throw new Error('Quiz stats are required');
    }
    // Convert to correct types
    const spellingListId = Number(listId);
    if (isNaN(spellingListId)) {
      throw new Error('Invalid List ID: Must be a valid number');
    }
    
    // Signed in AND the list belongs to the user
    const userId = await requireListOwner(spellingListId);

    // Prepare data with safe conversions and logging
    const quizData = {
      spellingListId,
      userId,
      totalQuestions: stats.total ?? 0,
      correctAnswers: stats.correct ?? 0,
      incorrectAnswers: stats.incorrect ?? 0,
      grade: typeof stats.grade === 'number' ? stats.grade : Number(stats.grade) || 0,
      isTimed: Boolean(stats.isTimed),
      timerType: stats.timerType ? String(stats.timerType) : 'none',
      timeAmount: stats.timeAmount ? Number(stats.timeAmount) : 0,
      timeElapsed: stats.timeElapsed ? Number(stats.timeElapsed) : 0,
      expiredWords: stats.expiredWords ? Number(stats.expiredWords) : 0
    };

    
    // A retry after a failed save must not create a second attempt. The schema has no
    // idempotency key, so an attempt from the last 30 seconds with exactly the same
    // user, list, score and timer settings is treated as the same attempt.
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        spellingListId,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
        totalQuestions: quizData.totalQuestions,
        correctAnswers: quizData.correctAnswers,
        incorrectAnswers: quizData.incorrectAnswers,
        grade: quizData.grade,
        isTimed: quizData.isTimed,
        timerType: quizData.timerType,
        timeAmount: quizData.timeAmount,
        expiredWords: quizData.expiredWords,
      },
      orderBy: { createdAt: 'desc' },
    });

    const result =
      existingAttempt ??
      (await prisma.quizAttempt.create({
        data: quizData,
      }));

    // Add mistakes if there are any
    const requestedMistakes = Array.isArray(mistakes) ? mistakes : [];
    let mistakesSaved = 0;

    if (requestedMistakes.length > 0) {
      // On a retry, some mistakes may already be saved: only add the missing ones
      const alreadySavedWordIds = new Set<number>();
      if (existingAttempt) {
        const saved = await prisma.quizMistake.findMany({
          where: { quizAttemptId: result.id, userId },
          select: { wordId: true },
        });
        saved.forEach((m) => alreadySavedWordIds.add(m.wordId));
      }

      // Prepare all mistakes with proper validation
      const validMistakes = requestedMistakes
        .filter(m => m && typeof m.wordId !== 'undefined')
        .map(mistake => {
          const wordId = Number(mistake.wordId);
          if (isNaN(wordId)) {
            console.warn(`Invalid wordId in mistake: ${mistake.wordId}`);
            return null;
          }
          
          return {
            quizAttemptId: result.id,
            wordId,
            userAnswer: typeof mistake.userAnswer === 'string' ? mistake.userAnswer : "[TIME EXPIRED]",
            userId
          };
        })
        .filter((m): m is NonNullable<typeof m> => m !== null);

      // Only words from this list can be saved; anything else counts as failed below
      const listWords = await prisma.word.findMany({
        where: { listId: spellingListId, id: { in: validMistakes.map(m => m.wordId) } },
        select: { id: true },
      });
      const listWordIds = new Set(listWords.map(w => w.id));
      const listMistakes = validMistakes.filter(m => listWordIds.has(m.wordId));

      const toCreate = listMistakes.filter(m => !alreadySavedWordIds.has(m.wordId));
      const alreadySavedCount = listMistakes.length - toCreate.length;

      console.log(`Found ${listMistakes.length} valid mistakes to save (${alreadySavedCount} already saved)`);

      // One insert for all the mistakes. A failure must not lose the saved score: it is
      // reported through mistakesFailed, and the quiz summary warns about it.
      let createdCount = 0;
      if (toCreate.length > 0) {
        try {
          const { count } = await prisma.quizMistake.createMany({ data: toCreate });
          createdCount = count;
        } catch (error) {
          console.warn(`${toCreate.length} mistakes failed to save`, error);
        }
      }

      mistakesSaved = alreadySavedCount + createdCount;
    }

    // Anything requested but not saved counts as failed (including invalid entries)
    const mistakesFailed = requestedMistakes.length - mistakesSaved;

    return {
      success: true as const,
      attemptId: result.id,
      mistakesSaved,
      mistakesFailed,
      ...result,
      grade: typeof result.grade?.toNumber === 'function' ? result.grade.toNumber() : result.grade,
    };
  } catch (error) {
    console.error('Failed to save quiz attempt:', error);
    
    if (error instanceof Error) {
      // Get the detailed error message
      console.error('Error details:', error.message, error.stack);
      
      // Check for specific Prisma error types
      if (error.message.includes('prisma')) {
        console.error('This appears to be a Prisma database error');
      }
      
      // Provide a user-friendly error message
      throw new Error(`Failed to save quiz results: ${error.message}`);
    }
    
    throw new Error('Failed to save quiz results. Please try again.');
  }
};
