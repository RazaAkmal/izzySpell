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
