import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { SpellingListItem } from "@/lib/defination";
import { debounce } from "lodash";
import ConfirmationModal from "./ConfirmationModal";

interface ModalProps {
  isOpen: boolean;
  words: string[];
  suggestedListName?: string;
  onClose: () => void;
  onSave: (words: string[], listName: string) => void;
  spellingLists: SpellingListItem[];
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  words,
  suggestedListName,
  onClose,
  onSave,
  spellingLists,
}) => {
  const [listName, setListName] = useState<string>(suggestedListName ?? "");
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [spellList, setSpellList] = useState<{ id: number; word: string }[]>([]);
  const [editingSpellId, setEditingSpellId] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (words) {
      setSpellList(words.map((word, index) => ({ id: index + 1, word })));
    }
  }, [words]);

  useEffect(() => {
    if (suggestedListName) setListName(suggestedListName);
  }, [suggestedListName]);

  const handleClose = () => {
    setShowConfirmation(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    setListName("");
    setSpellList([]);
    onClose();
  };

  const handleSaveEdit = (id: number) => {
    if (!editedWord.trim()) {
      alert("Word cannot be empty!");
      return;
    }
    setSpellList((prev) =>
      prev.map((spell) => (spell.id === id ? { ...spell, word: editedWord } : spell))
    );
    setEditingSpellId(null);
    setEditedWord("");
  };

  const handleSave = () => {
    if (spellList.some((spell) => !spell.word.trim()) || !listName.trim()) {
      alert("Please ensure all words are valid and the list name is provided.");
      return;
    }
    onSave(spellList.map((spell) => spell.word), listName);
  };

  const debouncedValidation = useMemo(() =>
    debounce((inputName: string) => {
      setIsInvalid(
        spellingLists.some(
          (list) => list.listName.toLowerCase() === inputName.toLowerCase()
        )
      );
    }, 300),
    [spellingLists]
  );

  const handleListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListName(e.target.value);
    debouncedValidation(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-lightBlue border-2 border-sky-300 flex flex-col rounded-md shadow-lg p-4 max-w-screen-lg w-full z-10">
          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={handleClose} className="focus:outline-none">
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

          {/* List Name Input */}
          <input
            type="text"
            placeholder="Enter the list name here..."
            onChange={handleListNameChange}
            value={listName}
            className={`w-3/4 mx-auto bg-sky-100 rounded-lg border ${
              isInvalid ? "border-red-500 border-2" : "border-[#7898D2]"
            } text-[#4A6FA5] text-lg placeholder-[#A0B6D8] px-4 py-3 mt-4 focus:outline-none`}
          />
          {isInvalid && (
            <p className="text-red-500 text-sm mt-1 text-center">
              A list with this name already exists. Please enter a unique name.
            </p>
          )}

          <div className="text-center text-base mt-2">
            <p>Please review your list carefully, edit if needed, and then save it.</p>
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
                      className="text-gray-700 font-semibold w-[80%] border-b-2 bg-transparent border-gray-200 p-1 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-700 font-semibold">{spell.word}</span>
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
                      src={editingSpellId === spell.id ? "/images/check-icon.png" : "/images/Pencilicon.svg"}
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
              disabled={isInvalid || !listName.trim()}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmClose}
        title="Close Confirmation"
        message="Are you sure you want to close? Your extracted words will be lost."
      />
    </div>
  );
};

export default Modal;
