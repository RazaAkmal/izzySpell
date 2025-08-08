"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomButton from "./HeadlessButton";

interface NoWordsModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

const NoWordsModal: React.FC<NoWordsModalProps> = ({
  isOpen,
  title = "No Words Available",
  message = "This list doesn't have any words to play. Please choose another list."
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-skyBlue">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl md:text-3xl font-bold text-darkBlue mb-4">
            {title}
          </h2>
          <p className="text-lg text-textColor text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <CustomButton
            label="Go to Home"
            variant="primary"
            size="small"
            onClick={handleGoHome}
            img="/images/backArrow.svg"
            className="w-full max-w-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default NoWordsModal;
