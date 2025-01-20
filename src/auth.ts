/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
import authConfig from "./auth.config"

function filterSensitiveInfo(user: any) {
  const { cardNumber, cardName, expireMonth, expireYear, cardCVC, ...filteredUser } = user;
  return filteredUser;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const filteredUser = filterSensitiveInfo(user);
        token = { ...token, ...filteredUser };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  ...authConfig,
})