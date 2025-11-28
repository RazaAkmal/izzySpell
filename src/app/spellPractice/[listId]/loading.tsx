// app/spellPractice/loading.tsx
import DashboardLayout from "@/components/DashboardLayout";
import Image from "next/image";
export default function Loading() {
  return (
    <DashboardLayout showFooter={false}>
      <div className="min-h-[75vh] flex flex-col lg:flex-row lg:items-start justify-between items-center gap-4 bg-skyBlue rounded-md p-4 sm:p-6 mx-4 md:mx-8 lg:mx-7">
          {/* Word count button skeleton */}
          <div className="h-10 sm:h-12 w-32 sm:w-40 bg-white rounded-full animate-pulse flex-shrink-0" />

          <div className="flex flex-col gap-4 sm:gap-8 justify-center w-full max-w-6xl">
            {/* Top buttons skeleton */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 sm:h-12 w-24 sm:w-32 bg-white rounded-full animate-pulse"
                />
              ))}
            </div>

            {/* Title skeleton */}
            <div className="flex justify-center px-4">
              <div className="flex justify-between items-center w-full max-w-lg">
                <Image
                  src="/images/titles/ChooseModeTitle.svg"
                  alt="Title"
                  width={500}
                  height={40}
                  className="mx-auto w-full h-auto max-w-full"
                />
              </div>
            </div>

            {/* Mode cards skeleton */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-4 sm:mb-6 px-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg w-full max-w-[280px] sm:w-60 h-48 sm:h-60 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Go to home button skeleton */}
          <div className="h-10 sm:h-12 w-32 sm:w-40 bg-white rounded-full animate-pulse flex-shrink-0" />
        </div>
    </DashboardLayout>
  );
}
