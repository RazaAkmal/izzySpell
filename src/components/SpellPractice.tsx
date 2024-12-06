"use client";

import React, { useState } from "react";
import Pagination from "rc-pagination";
import Image from "next/image";
import CustomButton from "./HeadlessButton";
import CustomPagination from "./CustomPagination";

function PracticePage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Define spells
  const spells = [
    ["HIGH", "EVERY", "NEAR", "Continue"],
    ["LEARN", "CREATE", "EXPLORE"],
    ["GROW", "INSPIRE", "IMAGINE"],
    ["Ingenious", "Onomatopoeia", "Fuchsia"],
    ["DREAM", "SMART", "TASK", "CONTINUE", "WEATHER"],
    ["Spell", "Spell", "Spell"],
    ["Spell", "Spell", "Spell"],
  ];

  const currentSpells = spells[currentPage - 1] || [];
  const totalWords = spells.flat().length;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // for speak the letter
  const pronounceText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-skyBlue m-3 max-h-max rounded-md p-6">
      {/* Pagination and Buttons */}

      <div className="w-full flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex-shrink-0">
          <CustomButton
            label={`Page ${currentPage} / ${spells.length}`}
            variant="success"
            size="small"
            radius="rounded"
            img="/images/bookIcon.svg"
          />
        </div>

        <div className="flex-grow">
        <CustomPagination
        currentPage={currentPage}
        totalPages={spells.length}
        onPageChange={handlePageChange}/>
        </div>

        <div className="flex-shrink-0">
          <CustomButton
            label={`Words: ${totalWords}`}
            size="small"
            variant="success"
            radius="rounded"
            img="/images/AlphaIcon.svg"
          />
        </div>
      </div>

      <div className="flex justify-center ">
        <Image
          alt=" Words to Practice"
          width={450}
          height={450}
          src="/images/titles/Here Are Your Words to Practice.svg"
        />
      </div>

      {/* Spell Content */}
      <div className="flex flex-col space-y-3">
        {currentSpells.length > 0 ? (
          currentSpells.map((spell, index) => (
            <div
              key={index}
              className="bg-white border-[2px] border-darkGreen rounded-2xl shadow-md p-2 flex gap-2 items-center justify-center max-w-full mx-auto flex-wrap"
            >
              {spell.split("").map((letter, letterIndex) => (
                <div
                  key={letterIndex}
                  className="text-white text-xl border-2 border-darkGreen bg-lightGreen font-bold px-4 py-2 rounded-xl flex justify-center items-center"
                >
                  {letter}
                </div>
              ))}

              <Image
                alt="speaker"
                width={10}
                height={10}
                src="/images/SpeakerIcon.svg"
                className="w-12 cursor-pointer"
                onClick={() => pronounceText(spell)}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            No spells available on this page.
          </p>
        )}
        <div className="flex justify-center ">
          <CustomButton
            label="Practice Your Words"
            variant="primary"
            size="large"
            radius="square"
          />
        </div>
      </div>
    </div>
  );
}

export default PracticePage;
