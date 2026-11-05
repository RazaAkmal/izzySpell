import type { NextAuthConfig } from "next-auth"

// Config for the middleware, which runs on every matched request and only needs to
// verify the session cookie. Signing in happens through auth.config.ts (used by auth.ts),
// so the login provider and everything it imports stay out of the middleware bundle.

// Local dev only, same as auth.config.ts: .env carries the production NEXTAUTH_URL
// (pulled from Vercel), which makes every middleware redirect jump to the live site.
// Production (`next build`/Vercel) is unaffected.
if (process.env.NODE_ENV === "development") {
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
}

export default { providers: [] } satisfies NextAuthConfig
