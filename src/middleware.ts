import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const url = request.nextUrl;
  console.log(token)
  // If the user has a valid token and tries to access the login/signup, redirect to dashboard
  if (token && !token.profileUpdated && ['/dashboard', '/lists'].some(path => url.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL(`/profile/${token.id}`, request.url), 307);
  }
  if (token && (url.pathname === '/sign-in' || url.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url), 307);
  }

  // If the user does NOT have a valid token and tries to access protected routes, redirect to sign-in
  if (!token && ['/dashboard', '/profile', '/lists'].some(path => url.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/sign-in', '/profile/:path*', '/signup', '/lists/:path*', '/dashboard/:path*'],
};
