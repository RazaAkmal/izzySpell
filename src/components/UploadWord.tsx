"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import CustomButton from "./HeadlessButton";
import Image from "next/image";
import Modal from "@/components/WordListModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { readFileContent } from "@/app/utils/fileReaderUtil";
import { extractWordsFromContent, processFileWithAI } from "@/app/actions/AiService";

type AIResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

function UploadWord({ user, refreshSpellingLists, onProcessingChange }: {
  user: any;
  refreshSpellingLists: () => Promise<void>;
  onProcessingChange: (processing: boolean) => void;
}) {
  const router = useRouter();
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{ ListName: string; OriginalWords: string[] } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    setIsExtracting(true);

    try {
      const rawWords = await readFileContent(uploadedFile);

      if (!rawWords || rawWords.length === 0) {
        setErrorMessage("The file content is empty or could not be read. Please try another file.");
        setShowErrorModal(true);
        return;
      }

      // Part 1: cheap gpt-4o-mini call — filter to valid English words + suggest list name
      const extraction = await extractWordsFromContent(rawWords);

      if (!extraction.success || !extraction.data) {
        setErrorMessage(extraction.error || "Failed to extract words from the file.");
        setShowErrorModal(true);
        return;
      }

      if (extraction.data.OriginalWords.length === 0) {
        setErrorMessage("No valid English words were found in the file. Please try another file.");
        setShowErrorModal(true);
        return;
      }

      setExtractedData(extraction.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("File read error:", error);
      setErrorMessage("Failed to read the file. Please try another file.");
      setShowErrorModal(true);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // Called when user clicks "Save & Start Learning" in the modal
  const handleSave = useCallback(async (words: string[], listName: string) => {
    setIsModalOpen(false);
    setIsProcessing(true);
    setProcessingProgress(0);

    // Eased progress: starts faster, slows as it approaches 90%, never exceeds it
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.max(0.5, (90 - prev) * 0.07);
        return Math.min(90, parseFloat((prev + increment).toFixed(1)));
      });
    }, 600);

    try {
      const content = words.join(", ");
      const response: AIResponse = await processFileWithAI(content);
      clearInterval(interval);

      if (!response.success || !response.data) {
        setErrorMessage(response.error || "Error processing file");
        setShowErrorModal(true);
        setIsProcessing(false);
        setProcessingProgress(0);
        return;
      }

      const saveResponse = await fetch("/api/save-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listName,
          words,
          extractedWords: response.data,
          userId: user.id,
        }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save the list");

      await refreshSpellingLists();
      setProcessingProgress(100);
      setIsDone(true);

      // Show success for 3s, then redirect to /lists
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          router.push("/lists");
        }, 500);
      }, 3000);

    } catch (error) {
      clearInterval(interval);
      console.error("Save error:", error);
      setErrorMessage("An unexpected error occurred while saving. Please try again.");
      setShowErrorModal(true);
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [user.id, refreshSpellingLists, router]);

  useEffect(() => {
    onProcessingChange(isExtracting || isProcessing || isDone);
  }, [isExtracting, isProcessing, isDone, onProcessingChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg"],
      "image/png": [".png"],
    },
    multiple: false,
  });

  return (
    <div className="flex bg-skyBlue rounded-2xl w-full md:m-4 p-4 md:p-3">
      <div className="text-center mx-auto w-full max-w-full md:max-w-lg">
        {/* Title Image */}
        <Image
          src="/images/titles/AddSpellingListTitle.svg"
          alt="Add Spelling List"
          width={554}
          height={90}
          className="w-72 mx-auto"
        />

        {/* Dropzone */}
        <div
          {...(!isExtracting && !isProcessing && !isDone ? getRootProps() : {})}
          className={`border-dashed rounded-lg border-[3px] border-[#6198e0] p-6 md:p-8 mt-4 mb-6
            w-full min-h-[320px]
            ${isDragActive ? "bg-blue-100" : "bg-skyBlue"}
            flex flex-col items-center justify-center mx-auto max-w-3xl`}
        >
          {isExtracting ? (
            /* Step 1: Reading file */
            <div className={`flex flex-col items-center gap-4 transition-opacity duration-500 ${isFadingOut ? "opacity-0" : "opacity-100"}`}>
              <div className="w-10 h-10 rounded-full border-4 border-blue border-t-transparent animate-spin" />
              <p className="text-blue font-bold text-lg">Extracting your spelling words...</p>
              <p className="text-darkBlue text-sm">Filtering to valid English words, just a moment</p>
            </div>

          ) : isProcessing && processingProgress < 100 ? (
            /* Step 3a: AI processing + saving */
            <div className={`w-full flex flex-col items-center gap-4 py-2 transition-opacity duration-500 ${isFadingOut ? "opacity-0" : "opacity-100"}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-blue border-t-transparent animate-spin" />
                <p className="text-blue font-bold text-lg">Saving your Spelling List...</p>
              </div>
              <p className="text-darkBlue text-sm">Processing and saving your words</p>
              <div className="w-full">
                <div className="flex justify-between text-sm font-semibold text-darkGray mb-1">
                  <span>Progress</span>
                  <span>{processingProgress}%</span>
                </div>
                <div className="w-full h-4 bg-cyan-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green transition-all duration-300 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            </div>

          ) : isDone ? (
            /* Step 3b: Complete */
            <div className={`flex flex-col items-center gap-3 transition-opacity duration-500 ${isFadingOut ? "opacity-0" : "opacity-100"}`}>
              <div className="w-16 h-16 rounded-full bg-green flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-green font-bold text-lg">Spelling List Saved!</p>
              <p className="text-darkBlue text-sm">Your list is ready to use</p>
            </div>

          ) : (
            /* Default: upload UI */
            <>
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
                width={648}
                height={90}
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
            </>
          )}
        </div>
      </div>

      {/* Word List Modal — opens after Part 1 extraction with clean words */}
      {extractedData && (
        <Modal
          isOpen={isModalOpen}
          words={extractedData.OriginalWords}
          suggestedListName={extractedData.ListName}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setExtractedData(null);
          }}
          spellingLists={[]}
        />
      )}

      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        showCancelButton={false}
      />
    </div>
  );
}

export default UploadWord;
