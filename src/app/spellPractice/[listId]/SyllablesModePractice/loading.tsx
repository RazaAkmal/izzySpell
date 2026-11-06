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
        </main>
      </div>
    </div>
  );
}