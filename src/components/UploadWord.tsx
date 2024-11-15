import React from 'react';
import CustomButton from './HeadlessButton';
import Image from 'next/image';

function UploadWord() {
  return (
    <div className="flex flex-wrap bg-sky-100 rounded-lg w-full md:m-4 p-4 md:p-4 items-center justify-center">
      {/* Centered Content */}
      <div className="text-center  max-w-xs md:max-w-md">
        <Image
          src="/images/titles/Add Your Spelling List Here!.svg"
          alt="Add Spelling List"
          width={40}
          height={40}
          className="w-72 mx-auto"
        />
        <p className="text-gray-700 text-sm md:text-base">The list can have up to 5 words</p>
        
        <div className="border-dashed rounded-lg border-[3px] border-[#6198e0] opacity-100 p-4 md:p-8 mt-4">
          <div className="flex flex-col items-center justify-center space-y-2">
           
            <Image
              src="/images/Uploadbutton.svg"
              alt="Upload button"
              width={40}
              height={40}
              className="w-16 md:w-24 cursor-pointer"
            />
            
             <Image
              src="/images/titles/Drag&DropWord.svg"
              alt="Upload button"
              width={40}
                height={40}
                className="w-72"
            />
            <p className="text-xs md:text-sm">Allowed file types: .pdf, . xlxs, .csv, .txt, .docx, .jpg, .png</p>
            <div className="flex justify-center">
          <CustomButton label="Upload Your Word List" fullWidth={false} />
        </div>
          </div>

        </div>

       
      </div>
    </div>
  );
}

export default UploadWord;
