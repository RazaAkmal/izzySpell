
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function POST(req: Request) {
  let name: unknown;
  let password: unknown;
  try {
    ({ name, password } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request. Please try again.' }), { status: 400 });
  }

  if (typeof name !== 'string' || typeof password !== 'string' || !name.trim() || !password) {
    return new Response(JSON.stringify({ error: 'Username and password are required' }), { status: 400 });
  }

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

    console.error('Error during signup:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong on our side while creating your account. Please try again in a moment.' }),
      { status: 500 }
    );
  }
}
