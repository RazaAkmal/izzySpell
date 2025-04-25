// app/dashboard/loading.tsx
import DashboardLayout from "@/components/DashboardLayout";
import React from "react";
import Image from "next/image";
const Loading = () => {
  return (
    <DashboardLayout showFooter={true}>
      <div className="flex flex-col md:flex-row justify-around gap-2 m-2 animate-pulse">
        {/* Left Section Skeleton */}
        <div className="flex bg-skyBlue rounded-2xl w-full md:m-4 p-4 md:p-3">
          <div className="text-center mx-auto max-w-full md:max-w-lg">
            <Image
              src="/images/titles/AddSpellingListTitle.svg"
              alt="Add Spelling List"
              width={40}
              height={40}
              className="w-72 mx-auto"
            />
            <div className="w-80 h-6 bg-gray-300 rounded-md mx-auto mb-4"></div>
            <div className="animate-pulse border-dashed rounded-lg border-[3px] border-[#6198e0] p-6 md:p-8 mt-4 mb-6 bg-gray-200 flex flex-col items-center justify-center mx-auto max-w-3xl">
              <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
              <div className="w-80 h-6 bg-gray-300 rounded-md mb-2"></div>
              <div className="w-64 h-6 bg-gray-300 rounded-md mb-4"></div>
              <div className="w-48 h-10 bg-gray-300 rounded-md"></div>
            </div>
          </div>
        </div>

        {/* Right Section Skeleton */}
        <div className="flex flex-wrap bg-skyBlue rounded-2xl w-full md:m-4 p-4 md:p-2">
          <div className="text-center mx-auto max-w-full md:max-w-lg">
            <Image
              src="/images/titles/MakeSpellingListTitle.svg"
              alt="Add Spelling List"
              width={300}
              height={40}
              className="mx-auto"
            />
            <div className="w-80 h-6 bg-gray-300 rounded-md mx-auto mb-4"></div>
            <div className="w-full flex flex-col items-center mt-6 space-y-4 text-center">
              <div className="w-full overflow-y-auto h-48 mb-4 custom-scrollbar space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="w-5/6 p-2 md:w-3/4 lg:w-5/6 border-[2px] border-[#98C3FF] rounded-2xl mx-auto bg-gray-300 h-10"
                  ></div>
                ))}
              </div>
              <div className="relative flex items-center justify-center border-[4px] bg-gray-300 rounded-2xl py-1 w-44 lg:w-64">
                <div className="w-7 h-7 bg-gray-400 rounded-full"></div>
                <div className="ml-3 w-32 h-6 bg-gray-400 rounded-md"></div>
              </div>
            </div>
            <div className="w-full h-12 bg-gray-300 rounded-xl mt-3"></div>
          </div>
        </div>
      </div>

      {/* Recent List Section Skeleton */}
      <div className="p-4 bg-skyBlue rounded-2xl shadow-md m-2 md:m-5 mt-3">
      <div className="w-72 h-8 bg-gray-300 rounded-md mx-auto mb-4"></div>

        <div className="flex justify-center gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex items-center p-4 bg-gray-300 border-[1px] border-gray-600 rounded-lg shadow-md space-x-3 w-1/3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-400"></div>
              <div className="flex-grow h-6 bg-gray-400 rounded-md"></div>
              <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Loading;
