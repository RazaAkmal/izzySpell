// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
//   console.log(token, 'token from middleware',  process.env.NEXTAUTH_SECRET )
//   console.log(request.headers.get('cookie'), 'cookie');

//   const url = request.nextUrl;
//   // If the user has a valid token and tries to access the login/signup, redirect to dashboard
//   if (token && !token.profileUpdated && ['/dashboard', '/lists', '/'].some(path => url.pathname.startsWith(path))) {
//     return NextResponse.redirect(new URL(`/profile/${token.id}`, request.url));
//   }
//   if (token && (url.pathname === '/' || url.pathname === '/sign-in' || url.pathname === '/signup' || url.pathname === '/forgot-password')) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // If the user does NOT have a valid token and tries to access protected routes, redirect to sign-in
//   if (!token && ['/dashboard', '/profile', '/lists'].some(path => url.pathname.startsWith(path))) {
//     return NextResponse.redirect(new URL('/sign-in', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/login', '/sign-in', '/forgot-password', '/profile/:path*', '/signup', '/lists/:path*', '/dashboard/:path*'],
// };
import NextAuth from "next-auth"
import authConfig from "./auth.config"
 
// Use only one of the two middleware options below
// 1. Use middleware directly
// export const { auth: middleware } = NextAuth(authConfig)
 
// 2. Wrapped middleware option
const { auth } = NextAuth(authConfig)
export default auth(async (req) => {
  console.log(req.auth)
  const token = req.auth
  console.log(token, 'token from middleware',  process.env.NEXTAUTH_SECRET )

  const url = req.nextUrl;
  // If the user has a valid token and tries to access the login/signup, redirect to dashboard
  const isApiRoute = req.nextUrl.pathname.includes('/api');
  if (isApiRoute) {
    return
  }
  if (token && (url.pathname === '/' || url.pathname === '/sign-in' || url.pathname === '/signup' || url.pathname === '/forgot-password')) {
    return Response.redirect(new URL('/dashboard', req.url));
  }

  // If the user does NOT have a valid token and tries to access protected routes, redirect to sign-in
  if (!token && ['/dashboard', '/profile', '/lists'].some(path => url.pathname.startsWith(path))) {
    return Response.redirect(new URL('/sign-in', req.url));
  }

  // return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/sign-in`);
})
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/login', '/sign-in', '/forgot-password', '/profile/:path*', '/signup', '/lists/:path*', '/dashboard/:path*'],
};