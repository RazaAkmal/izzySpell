import { cache } from "react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { maskEmail } from "@/lib/maskEmail";

// Wrapped in React `cache` so repeated calls in the same request (e.g. a page and
// DashboardLayout) share one database query.
//
// The account email is read here but only returned as `hasParentEmail` + a masked
// string (e.g. "m***@example.com"): this result is passed to client components (the
// profile form), so the full address must never be part of it.
//
// On top of that, the result is cached across requests for 60s per user. Anything that
// changes these fields must call revalidateTag(userDetailsTag(userId)) (see updateProfile).
export const userDetailsTag = (userId: string) => `user-details-${userId}`;

const fetchUserDetails = async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        age: true,
        grade: true,
        profileImage: true,
        profileUpdated: true,
        parentEmail: true,
      },
    });
    if (!user) return null;
    const { parentEmail, ...details } = user;
    return {
      ...details,
      hasParentEmail: Boolean(parentEmail),
      parentEmailMasked: parentEmail ? maskEmail(parentEmail) : null,
    };
};

export const getUserDetails = cache(async (userId: string) =>
  unstable_cache(fetchUserDetails, ["user-details", userId], {
    revalidate: 60,
    tags: [userDetailsTag(userId)],
  })(userId)
);

// Start the signed-in user's lookup early so DashboardLayout's query runs in
// parallel with the page's own queries instead of after them.
export const preloadCurrentUserDetails = () => {
  auth()
    .then((session) => (session?.user?.id ? getUserDetails(session.user.id) : null))
    .catch(() => {
      // Errors surface where DashboardLayout awaits the same cached call
    });
};
