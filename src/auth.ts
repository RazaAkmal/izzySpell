/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod";
import prisma from "./lib/prisma";
import { User } from "./lib/defination";
import bcrypt from 'bcryptjs';

async function getUser(name: string): Promise<User | null> {
  try {
    const user = await prisma.user.findFirst({ where: { name: name } });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback:', { token, user });
      if (user) {
        const { password, ...safeUser } = user as any;
        token.id = user.id?.toString();
        token.name = user.name;
        return { ...token, ...safeUser };
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback:', { session, token });
      session.user = token as any;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        name: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ name: z.string(), password: z.string() })
          .safeParse(credentials);

        // logic to salt and hash password
        if (parsedCredentials.success) {
          const { name, password } = parsedCredentials.data;
          const user = await getUser(name);
          if (!user) {
            // No user found, so this is their first attempt to login
            // Optionally, this is also the place you could do a user registration
            throw new Error("Invalid credentials.")
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);
 
          if (passwordsMatch) return user;
          

        }
        return null
      },
    }),
  ],
})