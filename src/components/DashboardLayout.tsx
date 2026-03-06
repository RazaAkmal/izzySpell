"use server";
import React, { ReactNode } from "react";
import Image from "next/image";
import { auth } from "@/auth";
import { Session } from "next-auth";
import UserMenu from "./UserMenu";
import Link from "next/link";
import { User } from "@prisma/client";
import { getUserDetails } from "@/app/actions/getUserDetails";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = async ({
  children,
  showFooter = true,
}) => {
  const session = (await auth()) as Session | null;
  const user = session?.user as User;
  const userData = user?.id ? await getUserDetails(user.id) : undefined;
  if (userData?.id && userData?.profileUpdated === false) {
    redirect(`/profile/${userData?.id}`);
  }
  return (
    <div className="bg-dashboard-background bg-cover bg-center min-h-screen flex flex-col">
      {/* TopBar */}
      <div className="mx-4 md:mx-8 lg:mx-16">
        <header className="bg-skyBlue m-2 md:m-6 px-4 md:px-6 rounded-2xl shadow-md">
          <div className="flex flex-row justify-between items-center h-16 md:h-20">
            <Link href="/dashboard">
              <div className="relative flex items-center h-full w-32 md:w-48 overflow-hidden">
                <Image
                  src="/images/izzyLogo.svg"
                  alt="Logo"
                  width={200}
                  height={40}
                  className="mx-auto hover-scale !shadow-none"
                />
              </div>
            </Link>

            {/* Profile of user */}
            <div className="flex flex-row items-center gap-2 md:gap-3 flex-shrink-0">
              <div
                className={`${
                  !userData?.profileImage ? "bg-orange" : ""
                } w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0`}
              >
                <Image
                  src={userData?.profileImage || "/images/Profile.svg"}
                  alt="User avatar"
                  width={56}
                  height={56}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="font-bold text-darkBlue text-sm md:text-xl hidden sm:block truncate max-w-[100px] md:max-w-none">
                {user?.name}
              </div>
              <UserMenu userId={user?.id} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-skyBlue pb-4 shadow-md m-2 md:m-5 mt-4 rounded-2xl">
            <div className="flex justify-center">
              <Image
                src="/images/titles/ActhievementsTitle.svg"
                alt="Achievements title"
                width={40}
                height={40}
                className="w-72"
              />
            </div>
            <div className="flex flex-wrap justify-around text-center  text-gray-600">
              {[...Array(7)].map((_, index) => (
                <Image
                  key={index}
                  src="/images/Rectangle.svg"
                  alt="User avatar"
                  width={40}
                  height={20}
                  className="w-10 sm:w-12 md:w-14"
                />
              ))}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
