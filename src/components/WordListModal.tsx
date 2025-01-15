import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { revalidateRoute } from "@/app/actions/revalidate";
import { SpellingListItem } from "@/lib/defination";
import { debounce } from "lodash";

interface ModalProps {
  isOpen: boolean;
  aiResponse: {
    OriginalWords: string[];
  };
  onClose: () => void;
  userId?: string;
  spellingLists: SpellingListItem[];
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  aiResponse,
  onClose,
  userId,
  spellingLists,
}) => {
  const [listName, setListName] = useState<string>("");
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [spellList, setSpellList] = useState<{ id: number; word: string }[]>(
    []
  );
  const [editingSpellId, setEditingSpellId] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState<string>("");
  console.log(aiResponse);
  // Initialize spell list when the modal opens with AI response data
  useEffect(() => {
    if (aiResponse?.OriginalWords) {
      setSpellList(
        aiResponse.OriginalWords.map((word, index) => ({ id: index + 1, word }))
      );
    }
  }, [aiResponse]);

  const handleSaveEdit = (id: number) => {
    if (!editedWord.trim()) {
      alert("Spell cannot be empty!");
      return;
    }
    setSpellList((prevList) =>
      prevList.map((spell) =>
        spell.id === id ? { ...spell, word: editedWord } : spell
      )
    );

    setEditingSpellId(null);
    setEditedWord("");
  };

  const handleSave = async () => {
    if (spellList.some((spell) => !spell.word.trim()) || !listName.trim()) {
      alert(
        "Please ensure all spells are valid and the list name is provided."
      );
      return;
    }
    setLoading(true)
    try {
      console.log({
        listName,
        words: spellList.map((spell) => spell.word),
        extractedWords: aiResponse,
        userId: userId,
      });
      // Example API call to save the list
      const response = await fetch("/api/save-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listName,
          words: spellList.map((spell) => spell.word),
          extractedWords: aiResponse,
          userId: userId,
        }),
      });
      await revalidateRoute("/dashboard");

      if (!response.ok) {
        throw new Error("Failed to save the list");
      }

      setListName("");
      alert("Your list has been saved successfully!");
      setLoading(false)
      onClose(); // Close the modal after saving
    } catch (error) {
      setLoading(false)
      console.error("Error saving the list:", error);
      alert("An error occurred while saving the list. Please try again.");
    }
  };

  //for validation
  const debouncedValidation = useMemo(() => 
    debounce((inputName: string) => {
      if (
        spellingLists.some(
          (list) => list.listName.toLowerCase() === inputName.toLowerCase()
        )
      ) {
        setIsInvalid(true);
      } else {
        setIsInvalid(false);
      }
    }, 300),
    [spellingLists, setIsInvalid] // Include all dependencies
  );
  
  const handleListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputName = e.target.value;
    setListName(inputName);
    debouncedValidation(inputName); // Call the debounced validation function
  };

  if (!isOpen) return null;

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-lightBlue border-2 border-sky-300 flex flex-col rounded-md shadow-lg p-4 max-w-screen-lg w-full z-10">
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

          {/* Title */}
          <Image
            src="/images/titles/WordListTitle.svg"
            alt="Add Spelling List"
            width={40}
            height={40}
            className="w-96 mx-auto"
          />

          {/* Input Field */}
          <input
            type="text"
            placeholder="Enter the list name here..."
            onChange={handleListNameChange}
            value={listName}
            className={`w-3/4 mx-auto bg-sky-100 rounded-lg border ${
              isInvalid ? "border-red-500 border-2" : "border-[#7898D2]"
            } text-[#4A6FA5] text-lg placeholder-[#A0B6D8] px-4 py-3 mt-4 focus:outline-none 
              
            }`}
          />
          {isInvalid && (
            <p className="text-red-500 text-sm mt-1 text-center">
              A list with this name already exists. Please enter unique name.
            </p>
          )}
          <div className="text-center text-base mt-2">
            <p>
              Please review your list carefully, edit if needed, and then save
              it.
            </p>
          </div>

          <div className="m-3 rounded-md">
            <h2 className="text-center text-xl font-bold text-purple mb-4">
              View and Edit Your List
            </h2>
            <div className="grid grid-cols-3 gap-3 overflow-auto h-auto max-h-80 p-4">
              {spellList.map((spell) => (
                <div
                  key={spell.id}
                  className="flex items-center justify-start bg-white rounded-2xl shadow-md p-3"
                >
                  <span className="text-green bg-green bg-opacity-25 opacity-45 p-1 rounded-full text-center h-8 w-8 border-2 border-green font-bold mr-3">
                    {spell.id}
                  </span>
                  {editingSpellId === spell.id ? (
                    <input
                      value={editedWord}
                      onChange={(e) => setEditedWord(e.target.value)}
                      className="text-gray-700 font-semibold border-b-2 bg-transparent border-gray-200 p-1 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-700 font-semibold">
                      {spell.word}
                    </span>
                  )}
                  <span
                    className="cursor-pointer ml-auto"
                    onClick={() => {
                      if (editingSpellId === spell.id) {
                        handleSaveEdit(spell.id);
                      } else {
                        setEditingSpellId(spell.id);
                        setEditedWord(spell.word);
                      }
                    }}
                  >
                    <Image
                      src={
                        editingSpellId === spell.id
                          ? "/images/check-icon.png"
                          : "/images/Pencilicon.svg"
                      }
                      alt="Edit Icon"
                      width={30}
                      height={30}
                      className="mx-auto"
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <CustomButton
              label="Save & Start Learning"
              fullWidth={false}
              onClick={handleSave}
              size="large"
              disabled={isInvalid || loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
