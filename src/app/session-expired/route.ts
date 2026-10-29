import { NextResponse, type NextRequest } from "next/server";

// Ends a session the server no longer accepts (e.g. password changed elsewhere)
// and sends the user to the sign-in page.
//
// Why this exists: middleware only decodes the session cookie (no database), so a
// revoked-but-unexpired cookie still looks "logged in" there, and middleware would
// bounce /sign-in back to /dashboard while the page itself sees no session - a
// redirect loop. Pages redirect here instead; this handler deletes the session
// cookies first. It is deliberately NOT in the middleware matcher.

const SESSION_COOKIE = /^(__Secure-)?authjs\.session-token(\.\d+)?$/;
const BASE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/sign-in", request.url));

  // Both the plain (http) and __Secure- (https) names, plus chunked variants (.0, .1, ...)
  const names = new Set(BASE_NAMES);
  for (const cookie of request.cookies.getAll()) {
    if (SESSION_COOKIE.test(cookie.name)) names.add(cookie.name);
  }
  for (const name of names) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      // Browsers only accept __Secure- cookies (including deletions) with Secure
      secure: name.startsWith("__Secure-"),
    });
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}
