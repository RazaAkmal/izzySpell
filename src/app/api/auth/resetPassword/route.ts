import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Same response whether or not the username exists, so this endpoint
// can't be used to discover which usernames are registered.
const RESET_RESPONSE_MESSAGE =
  'If an account with that username exists, its password has been reset.';

export async function POST(req: Request) {
  try {
    const { name, password } = await req.json();

    // Validate the request body
    if (!name || !password) {
      return new Response(JSON.stringify({ error: 'Name and newPassword are required' }), { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password if the account exists
    await prisma.user.updateMany({
      where: { name },
      data: { password: hashedPassword },
    });

    return new Response(JSON.stringify({ message: RESET_RESPONSE_MESSAGE }), { status: 200 });
  } catch (error) {
    console.error('Error resetting password:', error); // Log the error
    return new Response(JSON.stringify({ error: 'Failed to reset password' }), { status: 500 });
  }
}
