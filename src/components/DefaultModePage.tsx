"use client";

import React, { useState } from "react";
import CustomPagination from "./CustomPagination";
import Image from "next/image";
import CustomButton from "./HeadlessButton";
import { Button } from "@headlessui/react";

const DefaultModePage: React.FC = () => {
  const words = ["HIGH", "EVERY", "NEAR", "CONTINUE"]; // Page 1 words
  const [currentPage, setCurrentPage] = useState(1);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-skyBlue m-7 mt-1 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        {/* Page Button */}

        <CustomButton
          label={`Page ${currentPage} / ${words.length}`}
          variant="success"
          size="small"
          img="/images/bookIcon.svg"
        />

        <Image
          src="/images/titles/Default Mode.svg"
          alt="Default title"
          width={250}
          height={24}
          className="mr-40"
        />

        {/* Cross Button */}
        <Button className="focus:outline-none">
          <Image
            src="/images/Vector.svg"
            alt="Cancel Button"
            width={24}
            height={24}
            className="w-10 h-10"
          />
        </Button>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Pagination */}
        <CustomPagination
          currentPage={currentPage}
          totalPages={words.length}
          onPageChange={handlePageChange}
        />

        <p className="text-2xl font-bold text-darkBlue text-center">
          Click on a letter to add it to the box and create the word!
        </p>

        <div className="flex border-darkGreen border-[3px] rounded-2xl p-4 bg-white justify-center gap-3 mb-6">
          {Array.from({ length: words[currentPage - 1].length }).map((_, i) => (
            <div
              key={i}
              className="w-14 h-14 border-2 border-darkGreen rounded-xl bg-greenLite   flex items-center justify-center shadow-md"
            >
              <span className="text-2xl font-bold text-darkBlue"></span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {words[currentPage - 1]
            .split("")
            .sort()
            .map((letter, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-lightGreen border-[3px] border-darkGreen text-white font-bold text-3xl flex items-center justify-center rounded-2xl cursor-pointer hover:bg-teal-600 shadow-md"
              >
                {letter}
              </div>
            ))}
        </div>

        {/* Sound Button */}
        <div>
          <Image
            src="/images/Speakericon.svg"
            alt="Sound Button"
            width={60}
            height={60}
          />
        </div>
      </div>
    </div>
  );
};

export default DefaultModePage;
