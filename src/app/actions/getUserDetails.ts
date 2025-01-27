import prisma from "@/lib/prisma";

export const getUserDetails = async (userId: string) => {
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

};