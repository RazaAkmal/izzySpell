import prisma from "@/lib/prisma";

export const getUserDetails = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        firstName: true,
        lastName: true,
        age: true,
        grade: true,
        profileImage: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.log(error);
    throw new Error('Error fetching user data');
  }
};