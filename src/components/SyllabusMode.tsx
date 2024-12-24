"use client";

import React, { useState } from "react";
import Image from "next/image";
import { syllableData, SyllableOption } from "@/app/syllableData";
import CustomPagination from "./CustomPagination";

function SyllabusModePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [syllableBoxes, setSyllableBoxes] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);

  const options = syllableData[currentPage - 1];
  console.log("options", options);

  const handleOptionClick = (option: SyllableOption) => {
    setSelectedOption(option.id);

    if (option.isCorrect) {
      const correctText = option.text.replace(/-/g, "");
      setSyllableBoxes(correctText.split(""));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resetState();
  };

  const resetState = () => {
    setSelectedOption(null);
    setSyllableBoxes(["", "", "", "", ""]);
  };

  return (
    <>
      <div className="bg-skyBlue m-7 p-10 rounded-lg shadow-lg">
        <div className="w-full flex items-center justify-between mb-4">
          {/* Title centered */}
          <p className="text-4xl font-bold text-center w-full">Syllabus Mode</p>

          <button className="absolute right-32 focus:outline-none">
            <Image
              src="/images/Vector.svg"
              alt="Cancel Button"
              width={24}
              height={24}
              className="w-10 h-10 mb-4"
            />
          </button>
        </div>
        <div className="mt-6">
          <CustomPagination
            currentPage={currentPage}
            totalPages={syllableData.length}
            onPageChange={handlePageChange}
          />
        </div>
        <div className="flex flex-col items-center mt-4">
          <p className="font-semibold text-2xl mb-2 text-gray-700">
            Please choose the correct syllable word below.
          </p>

          {/* Syllable Boxes */}
          <div className="flex gap-5 justify-center items-center ml-20">
            <div className="flex gap-2 p-5 rounded-2xl bg-white mb-4 border-darkGreen border-2">
              {syllableBoxes.map((letter, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 md:w-16 md:h-16 border-2 border-darkGreen rounded-xl flex items-center justify-center ${
                    letter ? "bg-darkGreen" : "bg-greenLite"
                  }`}
                >
                  <span className="text-2xl font-bold text-white">{letter}</span>
                </div>
              ))}
            </div>
            <button className="focus:outline-none">
              <Image
                src="/images/speakerIcon.svg"
                alt="Speaker"
                width={32}
                height={32}
                className="w-16 h-16 cursor-pointer mb-5"
              />
            </button>
          </div>

          {/* Word Options */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={`w-full px-10 py-4 border-2 rounded-2xl text-3xl text-center font-semibold ${
                  selectedOption === option.id
                    ? option.isCorrect
                      ? "bg-green border-green"
                      : "bg-red-200 border-red-500"
                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SyllabusModePage;
