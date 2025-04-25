// app/spellPractice/loading.tsx
import DashboardLayout from "@/components/DashboardLayout";
import CustomButton from "@/components/HeadlessButton";
import React from "react";

const Loading = () => {
  return (
    <DashboardLayout showFooter={false}>
      <div className="flex justify-center gap-2 ">
          <CustomButton
            label="Study"
            variant="primary"
            radius="rounded"
            img="/images/bookIcon.svg"
          />
          <CustomButton
            label="Quiz"
            variant="secondary"
            radius="rounded"
            img="/images/QuizIcon.svg"
          />
          <CustomButton
            label="Extra"
            variant="secondary"
            radius="rounded"
            img="/images/PencelIcon.svg"
            className=""
          />
        </div>
      <div className="bg-skyBlue m-3 max-h-max rounded-md p-6 animate-pulse">
        {/* Header Section Skeleton */}
        <div className="w-full flex flex-col lg:flex-row flex-wrap justify-between items-center gap-4">
          <div className="flex-shrink-0 space-y-2">
            <div className="w-40 h-10 bg-gray-300 rounded-md"></div>
            <div className="w-40 h-10 bg-gray-300 rounded-md"></div>
          </div>

          <div className="flex-grow">
            <div className="w-full h-10 bg-gray-300 rounded-md"></div>
          </div>

          <div className="flex-shrink-0 space-y-2">
            <div className="w-40 h-10 bg-gray-300 rounded-md"></div>
            <div className="w-40 h-10 bg-gray-300 rounded-md"></div>
          </div>
        </div>

        {/* Title Section Skeleton */}
        <div className="flex justify-center my-6">
          <div className="w-96 h-10 bg-gray-300 rounded-md"></div>
        </div>

        {/* Words Section Skeleton */}
        <div className="flex flex-col space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 border-[2px] border-gray-400 rounded-2xl shadow-md p-2 flex gap-2 items-center justify-center max-w-full mx-auto flex-wrap h-16"
            >
              {[...Array(5)].map((_, letterIndex) => (
                <div
                  key={letterIndex}
                  className="text-white text-xl border-2 border-gray-400 bg-gray-400 font-bold px-4 py-2 rounded-xl flex justify-center items-center w-10 h-10"
                ></div>
              ))}
              <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Loading;
