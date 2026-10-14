import { cache } from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Wrapped in React `cache` so repeated calls in the same request (e.g. a page and
// DashboardLayout) share one database query.
export const getUserDetails = cache(async (userId: string) => {
    return await prisma.user.findUnique({
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
      },
    });

});

// Start the signed-in user's lookup early so DashboardLayout's query runs in
// parallel with the page's own queries instead of after them.
export const preloadCurrentUserDetails = () => {
  auth()
    .then((session) => (session?.user?.id ? getUserDetails(session.user.id) : null))
    .catch(() => {
      // Errors surface where DashboardLayout awaits the same cached call
    });
};
