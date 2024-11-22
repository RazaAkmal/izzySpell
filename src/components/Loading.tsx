import React, { useState } from "react";
import Image from "next/image";

interface LoadingProps {
  progress: number; // Accepts the upload percentage
}

const Loading: React.FC<LoadingProps> = ({ progress }) => {
  const [isLoading, setIsLoading] = useState(true);

  //for cancel loading
  const handleCancle = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <div className="bg-white border-2 border-b-cyan-600 rounded-lg p-2 ">
          {/* Outer container for circle, cancel icon, and content */}
          <div className="flex justify-between items-center">
            {/* Circle */}
            <div className="h-10 w-10 rounded-full bg-cyan-300"></div>

            {/* Content placed between circle and cancel icon */}
            <div className="flex flex-col items-center mx-4 flex-grow">
              <p className="text-sm">Spelling List Name-1</p>

              {/* Progress information */}
              <div className="flex justify-between items-center w-full">
                <p className="text-sm">Progress</p>
                <p className="text-gray-700 text-sm">{progress}%</p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-4 bg-cyan-200 rounded-full overflow-hidden">
                {/* Progress Indicator */}
                <div
                  className="h-full bg-green transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Cancel Icon */}
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={handleCancle}
            >
              <Image
                src="/images/Vector.svg"
                alt="Delete icon"
                width={22}
                height={22}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Loading;
