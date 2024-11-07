'use server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type UpdateProfile = {
  firstName: string
  lastName: string
  age: string
  grade: string
}

export async function signupUser(name: string, password: string) {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with Prisma
    const user = await prisma.user.create({
      data: {
        name, // Pass name as received from form
        password: hashedPassword, // Store the hashed password
      },
    });

    return user;
  } catch (error) {
    // Check for unique constraint error
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('User with this name already exists');
    }

    // Throw any other errors
    throw new Error('An error occurred during signup');
  }
}

export async function updateProfile(data: UpdateProfile, userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      grade: data.grade,
      profileUpdated: true, // Mark the profile as updated
    },
  });
}

export async function loginUser(name: string, password: string) {
  const user = await prisma.user.findUnique({ where: { name } });

  if (!user) throw new Error('User not found');
  // Compare password here, for example using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw new Error('Invalid credentials');

  return user;
}
export async function resetPassword(name: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { name },
    data: { password: hashedPassword },
  });
  return { message: 'Password reset successful' };
}