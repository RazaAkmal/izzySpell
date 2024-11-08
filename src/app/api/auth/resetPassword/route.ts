import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { name, password } = await req.json();

    // Validate the request body
    if (!name || !password) {
      return new Response(JSON.stringify({ error: 'Name and newPassword are required' }), { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: { name },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Update the user's password
    await prisma.user.update({
      where: { name },
      data: { password: hashedPassword },
    });

    return new Response(JSON.stringify({ message: 'Password reset successful' }), { status: 200 });
  } catch (error) {
    console.error('Error resetting password:', error); // Log the error
    return new Response(JSON.stringify({ error: 'Failed to reset password' }), { status: 500 });
  }
}
