'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const resolvePracticedMistake = async (wordId: number) => {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.quizMistake.deleteMany({
    where: {
      wordId,
      userId: session.user.id,
    },
  });
  // No revalidatePath here — calling it per-word causes Next.js to re-render
  // the server component mid-session and corrupts the progress counter.
  // The page will fetch fresh data naturally on next navigation.
};
