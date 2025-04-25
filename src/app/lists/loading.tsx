// app/lists/loading.tsx
import DashboardLayout from "@/components/DashboardLayout";
import React from "react";
import Image from "next/image";

const Loading = () => {
  return (
    <DashboardLayout showFooter={false}>
      <div className="bg-skyBlue rounded-2xl md:m-6 px-8 py-3 md:px-4">
        <div className="flex justify-center items-center h-20">
          <Image
            src="/images/titles/All Words Lists.svg"
            alt="all word list"
            width={300}
            height={40}
          />
        </div>
        <div className="px-4">
          <div className="hidden p-3 md:grid grid-cols-12 font-bold text-xl text-darkBlue bg-[#ECF7FF] border-2 border-sky-300 rounded-2xl">
          <div className="col-span-3">List Name</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-4 text-center">Actions</div>
          </div>
        </div>
        <div className="mt-5 rounded-lg md:px-4 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="grid px-2 py-2 grid-cols-1 md:grid-cols-12 text-left gap-4 items-center md:gap-0 bg-[#ECF7FF] border-2 border-sky-300 rounded-2xl mb-3 shadow-md animate-pulse"
            >
              <div className="md:col-span-3 flex items-center gap-2 me-3">
                <div className="min-h-10 min-w-10 rounded-full bg-gray-300"></div>
                <div className="w-32 h-6 bg-gray-300 rounded-md"></div>
              </div>
              <div className="md:col-span-2 w-24 h-6 bg-gray-300 rounded-md"></div>
              <div className="md:col-span-3 flex me-5 gap-2 w-full md:w-auto">
                <div className="w-full bg-gray-200 h-6 border-2 border-sky-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="md:col-span-4 flex justify-between md:justify-center gap-2 sm:flex-row items-center text-left">
                <div className="px-3 py-1 lg:px-5 lg:py-2 bg-gray-300 rounded-lg w-32 h-8"></div>
                <div className="px-3 py-1 lg:px-5 lg:py-2 bg-gray-300 rounded-lg w-32 h-8"></div>
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Loading;
