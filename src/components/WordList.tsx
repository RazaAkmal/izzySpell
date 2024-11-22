"use client";
import React, { useState } from "react";
import CustomButton from "./HeadlessButton";
import Image from "next/image";
import ToggleButton from "./CustomToggleButton";
import { Textarea } from "@headlessui/react";

function WordList() {
  const [isTextAreaMode, setIsTextAreaMode] = useState(false);
  const [inputField,setInputField]=useState<string[]>(["","",""])
   
  const handleInputField=()=>
  {
    setInputField([...inputField,""])
  }

  const handleInputChange=(index:number,value:string)=>
  {
    const updateFields=[...inputField]
    updateFields[index]=value
    setInputField(updateFields)
  }


  return (
    <div className="flex flex-wrap bg-sky-200 rounded-lg w-full md:m-4 p-4 md:p-2">
      {/* Centered Content */}
      <div className="text-center mx-auto max-w-full md:max-w-lg">
        {/* Title Section */}
        <div className="relative flex items-center">
          <Image
            src="/images/titles/MakeSpellingListTitle.svg"
            alt="Add Spelling List"
            width={300}
            height={40}
            className="mx-auto"
          />
        </div>

        {/* Toggle Button Section */}
        <div className="flex items-center justify-center space-x-4">
          {isTextAreaMode ? (
            <span className="text-base font-bold text-gray-700">
              To type multiple words at once, tap the toggle button:
            </span>
          ) : (
            <span className="text-base font-bold text-gray-700">
              To type Bulk of words at once, tap the toggle button:
            </span>
          )}
          <ToggleButton
            isOn={isTextAreaMode}
            toggleSwitch={() => setIsTextAreaMode(!isTextAreaMode)}
          />
        </div>

        {/* Conditional Rendering Section */}
        <div className="w-full mt-6 space-y-4 text-center">
          {isTextAreaMode ? (
            <Textarea
              rows={8}
              placeholder="Type or Paste your words here (like 'apple, banana, orange')...."
              className="w-5/6 p-4 md:w-3/4 lg:w-full border-[3px] border-sky-300 mx-auto text-base md:text-base text-center bg-sky-100 text-[#739DE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none placeholder-[#739DE9]"
            />
          ) : (
            <>

            {/* for display the inputs */}
            <div className="overflow-y-auto h-48 mb-4  custom-scrollbar   space-y-3">
                {inputField.map((field, index) => (
                <input
                  key={index}
                  type="text"
                  value={field}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder="Type your Word"
                  className="w-5/6 p-2 md:w-3/4 lg:w-5/6 border-[3px] border-sky-300 mx-auto text-base md:text-base text-center  text-[#739DE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ))}
              </div>
              <div className="relative left-[25%] flex items-center justify-center border-[4px] bg-white border-green rounded-2xl py-1 mt-6 hover:shadow-lg cursor-pointer w-48 md:w-40 lg:w-64" onClick={handleInputField}>
                <button className="flex items-center justify-center bg-green w-7 h-7 bg-green-400 text-white rounded-full text-3xl font-bold hover:bg-green-500">
                  +
                </button>
                <span className="ml-3 text-base md:text-base text-green-700 font-medium text-green">
                  Add More Words
                </span>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <CustomButton
          fullWidth={true}
          size="large"
          label="Save the Word List"
          className="mt-3"
        />
      </div>
    </div>
  );
}

export default WordList;
