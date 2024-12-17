import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { SpellingListWithWords } from "@/lib/defination";
import { revalidateRoute } from "@/app/actions/revalidate";

interface ModalProps {
  isOpen: boolean;
  listWithWords: SpellingListWithWords;
  onClose: () => void;
  userId?: string;
}

const EditWordModal: React.FC<ModalProps> = ({ isOpen, listWithWords, onClose, userId }) => {
  const [listName, setListName] = useState<string>(listWithWords.listName);
  const [spellList, setSpellList] = useState(listWithWords.words);
  const [modifiedWords, setModifiedWords] = useState<{ id: number; word: string }[]>([]);

  const handleWordChange = (id: number, newWord: string) => {
    setSpellList((prevList) =>
      prevList.map((spell) =>
        spell.id === id ? { ...spell, word: newWord } : spell
      )
    );

    // Track modified words
    setModifiedWords((prevModifiedWords) => {
      const isAlreadyModified = prevModifiedWords.some((word) => word.id === id);
      if (isAlreadyModified) {
        return prevModifiedWords.map((word) =>
          word.id === id ? { ...word, word: newWord } : word
        );
      } else {
        return [...prevModifiedWords, { id, word: newWord }];
      }
    });
  };

  useEffect(() => {
    setSpellList(listWithWords.words)
    setListName(listWithWords.listName)
  }, [listWithWords])

  const handleSave = async () => {
    if (modifiedWords.some((word) => !word.word.trim()) || !listName.trim()) {
      alert("Please ensure all words are valid and the list name is provided.");
      return;
    }

    try {
      const response = await fetch("/api/update-words", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listId: listWithWords.id,
          listName,
          words: modifiedWords,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save the list");
      }

      alert("Your changes have been saved successfully!");
      await revalidateRoute('/lists');
      setModifiedWords([]); 
      onClose();
    } catch (error) {
      console.error("Error saving the list:", error);
      alert("An error occurred while saving the list. Please try again.");
    }
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
            src="/images/titles/Please Enter a Name for Your Word List.svg"
            alt="Add Spelling List"
            width={40}
            height={40}
            className="w-96 mx-auto"
          />

          {/* Input Field */}
          <input
            type="text"
            placeholder="Enter the list name here..."
            onChange={(e) => setListName(e.target.value)}
            value={listName}
            className="w-3/4 mx-auto bg-sky-100 rounded-lg border border-[#7898D2] text-[#4A6FA5] text-lg placeholder-[#A0B6D8] px-4 py-3 mt-4 focus:outline-none focus:ring-2 focus:ring-[#7898D2]"
          />
          <div className="text-center text-base mt-2">
            <p>Please review your list carefully, edit if needed, and then save it.</p>
          </div>

          {/* Editable Word List */}
          <div className="m-3 rounded-md">
            <h2 className="text-center text-xl font-bold text-purple mb-4">
              View and Edit Your List
            </h2>
            <div className="grid grid-cols-3 gap-3 overflow-auto h-auto max-h-screen p-4">
              {spellList.map((spell) => (
                <div
                  key={spell.id}
                  className="flex items-center justify-start bg-white rounded-2xl shadow-md p-3"
                >
                  <span className="text-green bg-green bg-opacity-25 opacity-45 p-1 rounded-full text-center h-8 w-8 border-2 border-green font-bold mr-3">
                    {spell.id}
                  </span>
                  <input
                    value={spell.word}
                    onChange={(e) => handleWordChange(spell.id, e.target.value)}
                    className="text-gray-700 font-semibold border-b-2 bg-transparent border-gray-200 p-1 focus:outline-none focus:border-blue-500"
                    />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-4">
            <CustomButton
              label="Save & Start Learning"
              fullWidth={false}
              onClick={handleSave}
              size="large"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWordModal;
