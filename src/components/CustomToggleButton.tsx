"use client";
import React from "react";

interface ToggleButtonProps {
  isOn: boolean;
  toggleSwitch: () => void;
}

function ToggleButton({ isOn, toggleSwitch }: ToggleButtonProps) {
  return (
    <button
      onClick={toggleSwitch}
      className={`w-12 h-6 flex items-center rounded-full md:p-2 ${
        isOn ? "bg-green" : "bg-gray-300"
      } transition-colors duration-1000 ease-in-out`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform ${
          isOn ? "translate-x-5" : ""
        } transition-transform duration-300 ease-in-out`}
      ></div>
    </button>
  );
}

export default ToggleButton;
