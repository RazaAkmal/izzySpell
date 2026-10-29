import { headers } from "next/headers";

// Base URL for server-side requests to this app's own routes/files.
// In local dev, use the host the request came in on (e.g. localhost:3000) instead
// of NEXT_PUBLIC_BASE_URL, which points at the live site. Production is unchanged.
export async function getBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    const host = (await headers()).get("host");
    if (host) return `http://${host}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "";
}

// Public site URL for links that leave the app (e.g. password reset emails).
// Comes ONLY from configuration - never from the request's Host/Origin headers,
// which an attacker controls (host-header poisoning would put their domain in a
// real reset email). SITE_URL wins (set it to http://localhost:3000 locally);
// otherwise NEXT_PUBLIC_BASE_URL. Returns null if neither is a valid http(s) URL.
export function getSiteUrl(): string | null {
  const configured = (process.env.SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "").trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}
