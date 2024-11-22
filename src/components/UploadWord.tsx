"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import CustomButton from "./HeadlessButton";
import Image from "next/image";
import Loading from "./Loading";
import Modal from "@/components/WordListModal"; // Import the self-contained Modal component

function UploadWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true); // Start uploading
    setProgress(0); // Reset progress

    // Simulate file upload progress
    const totalSteps = 10;
    let currentStep = 0;

    const uploadInterval = setInterval(() => {
      currentStep += 1;
      setProgress((currentStep / totalSteps) * 100);

      if (currentStep === totalSteps) {
        clearInterval(uploadInterval);
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        setUploading(false); // Stop uploading
        setIsModalOpen(true); // Open modal
      }
    }, 1000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/jpeg": [".jpg"],
      "image/png": [".png"],
    },
    multiple: true,
  });

  return (
    <div className="flex flex-wrap bg-sky-200 rounded-lg w-full md:m-4 p-4 md:p-3">
      {/* Centered Content */}
      <div className="text-center mx-auto max-w-full md:max-w-lg">
        {/* Title Image */}
        <Image
          src="/images/titles/Add Your Spelling List Here!.svg"
          alt="Add Spelling List"
          width={40}
          height={40}
          className="w-72 mx-auto"
        />
        <p className="text-gray-700 text-sm md:text-base">
          The list can have up to 5 words
        </p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-dashed rounded-lg border-[3px] border-[#6198e0] p-6 md:p-8 mt-4 mb-6 
    ${
      isDragActive ? "bg-blue-100" : "bg-sky-200"
    } flex flex-col items-center justify-center mx-auto max-w-3xl`}
        >
          <input {...getInputProps()} />

          <Image
            src="/images/Uploadbutton.svg"
            alt="Upload button"
            width={40}
            height={40}
            className="w-16 md:w-24 cursor-pointer"
          />

          <Image
            src="/images/titles/Drag&DropWord.svg"
            alt="Drag & Drop Words"
            width={40}
            height={40}
            className="w-80 mb-2"
          />
          {isDragActive ? (
            <p className="text-darkBlue font-medium">Drop your files here...</p>
          ) : (
            <p className="text-darkBlue text-sm md:text-base text-center">
              Drag & drop files, or click to select files.
              <br />
              Allowed file types: .pdf, .xlsx, .csv, .txt, .docx, .jpg, .png
            </p>
          )}
          <div className="mt-4">
            <CustomButton
              label="Upload Your Word List"
              fullWidth={false}
              size="large"
            />
          </div>
        </div>

        {/* Loading Progress */}
        {uploading && (
          <div className="mt-6">
            <Loading progress={progress} />
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default UploadWord;
