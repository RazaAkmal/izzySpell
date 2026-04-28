"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { SpellingListItem } from "@/lib/defination";
import { debounce } from "lodash";
import ConfirmationModal from "./ConfirmationModal";
import DragDropProvider from "./WordBuilder/DragDropProvider";
import { useDrag, useDrop } from "react-dnd";

const ITEM_TYPE = "WORD_ITEM";

interface WordItem {
  id: number;
  word: string;
}

interface DraggableWordProps {
  spell: WordItem;
  index: number;
  moveWord: (from: number, to: number) => void;
  isEditing: boolean;
  editedWord: string;
  onStartEdit: (id: number, word: string) => void;
  onSaveEdit: (id: number) => void;
  onEditChange: (word: string) => void;
  onDelete: (id: number) => void;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  spell,
  index,
  moveWord,
  isEditing,
  editedWord,
  onStartEdit,
  onSaveEdit,
  onEditChange,
  onDelete,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveWord(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="flex items-center bg-white rounded-2xl shadow-md p-3 cursor-grab active:cursor-grabbing min-w-0"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      {/* Drag handle */}
      <svg className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
      </svg>

      <span className="text-green bg-green bg-opacity-25 opacity-45 p-1 rounded-full text-center h-8 w-8 border-2 border-green font-bold mr-2 flex-shrink-0 flex items-center justify-center">
        {index + 1}
      </span>

      {/* Word / input — flex-1 min-w-0 keeps it from overflowing the card */}
      <div className="flex-1 min-w-0 mr-1">
        {isEditing ? (
          <input
            value={editedWord}
            onChange={(e) => onEditChange(e.target.value)}
            className="text-gray-700 font-semibold w-full border-b-2 bg-transparent border-gray-200 p-1 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span className="text-gray-700 font-semibold block truncate">{spell.word}</span>
        )}
      </div>

      <span
        className="cursor-pointer flex-shrink-0"
        onClick={() => {
          if (isEditing) {
            onSaveEdit(spell.id);
          } else {
            onStartEdit(spell.id, spell.word);
          }
        }}
      >
        <Image
          src={isEditing ? "/images/check-icon.png" : "/images/Pencilicon.svg"}
          alt="Edit"
          width={26}
          height={26}
        />
      </span>

      <span
        className="cursor-pointer ml-1 flex-shrink-0"
        onClick={() => onDelete(spell.id)}
      >
        <Image
          src="/images/deleteIcon.svg"
          alt="Delete"
          width={26}
          height={26}
        />
      </span>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  words: string[];
  suggestedListName?: string;
  onClose: () => void;
  onSave: (words: string[], listName: string) => void | Promise<void>;
  spellingLists: SpellingListItem[];
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  words,
  onClose,
  onSave,
  spellingLists,
}) => {
  const [listName, setListName] = useState<string>("");
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [spellList, setSpellList] = useState<WordItem[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [editingSpellId, setEditingSpellId] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationModal, setValidationModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showValidationError = (message: string) => setValidationModal({ isOpen: true, message });

  useEffect(() => {
    if (words) {
      setSpellList(words.map((word, index) => ({ id: index + 1, word })));
      setNextId(words.length + 1);
      setListName("");
    }
  }, [words]);

  const handleClose = () => setShowConfirmation(true);

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    setListName("");
    setSpellList([]);
    onClose();
  };

  const handleSaveEdit = (id: number) => {
    if (!editedWord.trim()) {
      showValidationError("Word cannot be empty.");
      return;
    }
    const isDuplicate = spellList.some(
      (spell) => spell.id !== id && spell.word.toLowerCase() === editedWord.trim().toLowerCase()
    );
    if (isDuplicate) {
      showValidationError(`"${editedWord.trim()}" is already in the list.`);
      return;
    }
    setSpellList((prev) =>
      prev.map((spell) => (spell.id === id ? { ...spell, word: editedWord.trim() } : spell))
    );
    setEditingSpellId(null);
    setEditedWord("");
  };

  const handleAddWord = () => {
    const newId = nextId;
    setNextId((prev) => prev + 1);
    setSpellList((prev) => [...prev, { id: newId, word: "" }]);
    setEditingSpellId(newId);
    setEditedWord("");
  };

  const handleDeleteWord = (id: number) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId === null) return;
    setSpellList((prev) => prev.filter((spell) => spell.id !== pendingDeleteId));
    if (editingSpellId === pendingDeleteId) {
      setEditingSpellId(null);
      setEditedWord("");
    }
    setPendingDeleteId(null);
  };

  const moveWord = useCallback((fromIndex: number, toIndex: number) => {
    setSpellList((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  const handleSave = async () => {
    if (isSaving) return;
    if (!listName.trim()) {
      showValidationError("Please enter a name for your list.");
      return;
    }
    if (spellList.some((spell) => !spell.word.trim())) {
      showValidationError("Please ensure all words are filled in before saving.");
      return;
    }
    try {
      setIsSaving(true);
      await onSave(spellList.map((spell) => spell.word), listName);
    } finally {
      setIsSaving(false);
    }
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

  const numRows = Math.max(1, Math.ceil(spellList.length / 3));

  if (!isOpen) return null;

  return (
    <DragDropProvider>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-lightBlue border-2 border-sky-300 flex flex-col rounded-md shadow-lg p-4 max-w-screen-lg w-full z-10">
          {/* Close Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleClose}
              disabled={isSaving}
              className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="/images/Vector.svg" alt="Cancel Button" width={24} height={24} className="w-6 h-6" />
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
            required
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

            {/* Words grid — column-major flow so numbers run down each column */}
            <div
              className="grid grid-cols-3 gap-3 overflow-auto max-h-80 p-4"
              style={{
                gridAutoFlow: "column",
                gridTemplateRows: `repeat(${numRows}, auto)`,
              }}
            >
              {spellList.map((spell, index) => (
                <DraggableWord
                  key={spell.id}
                  spell={spell}
                  index={index}
                  moveWord={moveWord}
                  isEditing={editingSpellId === spell.id}
                  editedWord={editedWord}
                  onStartEdit={(id, word) => {
                    setEditingSpellId(id);
                    setEditedWord(word);
                  }}
                  onSaveEdit={handleSaveEdit}
                  onEditChange={setEditedWord}
                  onDelete={handleDeleteWord}
                />
              ))}
            </div>

            {/* Add Word */}
            <div className="flex justify-center mt-3">
              <button
                onClick={handleAddWord}
                className="flex items-center gap-2 text-purple border-2 border-purple rounded-full px-4 py-2 hover:bg-purple hover:text-white transition-colors font-semibold"
              >
                <span className="text-xl leading-none">+</span>
                <span>Add Word</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <CustomButton
              label="Save & Start Learning"
              fullWidth={false}
              onClick={handleSave}
              size="large"
              disabled={isInvalid || !listName.trim() || isSaving}
              loading={isSaving}
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

      <ConfirmationModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Word"
        message="Are you sure you want to delete this word?"
      />

      <ConfirmationModal
        isOpen={validationModal.isOpen}
        onClose={() => setValidationModal({ isOpen: false, message: "" })}
        onConfirm={() => setValidationModal({ isOpen: false, message: "" })}
        title="Validation Error"
        message={validationModal.message}
        showCancelButton={false}
      />
    </DragDropProvider>
  );
};

export default Modal;
