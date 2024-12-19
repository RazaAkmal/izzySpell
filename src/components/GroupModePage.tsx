"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";

function GroupModePage() {
  const wordGroups = ["START", "STAGE", "STATE", "STORY", "STORM"];
  // input for each row of words
  const [userInputs, setUserInputs] = useState<string[][]>(
    wordGroups.map((word) => Array(word.length).fill(""))
  );

  const handleInputChange = (
    rowIndex: number,
    boxIndex: number,
    value: string
  ) => {
    const updateInputs = [...userInputs];
    updateInputs[rowIndex][boxIndex] = value.slice(-1).toUpperCase();
    setUserInputs(updateInputs);
  };

  return (
    <div className="bg-skyBlue m-5 max-h-max rounded-md p-6 ">
      <div className="w-full flex flex-wrap justify-between items-center mb-4 gap-4">
        <Image
          src="/images/settingIcon.svg"
          alt="Cancel Button"
          width={24}
          height={24}
          className="w-8 h-8"
        />
        <p className="text-3xl font-bold ">Word Group Mode</p>

        <Button className="focus:outline-none">
          <Image
            src="/images/Vector.svg"
            alt="Cancel Button"
            width={24}
            height={24}
            className="w-8 h-8"
          />
        </Button>
      </div>
      <p className="text-xl text-darkBlue mb-6 text-center">
        Tap the speaker to hear the word, then type it below.
      </p>
      <div className="space-y-6 ">
        {wordGroups.map((word, rowIndex) => (
          <div
            className="flex items-center justify-center gap-4 "
            key={rowIndex}
          >
            {/* letter alreday Show at the start */}
            {word
              .split("")
              .slice(0, 2)
              .map((letter, index) => (
                <div
                  className="w-12 h-12 flex items-center justify-center border-[3px] border-darkGreen bg-gray-100 rounded-lg font-bold text-2xl "
                  key={index}
                >
                  {letter}
                </div>
              ))}

            {/* input Boxes */}
            {Array.from({ length: word.length - 2 }).map((_, boxIndex) => (
              <input
                type="text"
                key={boxIndex}
                maxLength={1}
                value={userInputs[rowIndex][boxIndex]}
                onChange={(e) =>
                  handleInputChange(rowIndex, boxIndex, e.target.value)
                }
                className="w-12 h-12 text-center border-[3px] border-darkGreen rounded-lg text-2xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            ))}

            {/* Speaker Button */}
            <Button className="focus:outline-none">
              <Image
                src="/images/speakerIcon.svg"
                alt="Speaker"
                width={32}
                height={32}
                className="w-12 h-12 cursor-pointer"
              />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupModePage;
