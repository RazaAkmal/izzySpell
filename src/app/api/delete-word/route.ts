import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import your Prisma instance

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wordId = searchParams.get("wordId");
    const listID = searchParams.get("listId");
    const listId = parseInt(listID!);

    if (!wordId) {
      return NextResponse.json({ error: 'Word ID is required.' }, { status: 400 });
    }

    // Delete the word from the database
    await prisma.word.delete({
      where: { id: parseInt(wordId) },
    });

    const totalWords = await prisma.word.count({ where: { listId } });
    const studiedWords = await prisma.word.count({
      where: { listId, studied: true },
    });

    const progress = Math.round((studiedWords / totalWords) * 100);

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
