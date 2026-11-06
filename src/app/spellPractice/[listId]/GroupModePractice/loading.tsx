import Image from "next/image";
import Link from "next/link";

// Static shell only: DashboardLayout awaits auth() + a user query, which would delay this fallback

export default function Loading() {
  return (
    <div className="bg-dashboard-background bg-cover bg-center min-h-screen flex flex-col">
      <div className="mx-4 md:mx-8 lg:mx-16">
        <header className="bg-skyBlue m-2 md:m-6 px-4 md:px-6 rounded-2xl shadow-md">
          <div className="flex flex-row justify-between items-center h-16 md:h-20">
            <Link href="/dashboard">
              <div className="relative flex items-center h-full w-32 md:w-48 overflow-hidden">
                <Image
                  src="/images/izzyLogo.svg"
                  alt="Logo"
                  width={200}
                  height={40}
                  priority
                  fetchPriority="high"
                  className="mx-auto hover-scale !shadow-none"
                />
              </div>
            </Link>
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white animate-pulse flex-shrink-0" />
          </div>
        </header>
        <main>
      <div className="bg-skyBlue m-5 max-h-max rounded-md p-6">
        {/* Header with icons and title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Settings icon skeleton */}
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          
          {/* Title skeleton */}
          <div className="h-8 w-72 bg-gray-200 rounded-lg animate-pulse" />
          
          {/* Close button skeleton */}
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Pagination skeleton */}
        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Instruction text skeleton */}
        <div className="text-center mt-7 mb-6">
          <div className="h-6 w-96 mx-auto bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Word groups skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex flex-wrap items-center justify-start flex-row md:justify-center gap-4"
            >
              {/* First two letter boxes (pre-filled) */}
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-gray-200 rounded-lg border-[3px] border-gray-300 animate-pulse"
                />
              ))}

              {/* Input boxes */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-gray-200 rounded-lg border-[3px] border-gray-300 animate-pulse"
                />
              ))}

              {/* Speaker button skeleton */}
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />

              {/* Status icon skeleton (check/reset) */}
              <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}