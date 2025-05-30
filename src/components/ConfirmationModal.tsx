import React from 'react';
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  showCancelButton?: boolean; // New prop to control cancel button visibility
  isLoading?: boolean; // New prop for loading state
  confirmText?: string; // Custom text for confirm button
  cancelText?: string; // Custom text for cancel button
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  showCancelButton = true, // Default to true for backward compatibility
  isLoading = false, // Default to not loading
  confirmText, // Custom confirm button text
  cancelText = "No", // Default cancel button text
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
          
          <CustomButton
            label={
              isLoading ? (
                <div className="flex items-center">
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : showCancelButton ? (confirmText || "Yes") : "OK"
            }
            variant="primary"
            size="small"
            onClick={onConfirm}
            disabled={isLoading}
          />
          {showCancelButton && (
            <CustomButton
              label={cancelText}
              variant="secondary"
              size="small"
              onClick={onClose}
              disabled={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;