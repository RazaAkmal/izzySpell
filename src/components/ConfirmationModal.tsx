import React from 'react';
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  showCancelButton?: boolean; // New prop to control cancel button visibility
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  showCancelButton = true, // Default to true for backward compatibility
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-lightBlue border-2 border-sky-300 flex flex-col rounded-md shadow-lg p-4 max-w-md w-full z-10">
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

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-purple mb-2">{title}</h2>
          <p className="text-darkBlue">{message}</p>
        </div>

        {/* Buttons */}
        <div className={`flex justify-center ${showCancelButton ? 'gap-4' : ''}`}>
          {showCancelButton && (
            <CustomButton
              label="Cancel"
              variant="secondary"
              size="small"
              onClick={onClose}
            />
          )}
          <CustomButton
            label={showCancelButton ? "Confirm" : "OK"}
            variant="primary"
            size="small"
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;