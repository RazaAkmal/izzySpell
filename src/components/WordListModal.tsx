import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  //for store color and user input
  const [listName, setListName] = useState<string>("");
  console.log(listName);
  console.log(setListName);

  // to check user enter right information
  const handleSave = () => {
    if (!listName) {
      alert("Please enter a name for the list.");
      return;
    }
    alert("Your list has been saved");
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div>
      <div className="fixed  inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-lightBlue border-2 border-sky-300 flex flex-col rounded-3xl shadow-lg p-8 max-w-screen-md w-full z-10">
          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="focus:outline-none">
              <Image
                src="/images/Vector.svg"
                alt="Cancel Button"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </Button>
          </div>

          {/* Title */}
          <Image
            src="/images/titles/Please Enter a Name for Your Word List.svg"
            alt="Add Spelling List"
            width={40}
            height={40}
            className="w-96 mx-auto "
          />
          {/* Input Field */}
          <input
            type="text"
            placeholder="Enter the list name here..."
            onChange={(e) => setListName(e.target.value)}
            value={listName}
            className="w-3/4 mx-auto bg-sky-100 rounded-lg border border-[#7898D2] text-[#4A6FA5] text-lg placeholder-[#A0B6D8] px-4 py-3 mt-4 focus:outline-none focus:ring-2 focus:ring-[#7898D2]"
          />
          {/* Save Button */}
          <div className="flex justify-center mt-8">
            <CustomButton
              label="Save & Start Learning"
              fullWidth={false}
              onClick={handleSave}
              size="large"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
