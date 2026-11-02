'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type RecentAttemptRow = {
  id: number;
  grade: Prisma.Decimal | null;
  createdAt: Date;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  uniqueMistakesCount: number;
};

export const getRecentQuizAttempts = async (spellingListId: number) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  const userId = session.user.id;

  try {
    // The most recent 10 quiz attempts (for the history list) plus the number of unique
    // unresolved mistaken words across ALL attempts of this list, in a single round trip.
    const rows = await prisma.$queryRaw<RecentAttemptRow[]>`
      WITH recent AS (
        SELECT id, grade, "createdAt", "totalQuestions", "correctAnswers", "incorrectAnswers"
        FROM quiz_attempts
        WHERE "userId" = ${userId} AND "spellingListId" = ${spellingListId}
        ORDER BY "createdAt" DESC
        LIMIT 10
      )
      SELECT recent.*,
        (
          SELECT COUNT(DISTINCT m."wordId")
          FROM quiz_mistakes m
          JOIN quiz_attempts a ON a.id = m."quizAttemptId"
          WHERE m."userId" = ${userId}
            AND a."userId" = ${userId}
            AND a."spellingListId" = ${spellingListId}
        )::int AS "uniqueMistakesCount"
      FROM recent
      ORDER BY recent."createdAt" DESC
    `;

    // Convert Decimal to number to make it serializable for client components
    return {
      attempts: rows.map((row) => ({
        id: row.id,
        grade: row.grade ? Number(row.grade) : 0,
        createdAt: row.createdAt,
        totalQuestions: row.totalQuestions,
        correctAnswers: row.correctAnswers,
        incorrectAnswers: row.incorrectAnswers,
      })),
      uniqueMistakesCount: rows[0]?.uniqueMistakesCount ?? 0,
    };
  } catch (error) {
    console.error('Failed to fetch recent quiz attempts:', error);
    throw new Error('Failed to fetch recent quiz attempts.');
  }
};
