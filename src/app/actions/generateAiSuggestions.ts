'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateAndSaveTimeDurations } from '@/lib/timeDurations';

/**
 * Manually generates AI time duration suggestions for an existing spelling list
 * This can be used for lists that were created before this feature was implemented
 */
export const generateAiSuggestionsForList = async (listId: number) => {
  try {
    
    const session = await auth();
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Get the spelling list with user info and words
    console.log('Fetching spelling list with user data...');
    const listWithUser = await prisma.spellingList.findUnique({
      where: { id: listId },
      include: {
        user: {
          select: {
            id: true,
            grade: true,
            age: true,
          }
        },
        words: {
          select: {
            word: true
          }
        }
      }
    });

    if (!listWithUser) {
      throw new Error('Spelling list not found');
    }

    // Check if user owns this list
    if (listWithUser.userId !== session.user.id) {
      throw new Error('Unauthorized access to spelling list');
    }

    // Check if user has grade and age information
    if (!listWithUser.user.grade || !listWithUser.user.age) {
      throw new Error('User grade and age information is required for AI suggestions');
    }

    // Extract just the word strings
    const words = listWithUser.words.map(w => w.word);

    if (words.length === 0) {
      throw new Error('No words found in spelling list');
    }

    console.log('Calling generateAndSaveTimeDurations with:', {
      listId,
      grade: listWithUser.user.grade,
      age: listWithUser.user.age,
      wordCount: words.length
    });

    // Generate and save AI suggestions
    const result = await generateAndSaveTimeDurations(
      listId,
      listWithUser.user.grade,
      listWithUser.user.age,
      words
    );

    return result;
  } catch (error) {
    console.error('Error generating AI suggestions for list:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI suggestions'
    };
  }
};
