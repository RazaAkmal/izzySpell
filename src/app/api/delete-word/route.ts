import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import your Prisma instance
import { getSessionUserId } from '@/lib/requireSession';

export async function DELETE(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const wordId = parseInt(searchParams.get("wordId") ?? "", 10);

    if (isNaN(wordId)) {
      return NextResponse.json({ error: 'Word ID is required.' }, { status: 400 });
    }

    // Ownership check BEFORE deleting: the word must belong to a list of the signed-in
    // user. The list id comes from the database, not from the query string.
    const word = await prisma.word.findFirst({
      where: { id: wordId, spellingList: { userId } },
      select: { id: true, listId: true },
    });
    if (!word) {
      return NextResponse.json({ error: 'Word not found.' }, { status: 404 });
    }
    const listId = word.listId;

    // Delete the word from the database
    await prisma.word.delete({
      where: { id: word.id },
    });

    const totalWords = await prisma.word.count({ where: { listId } });
    const studiedWords = await prisma.word.count({
      where: { listId, studied: true },
    });

    // TODO: Progress only reflects Default mode words; multi-mode progress formula to be aligned later.
    // Guard: deleting the last word leaves totalWords = 0 (would divide by zero)
    const progress = totalWords === 0 ? 0 : Math.round((studiedWords / totalWords) * 100);

    // Update the progress of the parent list
    await prisma.spellingList.update({
      where: { id: listId },
      data: {
        progress, shortPaceDuration: null,
        mediumPaceDuration: null,
        generousPaceDuration: null
      },
    });

    return NextResponse.json({ message: 'Word deleted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json(
      { error: 'Failed to delete the word.' },
      { status: 500 }
    );
  }
}
