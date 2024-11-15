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
    <div className="bg-blue min-h-screen flex flex-col">
      {/* TopBar */}
      <div className="mx-4 md:mx-8 lg:mx-16">
        <header className="bg-skyBlue m-2 md:m-8 opacity-70 p-6 md:p-4 rounded-lg shadow-md">
          <div className="container mx-auto flex flex-row md:flex-row justify-between items-center">
            <div className="flex items-center  ">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue"></div>
              <div className="text-lg md:text-xl font-bold text-black ml-5 md:ml-7">
                IzzySpell
              </div>
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
              <div className="ml-2 font-medium text-sm md:text-base">Sarah</div>
              <Image
                  src="/images/Dropdown.svg"
                  alt=""
                  width={36}
                  height={49}
                />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="">
          {children}
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-skyBlue opacity-60 p-4 shadow-md md:m-5 mt-4 rounded-lg">
            <p className="text-center text-purple font-bold text-2xl">
              Your Achievement
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-10 lg:gap-20 text-center text-gray-600 mt-4">
              {[...Array(7)].map(( i) => (
                <Image
                  key={i}
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
