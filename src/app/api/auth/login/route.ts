import prisma from '@/lib/prisma'; // Adjust the import path as needed
import bcrypt from 'bcrypt';

export async function POST(req: Request) {

  const { name, password } = await req.json();

  if (!name || !password) {
    return new Response(JSON.stringify({ message: 'Name and password are required' }), { status: 400 });
  }

  try {
    // Find user by name
    const user = await prisma.user.findUnique({ where: { name } });

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 })
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 })
    }

    // If the login is successful, return user data (exclude sensitive info like password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return new Response(JSON.stringify(userWithoutPassword), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })
  }
}
