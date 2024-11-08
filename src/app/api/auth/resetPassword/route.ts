/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { name, newPassword } = await req.json();

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { name },
      data: { password: hashedPassword },
    });

    return new Response(JSON.stringify({ message: 'Password reset successful' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to reset password' }), { status: 500 });
  }
}
