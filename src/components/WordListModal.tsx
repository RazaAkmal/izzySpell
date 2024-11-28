import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import spells from "@/app/Data/spells.json";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [listName, setListName] = useState<string>("");
  const [spellList, setSpellList] = useState(spells);
  console.log("spell list", spellList);
  const [editingSpellId, setEditingSpellId] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState<string>("");

  const handleSaveEdit = (id: number) => {
    if (!editedWord.trim()) {
      alert("Spell cannot be empty!");
      return;
    }
    setSpellList((preList) =>
      preList.map((spell) =>
        spell.id == id ? { ...spell, word: editedWord } : spell
      )
    );

    setEditingSpellId(null);
    setEditedWord("");
  };

  const handleSave = () => {
    if (spellList.some((spell) => !spell.word.trim()) || !listName) {
      alert("Please ensure all spells are valid before saving and List name.");
      return;
    }
    alert("Your list has been saved successfully!");
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-lightBlue  border-2 border-sky-300 flex flex-col rounded-md shadow-lg p-4 max-w-screen-lg w-full z-10">
          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="focus:outline-none">
              <Image
                src="/images/Vector.svg"
                alt="Cancel Button"
                width={24}
                height={24}
                className="w-6 h-6 "
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
            <p>
              Please review your list carefully, edit if needed, and then save
              it.
            </p>
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

          {/* Spell List */}
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
                  {editingSpellId === spell.id ? (
                    <input
                      value={editedWord}
                      onChange={(e) => setEditedWord(e.target.value)}
                      className="text-gray-700 font-semibold border rounded p-1 w-28"
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
        </div>
      </div>
    </div>
  );
};

export default Modal;
