/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/prisma';

type UpdateProfile = {
  firstName: string;
  lastName: string;
  age: string;
  grade: string;
  cardName: string;
  cardCVC: number;
  cardNumber: number;
  expireMonth: string;
  expireYear: number;
};

export async function PUT(req: Request) {
  const { data, userId } = await req.json() as { data: UpdateProfile; userId: string };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        grade: data.grade,
        profileUpdated: true,
        cardCVC: String(data.cardCVC),
        cardName: data.cardName,
        expireMonth: data.expireMonth,
        expireYear: String(data.expireYear),
        cardNumber: String(data.cardNumber)
      },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), { status: 500 });
  }
}
