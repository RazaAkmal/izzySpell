import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig)
export default auth(async (req) => {
  const token = req.auth;
  const url = req.nextUrl;
  const isApiRoute = req.nextUrl.pathname.includes("/api");

  if (isApiRoute) {
    return;
  }

  if (
    token &&
    (url.pathname === "/" ||
      url.pathname === "/sign-in" ||
      url.pathname === "/signup" ||
      url.pathname === "/forgot-password")
  ) {
    // Use NextResponse.redirect for proper URL updates
    return NextResponse.redirect(new URL("/dashboard", req.url)); 
  }

  if (
    !token &&
    ["/dashboard", "/profile", "/lists", "/spellPractice"].some((path) =>
      url.pathname.startsWith(path)
    )
  ) {
    // Use NextResponse.redirect for proper URL updates
    return NextResponse.redirect(new URL("/sign-in", req.url)); 
  }

  return NextResponse.next();
});
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/login', '/', '/sign-in', '/forgot-password', '/profile/:path*', '/signup', '/lists/:path*', '/dashboard/:path*', '/spellPractice/:path*'],
};