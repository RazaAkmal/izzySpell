
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function POST(req: Request) {
  const { name, password } = await req.json();
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
      },
    });

    return new Response(JSON.stringify(user), { status: 201 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'User with this name already exists' }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: 'An error occurred during signup' }), { status: 500 });
  }
}
