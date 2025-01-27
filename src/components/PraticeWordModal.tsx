"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { useRouter, useParams } from "next/navigation";

// Reusable ModeCard Component
type ModeCardType = {
  imageSrc: string;
  altText: string;
  label: string;
  onClick: () => void;
};

interface PracticeWordModalProps {
  page: number;
}
const ModeCard = ({ imageSrc, altText, label, onClick }: ModeCardType) => (
  <div
    className="bg-white flex flex-col items-center justify-center gap-2 p-4 rounded-lg shadow-md w-60 h-60 sm:w-40 md:w-60 cursor-pointer hover:bg-blue-100"
    onClick={onClick}
  >
    <Image
      src={imageSrc}
      alt={altText}
      className="w-20 h-16 sm:w-24 sm:h-24"
      width={40}
      height={40}
    />
    <span className="text-lg sm:text-md font-bold text-blue">{label}</span>
  </div>
);

const PracticeWordModal: React.FC<PracticeWordModalProps> = ({ page }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { listId } = useParams();

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const navigateTo = (path: string) => {
    router.push(`/spellPractice/${listId}/${path}?page=${page}`);
  };

  return (
    <>
      <div className="flex justify-center">
        <CustomButton
          label="Practice Your Words"
          variant="primary"
          size="large"
          radius="square"
          onClick={toggleModal}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-skyBlue border-2 border-sky-300 flex flex-col rounded-2xl shadow-lg p-12 max-w-max w-full sm:w-11/12 md:w-4/5 lg:w-2/3 z-10">
            {/* Modal Header */}
            <div className="flex justify-end">
              <Button onClick={toggleModal} className="focus:outline-none">
                <Image
                  src="/images/Vector.svg"
                  alt="Close Button"
                  width={24}
                  height={24}
                  className="w-8 h-8"
                />
              </Button>
            </div>

            {/* Modal Title */}
            <div className="flex justify-between items-center mb-6">
              <Image
                src="/images/titles/ChooseModeTitle.svg"
                alt="Title"
                width={500}
                height={40}
                className="mx-auto"
              />
            </div>

            {/* Mode Options */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <ModeCard
                imageSrc="/images/DefaultMode.svg"
                altText="Default Mode"
                label="Default Mode"
                onClick={() => navigateTo("DefualtModePratice")}
              />
              <ModeCard
                imageSrc="/images/SyllabusMode.svg"
                altText="Syllabus Mode"
                label="Syllabus Mode"
                onClick={() => navigateTo("SyllabusModePractice")}
              />
              <ModeCard
                imageSrc="/images/GroupMode.svg"
                altText="Word Groups Mode"
                label="Word Groups Mode"
                onClick={() => navigateTo("GroupModePractice")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PracticeWordModal;
