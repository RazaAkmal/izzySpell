"use client";
import React, { ReactNode } from "react";
import Image from "next/image";

interface DashboardLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showFooter = true,
}) => {
  return (
    <div className="bg-dashboard-background bg-cover bg-center min-h-screen flex flex-col">
      {/* TopBar */}
      <div className="mx-4 md:mx-8 lg:mx-16">
        <header className="bg-skyBlue m-2 md:m-6 px-8 md:px-4 rounded-2xl shadow-md">
          <div className="container flex flex-row md:flex-row justify-between items-center">
            <div className="relative flex items-center h-20 w-52">
              <Image
                src="/images/izzyLogo.svg"
                alt="Logo"
                width={200}
                height={40}
                className="mx-auto"
              />
            </div>

            {/* Profile of user */}
            <div className="flex flex-row items-center gap-2">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-orange p-1 md:p-2 lg:p-2 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/Profile.svg"
                  alt="User avatar"
                  width={36}
                  height={36}
                  className="w-full h-full  rounded-full"
                />
              </div>
              <div className="ml-2 font-bold text-darkBlue text-lg md:text-2xl">
                Sarah
              </div>
              <Image src="/images/Dropdown.svg" alt="" width={24} height={24} />
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
