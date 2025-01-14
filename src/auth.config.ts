import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
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
export default { providers: [
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
  ] } satisfies NextAuthConfig