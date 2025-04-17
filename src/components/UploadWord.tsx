"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import CustomButton from "./HeadlessButton";
import Image from "next/image";
import Progress from "./Progress";
import Modal from "@/components/WordListModal";
import { readFileContent } from "@/app/utils/fileReaderUtil";
import { processFileWithAI } from "@/app/actions/AiService";

function UploadWord({ user, refreshSpellingLists }: {
  user: any,   
  refreshSpellingLists: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null); // Store the file
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    const totalSteps = 20;
    let currentStep = 0;

    const uploadInterval = setInterval(() => {
      currentStep += 1;
      setProgress((currentStep / totalSteps) * 100);

      if (currentStep === totalSteps - 1) {
        clearInterval(uploadInterval);
      }
    }, 1000);
    try {
      const content = await readFileContent(uploadedFile);
        
      if (!content) {
        alert(
          "The file content is empty or could not be read. Please try another file."
        );
        setProgress(0);
        return;
      }

      const response = await processFileWithAI(content);

      if (response.success) {
        setProgress(100);
        clearInterval(uploadInterval);
        setTimeout(() => {
          setAiResponse(response.data);
          setIsModalOpen(true);
        }, 1000);
      } else {
        alert(`${response.error}`);
        clearInterval(uploadInterval);
        setFile(null);
        setProgress(0);
      }
    } catch (error) {
      // Catch unexpected errors during execution
      console.error("Unexpected Error:", error);
      alert(
        "An unexpected error occurred while processing the file. Please try again."
      );
      clearInterval(uploadInterval);
      setFile(null);
      setProgress(0);
    }
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
    multiple: false,
  });

  return (
    <div className="flex bg-skyBlue rounded-2xl w-full md:m-4 p-4 md:p-3">
      <div className="text-center mx-auto max-w-full md:max-w-lg">
        {/* Title Image */}
        <Image
          src="/images/titles/AddSpellingListTitle.svg"
          alt="Add Spelling List"
          width={40}
          height={40}
          className="w-72 mx-auto"
        />
        <p className="text-darkBlue font-semibold text-md">
          The list can have up to 5 words
        </p>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-dashed rounded-lg border-[3px] border-[#6198e0] p-6 md:p-8 mt-4 mb-6 
    ${
      isDragActive ? "bg-blue-100" : "bg-skyBlue"
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
        {file && (
          <div className="mt-6">
            <Progress
              progress={progress}
              fileName={file?.name || "Uploading..."}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {aiResponse && (
        <Modal
          refreshSpellingLists={refreshSpellingLists}
          aiResponse={aiResponse}
          isOpen={isModalOpen}
          userId={user.id}
          onClose={() => {
            setFile(null);
            setProgress(0);
            setIsModalOpen(false);
          } } 
          spellingLists={[]}        />
      )}
    </div>
  );
}

export default UploadWord;
