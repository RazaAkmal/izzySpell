"use client";

import React from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import CustomButton from "./HeadlessButton";

// Reusable ModeCard Component
type ModeCardType = {
  imageSrc: string;
  altText: string;
  label: string;
  onClick: () => void;
};

const ModeCard = ({ imageSrc, altText, label, onClick }: ModeCardType) => (
  <div
    className="bg-white flex md:flex-col items-center justify-center gap-2 p-4 rounded-lg shadow-md w-60 h-36 md:h-60 cursor-pointer hover:bg-blue-100"
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

const PracticeWordModal: React.FC = () => {
  const router = useRouter();
  const { listId } = useParams();

  const navigateTo = (path: string) => {
    router.push(`/spellPractice/${listId}/${path}`);
  };

  return (
    <>
      <div className="flex flex-col gap-8 justify-center">
        <div className="flex gap-2 justify-center ">
          <CustomButton
            size="small"
            label="Study"
            variant="primary"
            radius="rounded"
            img="/images/bookIcon.svg"
          />
          <CustomButton
            size="small"
            label="Quiz"
            variant="secondary"
            radius="rounded"
            img="/images/QuizIcon.svg"
          />
          <CustomButton
            size="small"
            label="Extra"
            variant="secondary"
            radius="rounded"
            img="/images/PencelIcon.svg"
            className=""
          />
        </div>
        {/* Modal Title */}
        <div className="flex justify-between items-center">
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
            altText="syllables Mode"
            label="Syllables Mode"
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
    </>
  );
};

export default PracticeWordModal;
