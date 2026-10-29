import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { toSessionUser } from "./lib/sessionUser"
import { isSessionRevoked } from "./lib/sessionChecks"

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // The token is rebuilt from a whitelist on EVERY call (not just at sign-in), so
    // tokens issued before this change - which contained the whole user row,
    // including the password hash - are cleaned the next time they are read.
    async jwt({ token, user }) {
      const source = user ?? token;
      const sessionUser = toSessionUser(source);

      // `sat` = when this session signed in (epoch seconds). Set ONLY at sign-in;
      // token.iat is not used because Auth.js re-issues it whenever the cookie is
      // refreshed. Tokens issued before `sat` existed get 0 ("unknown"), so they end
      // if the user's password was changed at any point (users who never changed
      // their password are unaffected).
      const sat = user
        ? Math.floor(Date.now() / 1000)
        : typeof token.sat === "number" ? token.sat : 0;

      // End the session if the password changed after it signed in, or the user is
      // gone. At most one DB read per session every 5 minutes; fails open.
      if (!user && sessionUser.id && (await isSessionRevoked(sessionUser.id, sat))) {
        return null;
      }

      return {
        // Standard claims Auth.js uses to manage the token
        sub: token.sub,
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
        ...sessionUser,
        sat,
      };
    },
    // Whitelisted again here so `session.user` can only ever contain id and name
    async session({ session, token }) {
      session.user = toSessionUser(token) as typeof session.user;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  ...authConfig,
})
