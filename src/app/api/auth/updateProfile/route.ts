/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

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
  profileImage: string;
};

export async function PUT(req: Request) {
  // Always update the signed-in user; never trust a userId sent by the client
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { data } = await req.json() as { data: UpdateProfile };
  const allCardDetailsProvided =
    data.cardCVC &&
    data.cardName &&
    data.expireMonth &&
    data.expireYear &&
    data.cardNumber;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        grade: data.grade,
        profileUpdated: allCardDetailsProvided ? true : false,
        profileImage: data.profileImage,
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
