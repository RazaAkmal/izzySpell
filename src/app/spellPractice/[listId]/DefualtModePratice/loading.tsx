import DashboardLayout from "@/components/DashboardLayout";

export default function Loading() {
  return (
    <DashboardLayout showFooter={false}>
      <div className="bg-skyBlue m-7 mt-1 p-6 rounded-lg shadow-lg">
        {/* Header Section */}
        <div className="flex items-center justify-between flex-col-reverse md:flex-row relative">
          {/* Page counter button skeleton */}
          <div className="h-12 w-40 bg-white rounded-full animate-pulse" />
          
          {/* Title skeleton */}
          <div className="h-8 w-64 bg-white rounded-lg animate-pulse md:mr-40" />
          
          {/* Close button skeleton */}
          <div className="h-8 w-8 bg-white rounded-full animate-pulse md:relative absolute md:right-0 top-0 right-[-10]" />
        </div>

        <div className="flex flex-col items-center space-y-6 mt-6">
          {/* Pagination skeleton */}
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-10 bg-white rounded-full animate-pulse"
              />
            ))}
          </div>

          {/* Instruction text skeleton */}
          <div className="h-8 w-96 bg-white rounded-lg animate-pulse" />

          {/* Word slots container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
            <div className="flex flex-wrap border-[3px] border-gray-200 rounded-2xl md:ml-4 p-4 bg-white justify-center gap-3">
              {/* Letter slots skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-14 h-14 bg-white rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Scrambled letters section */}
          <div className="flex flex-wrap justify-center gap-3 p-4">
            {/* Scrambled letter boxes skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-16 h-16 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>

          {/* Text to speech button skeleton */}
          <div className="h-16 w-16 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </DashboardLayout>
  );
}