// app/spellPractice/loading.tsx
import DashboardLayout from "@/components/DashboardLayout";
import Image from "next/image";
export default function Loading() {
  return (
    <DashboardLayout showFooter={false}>
      <div className="h-[75vh] flex flex-col lg:flex-row lg:items-start justify-between items-center gap-4 bg-skyBlue rounded-md p-6 mx-4 md:mx-8 lg:mx-7">
          {/* Word count button skeleton */}
          <div className="h-12 w-40 bg-white rounded-full animate-pulse" />

          <div className="flex flex-col gap-8 justify-center w-full">
            {/* Top buttons skeleton */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 w-32 bg-white rounded-full animate-pulse"
                />
              ))}
            </div>

            {/* Title skeleton */}
            <div className="flex justify-center">
              <div className="flex justify-between items-center">
                <Image
                  src="/images/titles/ChooseModeTitle.svg"
                  alt="Title"
                  width={500}
                  height={40}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* Mode cards skeleton */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg w-60 h-60 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Go to home button skeleton */}
          <div className="h-12 w-40 bg-white rounded-full animate-pulse" />
        </div>
    </DashboardLayout>
  );
}
