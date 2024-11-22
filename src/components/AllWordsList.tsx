import React from "react";
import Image from "next/image";
import AllListData from "./Listdata";

function AllWords() {
  return (
    <div className="bg-[#98C3FF] bg-opacity-70 flex flex-col   rounded-lg border-2 border-sky-600">
      {/* Title Image */}
      <div className="flex justify-center items-center h-20">
        <Image
          src="/images/titles/All Words Lists.svg"
          alt="all word list"
          width={300}
          height={40}
        />
      </div>

      <div className="grid grid-cols-3  sm:grid-cols-5  mx-10 p-3  bg-sky-200 border-2 border-sky-300 rounded-md">
        <p className="text-darkBlue font-bold text-xl text-center sm:text-left">
          List Name
        </p>
        <p className="text-darkBlue font-bold text-xl text-center sm:text-let">
          Date
        </p>
        <p className="text-darkBlue font-bold text-xl text-center sm:text-left">
          Status
        </p>
      </div>

      {/* All List Data */}
      <AllListData />
    </div>
  );
}

export default AllWords;
