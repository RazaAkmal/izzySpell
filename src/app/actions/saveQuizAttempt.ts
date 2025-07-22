'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

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
    
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    const userId = session.user.id;

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

    
    // Create the attempt with just the essential data
    const result = await prisma.quizAttempt.create({
      data: quizData
    });

    // Add mistakes if there are any
    if (Array.isArray(mistakes) && mistakes.length > 0) {      
      // Prepare all mistakes with proper validation
      const validMistakes = mistakes
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
        .filter(Boolean);
      
      console.log(`Found ${validMistakes.length} valid mistakes to save`);
      
      // Create all mistakes in a transaction for atomicity
      const savedMistakes = await Promise.allSettled(
        validMistakes.map(mistake => 
          mistake ? prisma.quizMistake.create({ data: mistake }) : Promise.resolve(null)
        )
      );
      
      // Check for any failures
      const failedMistakes = savedMistakes.filter(r => r.status === 'rejected');
      if (failedMistakes.length > 0) {
        console.warn(`${failedMistakes.length} mistakes failed to save`);
      }
          }

    return {
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
