import DashboardLayout from "@/components/DashboardLayout";

export default function Loading() {
  return (
    <DashboardLayout showFooter={false}>
      <div className="bg-skyBlue m-7 p-10 rounded-lg shadow-lg">
        {/* Header with title and close button */}
        <div className="w-full flex md:flex-row items-center justify-between mb-4">
          <div className="w-full flex justify-between items-center">
            {/* Title skeleton */}
            <div className="h-10 w-72 bg-white rounded-lg animate-pulse mx-auto" />
            {/* Close button skeleton */}
            <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-10 bg-white rounded-full animate-pulse"
            />
          ))}
        </div>

        <div className="flex flex-col items-center mt-4">
          {/* Instruction text skeleton */}
          <div className="h-8 w-96 bg-white rounded-lg animate-pulse mb-3" />

          {/* Syllable boxes container */}
          <div className="flex flex-wrap gap-4 justify-center items-center md:ml-20">
            <div className="flex flex-wrap gap-1 md:p-4 p-2 rounded-2xl bg-white border-4 border-gray-200">
              {/* Syllable boxes */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl animate-pulse"
                />
              ))}
            </div>
            {/* Speaker button skeleton */}
            <div className="w-16 h-16 bg-white rounded-full animate-pulse" />
          </div>

          {/* Option buttons skeleton */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}