"use client";
import CustomButton from "@/components/HeadlessButton";
import InputField from "@/components/Input";
import Image from "next/image";
import { useState } from "react";

export default function ProfileSetup() {
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-screen-md">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
          IzzySpell
        </h1>
        <p className="text-lg text-center text-purple mb-6">
          Let&apos;s Setup Profile
        </p>

        {/* Profile Image Upload */}
        <div className="flex gap-3 mb-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden mb-3">
            <Image
              src="/images/avatar.png" // Placeholder for user avatar
              alt="User avatar"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <button className="bg-green-500 text-white text-sm px-4 py-1.5 rounded-lg mb-2">
              Upload Image
            </button>
            <p className="text-xs text-gray-500">
              .png, .jpeg files up to 8 MB
            </p>
          </div>
        </div>

        {/* Name Inputs */}
        <div className="flex gap-4 mb-4">
          <InputField type="text" placeholder="First name" />
          <InputField type="text" placeholder="Last name" />
        </div>

        {/* Age Selection */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Please select your Age
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {["6-7", "7-8", "8-9", "9-10", "10-11", "11-12"].map((age) => (
              <CustomButton
                label={age}
                key={age}
                onClick={() => setSelectedAge(age)}
                className={`px-3 py-1 rounded-md border ${
                  selectedAge === age
                    ? "bg-blue text-white data-[hover]:bg-blue"
                    : "bg-white text-black border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Grade Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Please select your Grade
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              "1st Grade",
              "2nd Grade",
              "3rd Grade",
              "4th Grade",
              "5th Grade",
              "6th Grade",
            ].map((grade) => (
              <CustomButton
                label={grade}
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1 rounded-md border ${
                  selectedGrade === grade
                    ? "bg-blue text-white data-[hover]:bg-blue"
                    : "bg-white text-black border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex w-full justify-center">
        <div className="w-full max-w-md px-4">
          <CustomButton label="Lets's Go" fullWidth />
        </div>
        </div>
      </div>
    </div>
  );
}
