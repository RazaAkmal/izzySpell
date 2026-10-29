import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import { User } from "@prisma/client";
import { findUserByName } from "./lib/findUserByName";
import { toSessionUser } from "./lib/sessionUser";

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
     // Exact match first, then case-insensitive ("Raza" finds "raza")
     return await findUserByName(name);
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
          // Unknown username: same result as a wrong password
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          // Only whitelisted fields leave this function - never the full row
          if (passwordsMatch) return toSessionUser(user);
        }
        return null
      },
    }),
  ] } satisfies NextAuthConfig