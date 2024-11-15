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
        <header className="bg-sky-100 m-2 md:m-6 p-4 md:p-4 rounded-lg shadow-md">
          <div className="container mx-auto flex flex-row md:flex-row justify-between items-center">
          <div className="relative flex items-center h-20 w-52">
              <Image
                src="/images/izzyLogo.svg"
                alt="Logo"
                width={200} 
                height={40}
                className="mx-auto"
              />
            </div>

            {/* for profile of user */}
            <div className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-orange p-4 md:p-3">
                <Image
                  src="/images/Profile.svg"
                  alt="User avatar"
                  width={36}
                  height={49}
                />
              </div>
              <div className="ml-2 font-bold text-darkBlue text-2xl">Sarah</div>
              <Image src="/images/Dropdown.svg" alt="" width={36} height={49} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="">{children}</main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-sky-100 pb-4 shadow-md md:m-5 mt-4 rounded-lg">
            <div className="flex justify-center">
              <Image
                src="/images/titles/ActhievementsTitle.svg"
                alt="User avatar"
                width={40}
                height={40}
                className="w-72"
              />
            </div>
            <div className="flex flex-wrap justify-around text-center text-gray-600">
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
