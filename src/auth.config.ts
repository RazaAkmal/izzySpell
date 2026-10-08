import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "./lib/prisma";
import bcrypt from 'bcryptjs';
import { User } from "@prisma/client";

// Local dev only: .env carries the production NEXTAUTH_URL (pulled from Vercel),
// which makes every login/logout/middleware redirect jump to the live site.
// Dropping it in development lets Auth.js use the current localhost host/port.
// Production (`next build`/Vercel) is unaffected.
if (process.env.NODE_ENV === "development") {
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
}

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
            throw new Error("Invalid credentials.")
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null
      },
    }),
  ] } satisfies NextAuthConfig