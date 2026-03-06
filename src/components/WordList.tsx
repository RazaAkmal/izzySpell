"use client";
import React, { useState, useEffect } from "react";
import CustomButton from "./HeadlessButton";
import Image from "next/image";
import ToggleButton from "./CustomToggleButton";
import { Textarea } from "@headlessui/react";
import Modal from "@/components/WordListModal";
import Progress from "./Progress";
import { processFileWithAI } from "@/app/actions/AiService";
import { SpellingListItem, responseSchema } from "@/lib/defination";
import ConfirmationModal from "@/components/ConfirmationModal";
import { z } from "zod";

// Define type for AI response based on the zod schema
type AIResponse = z.infer<typeof responseSchema>;

const WordList = ({ spellingLists, user, refreshSpellingLists }: {
  spellingLists: SpellingListItem[],
  user: any,
  refreshSpellingLists: () => Promise<void>;
}) => {
  const [isTextAreaMode, setIsTextAreaMode] = useState(false);
  const [inputField, setInputField] = useState<string[]>(["", "", ""]);
  const [textAreaContent, setTextAreaContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSwitchModeModal, setShowSwitchModeModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Add new input field
  const handleInputField = () => {
    setInputField([...inputField, ""]);
  };

  // Handle input field changes
  const handleInputChange = (index: number, value: string) => {
    const updatedFields = [...inputField];
    updatedFields[index] = value;
    setInputField(updatedFields);
  };

  const handleModalSave = async (words: string[], listName: string) => {
    if (!aiResponse) return;
    try {
      const saveResponse = await fetch("/api/save-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listName,
          words,
          extractedWords: aiResponse,
          userId: user.id,
        }),
      });
      if (!saveResponse.ok) throw new Error("Failed to save the list");
      await refreshSpellingLists();
      setInputField(["", "", ""]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Save data to API and handle modal
  const handleSave = async () => {
    localStorage.removeItem("isNavigate");
    const wordList = isTextAreaMode
      ? textAreaContent
          .split("\n")
          .map((word) => word.trim())
          .filter((word) => word !== "")
      : inputField
          .filter((word) => word.trim() !== "")
          .map((word) => word.trim());

    if (wordList.length === 0) {
      setErrorMessage("Please enter a word.");
      setShowValidationModal(true);
      return;
    }

    setLoading(true);
    setProgress(0);

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
      const response = await processFileWithAI(wordList.join(", "));
      if (response.success && response.data) {
        setProgress(100);
        clearInterval(uploadInterval);
        setTimeout(() => {
          setAiResponse(response.data);
          setIsModalOpen(true);
        }, 1000);
        setTextAreaContent("")
        setInputField(["", "", ""])
      } else {
        setErrorMessage(response.error || "Error processing file with AI");
        setShowErrorModal(true);
        clearInterval(uploadInterval);
        setProgress(0);
      }
    } catch (error) {
      console.error("Error saving words:", error);
      setErrorMessage("Error processing file with AI, Please Try again");
      setShowErrorModal(true);
    } finally {
      clearInterval(uploadInterval);
      setProgress(100);
      setLoading(false);
    }
  };

  const handelSwitchBulkMode = (mode: boolean) => {
    if (mode) {
      setShowSwitchModeModal(true);
    } else {
      setIsTextAreaMode(mode);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (textAreaContent.trim() !== "" || inputField.some((word) => word.trim() !== "")) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [inputField, textAreaContent]);

  useEffect(() => {
    if (textAreaContent.trim() !== "" || inputField.some((word) => word.trim() !== "")) {
      localStorage.setItem("isNavigate", 'false');
    } else {
      localStorage.setItem("isNavigate", 'true');
    }
  }, [inputField, textAreaContent, isTextAreaMode]);

  return (
    <div className="flex flex-wrap bg-skyBlue rounded-2xl w-full md:m-4 p-4 md:p-2">
      <div className="text-center mx-auto max-w-full md:max-w-lg">
        {/* Title Section */}
        <div className="relative flex items-center">
          <Image
            src="/images/titles/MakeSpellingListTitle.svg"
            alt="Add Spelling List"
            width={300}
            height={40}
            className="mx-auto"
          />
        </div>

        {/* Toggle Button Section */}
        <div className="flex items-center justify-center space-x-4">
          <span className="text-darkBlue font-semibold text-md">
            {isTextAreaMode
              ? "Enter Your Words (Separate by Comma or One Per Line)"
              : "Bulk Entry: Tap the Toggle to Add Multiple Words at Once:"}
          </span>
          {!isTextAreaMode && <ToggleButton
            isOn={isTextAreaMode}
            toggleSwitch={() => handelSwitchBulkMode(!isTextAreaMode)}
          />}
        </div>

        {/* Conditional Rendering Section */}
        <div className="w-full flex flex-col items-center mt-6 space-y-4 text-center">
          {isTextAreaMode ? (
            <Textarea
              rows={8}
              value={textAreaContent}
              onChange={(e) => setTextAreaContent(e.target.value)}
              className="w-5/6 p-4 md:w-3/4 lg:w-full border-[2px] border-[#98C3FF] mx-auto text-base md:text-base bg-skyBlue text-textColor rounded-2xl focus:outline-none resize-none placeholder-textColor"
            />
          ) : (
            <>
              {/* for display the inputs */}
              <div className="overflow-y-auto h-48 mb-4 custom-scrollbar space-y-3">
                {inputField.map((field, index) => (
                  <input
                    key={index}
                    type="text"
                    value={field}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder="Type your Word"
                    className="w-5/6 p-2 md:w-3/4 lg:w-5/6 border-[2px] border-[#98C3FF] rounded-2xl mx-auto text-base md:text-base text-center text-textColor focus:outline-none placeholder-textColor"
                  />
                ))}
              </div>
              <div
                className="relative flex items-center justify-center border-[4px] bg-white border-green rounded-2xl py-1 hover:shadow-lg cursor-pointer w-44 lg:w-64"
                onClick={handleInputField}
              >
                <button className="flex items-center justify-center bg-green w-7 h-7 bg-green-400 text-white rounded-full text-3xl font-bold hover:bg-green-500">
                  +
                </button>
                <span className="ml-3 text-base md:text-base text-green-700 font-medium text-green">
                  Add More Words
                </span>
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <CustomButton
          fullWidth={true}
          size="large"
          label="Save the Word List"
          className="mt-3"
          onClick={handleSave}
          disabled={loading}
        />

        {loading && (
          <div className="mt-4">
            <Progress progress={progress} fileName={""} />
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onConfirm={() => setShowValidationModal(false)}
        title="Validation Error"
        message={errorMessage}
        showCancelButton={false}
      />

      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        showCancelButton={false}
      />

      <ConfirmationModal
        isOpen={showSwitchModeModal}
        onClose={() => setShowSwitchModeModal(false)}
        onConfirm={() => {
          setTextAreaContent(inputField.join("\n").trim());
          setIsTextAreaMode(true);
          setShowSwitchModeModal(false);
        }}
        title="Switch to Bulk Entry"
        message="Switching to Bulk Entry! You can add lots of words at once, but you won't be able to go back to one-at-a-time. Continue?"
      />

      {/* Existing Modal */}
      {aiResponse && (
        <Modal
          isOpen={isModalOpen}
          words={aiResponse.OriginalWords}
          suggestedListName={aiResponse.ListName}
          onSave={handleModalSave}
          onClose={() => {
            setInputField(["", "", ""]);
            setIsModalOpen(false);
          }}
          spellingLists={spellingLists}
        />
      )}
    </div>
  );
};

export default WordList;
