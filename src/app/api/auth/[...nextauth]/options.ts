// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcrypt"
// import prisma from "@/lib/prisma";


// const authOptions: NextAuthOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id.toString();
//         token.name = user.name;
//       }
//       return { ...token, ...user };
//     },
//     async session({ session, token }) {
//       session.user = token as any;
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/sign-in",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   providers: [
//     CredentialsProvider({
//       async authorize(credentials) {
//         // Add logic here to look up the user from the credentials supplied
//         try {
//           const user = await prisma.user.findUnique({
//             where: {
//               name: credentials?.username,
//             },
//           });
//           console.log(user, 'user')
//           if (!user) {
//             throw new Error('No user found with the provided username')
//           }
//           const isPasswordCorrect = await bcrypt.compare(credentials?.password || "", user.password)
//           if (!isPasswordCorrect) {
//             throw new Error('Incorrect password')
//           }          
//           return user;
//         } catch (error) {
//           console.error('Failed to fetch user:', error);
//           throw new Error('Failed to fetch user.');
//         }
//       },
//       credentials: {
//         username: { label: "Username", type: "text", placeholder: "jsmith" },
//         password: { label: "Password", type: "password" }
//       },
//     })
//   ]
// }

// export default authOptions;