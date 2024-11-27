"use client";

import { Switch } from "@headlessui/react";
import React from "react";

interface ToggleButtonProps {
  isOn: boolean;
  toggleSwitch: () => void;
}

function ToggleButton({ isOn, toggleSwitch }: ToggleButtonProps) {
  return (
    <Switch
      checked={isOn}
      onChange={toggleSwitch}
      className={`group inline-flex h-6 w-11 items-center rounded-full ${
        isOn ? "bg-green" : "bg-gray-300"
      } transition duration-300 ease-in-out`}
    >
      {" "}
      <span
        className={`h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </Switch>
  );
}

export default ToggleButton;
