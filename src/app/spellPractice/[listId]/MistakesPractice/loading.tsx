import React from "react";
import DashboardLayout from "@/components/DashboardLayout";

// This component will show when the page data is loading
export default function Loading() {
  return (
    <DashboardLayout showFooter={false}>
      <div className="h-[75vh] m-7 mt-1 p-6 rounded-lg shadow-lg bg-skyBlue animate-pulse">
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 sm:gap-0 items-center">
          <div className="order-2 sm:order-1 flex justify-start">
            <div className="h-10 w-40 bg-white rounded-full"></div>
          </div>
          <div className="order-3 sm:order-2 flex justify-center">
            <div className="h-10 w-32 bg-purple bg-opacity-20 rounded-md"></div>
          </div>
          <div className="order-1 sm:order-3 flex justify-end">
            <div className="h-8 w-8 rounded-full bg-white"></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-4 mb-8">
          {/* Progress Bar skeleton */}
          <div className="w-full max-w-[500px] my-6">
            <div className="flex justify-between text-sm text-darkBlue mb-2">
              <div className="w-20 h-4 bg-white rounded-md"></div>
              <div className="w-24 h-4 bg-white rounded-md"></div>
            </div>
            <div className="w-full bg-white rounded-full h-2.5">
              <div className="bg-green h-2.5 rounded-full w-0"></div>
            </div>
          </div>

          <div className="w-[50%] h-16 bg-white bg-opacity-30 rounded-md"></div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Input field skeleton */}
          <div className="flex items-center justify-center w-full max-w-[500px] bg-white rounded-full shadow-md border-2 border-gray-200 overflow-hidden h-14">
            <div className="w-full px-6 py-4"></div>
            <div className="p-2 mr-2 h-10 w-10 bg-purple bg-opacity-20 rounded-full"></div>
          </div>

          <div className="flex justify-center gap-6 mt-8">
            <div className="w-36 h-10 bg-white rounded-full"></div>
            <div className="w-36 h-10 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
