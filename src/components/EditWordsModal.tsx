"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { SpellingListWithWords } from "@/lib/defination";
import { revalidateRoute } from "@/app/actions/revalidate";
import { processFileWithAI } from "@/app/actions/AiService";
import ConfirmationModal from "./ConfirmationModal";
import DragDropProvider from "./WordBuilder/DragDropProvider";
import { useDrag, useDrop } from "react-dnd";

const ITEM_TYPE = "EDIT_WORD_ITEM";

// Each item is either an existing DB word (dbId set) or a newly added one (dbId null)
interface WordItem {
  dbId: number | null;
  localId: number;
  word: string;
}

interface DraggableWordProps {
  item: WordItem;
  index: number;
  moveWord: (from: number, to: number) => void;
  isEditing: boolean;
  editedWord: string;
  onStartEdit: (localId: number, word: string) => void;
  onSaveEdit: (localId: number) => void;
  onEditChange: (word: string) => void;
  onDelete: (item: WordItem) => void;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  item,
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
    hover: (dragged: { index: number }) => {
      if (dragged.index !== index) {
        moveWord(dragged.index, index);
        dragged.index = index;
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

      <div className="flex-1 min-w-0 mr-1">
        {isEditing ? (
          <input
            value={editedWord}
            onChange={(e) => onEditChange(e.target.value)}
            className="text-gray-700 font-semibold w-full border-b-2 bg-transparent border-gray-200 p-1 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span className="text-gray-700 font-semibold block truncate">{item.word}</span>
        )}
      </div>

      <span
        className="cursor-pointer flex-shrink-0"
        onClick={() => {
          if (isEditing) {
            onSaveEdit(item.localId);
          } else {
            onStartEdit(item.localId, item.word);
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

      <span className="cursor-pointer ml-1 flex-shrink-0" onClick={() => onDelete(item)}>
        <Image src="/images/deleteIcon.svg" alt="Delete" width={26} height={26} />
      </span>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  listWithWords: SpellingListWithWords;
  onClose: () => void;
  userId?: string;
}

const EditWordModal: React.FC<ModalProps> = ({ isOpen, listWithWords, onClose, userId }) => {
  const [listName, setListName] = useState<string>(listWithWords.listName);
  const [loading, setLoading] = useState<boolean>(false);
  const [wordList, setWordList] = useState<WordItem[]>([]);
  const [nextLocalId, setNextLocalId] = useState<number>(1);
  const [editingLocalId, setEditingLocalId] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState<string>("");

  // Modals
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationModal, setValidationModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingDeleteItem, setPendingDeleteItem] = useState<WordItem | null>(null);

  const showValidationError = (message: string) => setValidationModal({ isOpen: true, message });

  // Identity-based comparison (by dbId), so a reorder alone is never a "word change":
  // edited = same dbId, different text; added = no dbId; removed = original dbId missing now
  const getWordChanges = () => {
    const norm = (w: string) => w.trim();
    const edited = wordList.some((w) => {
      if (w.dbId === null) return false;
      const original = listWithWords.words.find((o) => o.id === w.dbId);
      return !!original && norm(original.word) !== norm(w.word);
    });
    const added = wordList.some((w) => w.dbId === null);
    const currentIds = new Set(wordList.map((w) => w.dbId));
    const removed = listWithWords.words.some((o) => !currentIds.has(o.id));
    // Words that existed in the database but were deleted in the modal
    const deletedWordIds = listWithWords.words
      .filter((o) => !currentIds.has(o.id))
      .map((o) => o.id);
    return { hasWordsChanged: edited || added || removed, deletedWordIds };
  };

  useEffect(() => {
    const items: WordItem[] = listWithWords.words.map((w) => ({
      dbId: w.id,
      localId: w.id,
      word: w.word,
    }));
    setWordList(items);
    setListName(listWithWords.listName);
    // next local id starts after all existing db ids
    const maxId = listWithWords.words.reduce((m, w) => Math.max(m, w.id), 0);
    setNextLocalId(maxId + 1);
  }, [listWithWords]);

  const handleSaveEdit = (localId: number) => {
    if (!editedWord.trim()) {
      showValidationError("Word cannot be empty.");
      return;
    }
    const isDuplicate = wordList.some(
      (w) => w.localId !== localId && w.word.toLowerCase() === editedWord.trim().toLowerCase()
    );
    if (isDuplicate) {
      showValidationError(`"${editedWord.trim()}" is already in the list.`);
      return;
    }
    setWordList((prev) =>
      prev.map((w) => (w.localId === localId ? { ...w, word: editedWord.trim() } : w))
    );
    setEditingLocalId(null);
    setEditedWord("");
  };

  const handleAddWord = () => {
    const newLocalId = nextLocalId;
    setNextLocalId((prev) => prev + 1);
    setWordList((prev) => [...prev, { dbId: null, localId: newLocalId, word: "" }]);
    setEditingLocalId(newLocalId);
    setEditedWord("");
  };

  const initiateDelete = (item: WordItem) => {
    setPendingDeleteItem(item);
    setShowDeleteConfirmation(true);
  };

  // Deleting only removes the word from local state. The word is deleted from the
  // database on Save (see handleSave); closing without saving discards the deletion.
  const handleConfirmDelete = () => {
    if (!pendingDeleteItem) return;
    setShowDeleteConfirmation(false);

    setWordList((prev) => prev.filter((w) => w.localId !== pendingDeleteItem.localId));
    if (editingLocalId === pendingDeleteItem.localId) {
      setEditingLocalId(null);
      setEditedWord("");
    }
    setPendingDeleteItem(null);
  };

  const moveWord = useCallback((fromIndex: number, toIndex: number) => {
    setWordList((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  const initiateClose = () => {
    const originalWords = listWithWords.words.map((w) => w.word);
    const currentWords = wordList.map((w) => w.word);
    const hasChanges =
      listName !== listWithWords.listName ||
      JSON.stringify(originalWords) !== JSON.stringify(currentWords) ||
      wordList.length !== listWithWords.words.length;
    if (hasChanges) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!listName.trim()) {
      showValidationError("Please enter a name for your list.");
      return;
    }
    if (wordList.length === 0) {
      showValidationError("A list must have at least one word.");
      return;
    }
    if (wordList.some((w) => !w.word.trim())) {
      showValidationError("Please ensure all words are filled in before saving.");
      return;
    }

    // Reorder-only counts as NO word change: no AI call and nothing is written
    const { hasWordsChanged, deletedWordIds } = getWordChanges();
    const hasListNameChanged = listName !== listWithWords.listName;

    if (!hasWordsChanged && !hasListNameChanged) {
      showValidationError("There are no changes to save.");
      return;
    }

    setLoading(true);

    try {
      const modifiedWords = wordList
        .filter((w) => w.dbId !== null)
        .filter((w) => {
          const original = listWithWords.words.find((o) => o.id === w.dbId);
          return original && original.word !== w.word;
        })
        .map((w) => ({ id: w.dbId!, word: w.word }));

      const newWords = wordList.filter((w) => w.dbId === null).map((w) => w.word);
      const allWords = wordList.map((w) => w.word);

      const requestData: any = {
        userId,
        listId: listWithWords.id,
        listName,
        // Name-only (or name + reorder) saves send no words and no AI data
        words: hasWordsChanged
          ? [
              ...modifiedWords,
              ...newWords.map((word) => ({ id: null, word })),
            ]
          : [],
        extractedWords: {},
      };

      if (hasWordsChanged) {
        const response = await processFileWithAI(allWords);
        if (!response.success || !response.data) {
          setErrorMessage(response.error || "Failed to process the list.");
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        requestData.extractedWords = response.data;
      }

      // Apply the deletions the user confirmed in the modal. This runs after the AI step
      // succeeded, so an AI failure leaves the list completely untouched.
      for (const wordId of deletedWordIds) {
        const deleteResponse = await fetch(
          `/api/delete-word?wordId=${wordId}&listId=${listWithWords.id}`,
          { method: "DELETE" }
        );
        if (!deleteResponse.ok) {
          throw new Error("Failed to delete a word. Please try again.");
        }
      }

      const response = await fetch("/api/update-words", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to save the list");
      }

      await revalidateRoute("/lists");
      setShowSuccessModal(true);
      setLoading(false);
    } catch (error) {
      console.error("Error saving:", error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "An error occurred while saving. Please try again."
      );
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  const numRows = Math.max(1, Math.ceil(wordList.length / 3));

  if (!isOpen) return null;

  return (
    <DragDropProvider>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-lightBlue border-2 border-sky-300 flex flex-col rounded-md shadow-lg p-4 max-w-screen-lg w-full z-10">
          <div className="flex justify-end">
            <Button onClick={initiateClose} className="focus:outline-none">
              <Image src="/images/Vector.svg" alt="Cancel Button" width={24} height={24} className="w-6 h-6" />
            </Button>
          </div>

          <Image
            src="/images/titles/WordListTitle.svg"
            alt="Edit Spelling List"
            width={40}
            height={40}
            className="w-96 mx-auto"
          />

          <input
            type="text"
            placeholder="Enter the list name here..."
            onChange={(e) => setListName(e.target.value)}
            value={listName}
            className="w-3/4 mx-auto bg-sky-100 rounded-lg border border-[#7898D2] text-[#4A6FA5] text-lg placeholder-[#A0B6D8] px-4 py-3 mt-4 focus:outline-none"
          />

          <div className="text-center text-base mt-2">
            <p>Please review your list carefully, edit if needed, and then save it.</p>
          </div>

          <div className="m-3 rounded-md">
            <h2 className="text-center text-xl font-bold text-purple mb-4">View and Edit Your List</h2>

            {/* Column-major grid — numbers run down each column */}
            <div
              className="grid grid-cols-3 gap-3 overflow-auto max-h-80 p-4"
              style={{
                gridAutoFlow: "column",
                gridTemplateRows: `repeat(${numRows}, auto)`,
              }}
            >
              {wordList.map((item, index) => (
                <DraggableWord
                  key={item.localId}
                  item={item}
                  index={index}
                  moveWord={moveWord}
                  isEditing={editingLocalId === item.localId}
                  editedWord={editedWord}
                  onStartEdit={(localId, word) => {
                    setEditingLocalId(localId);
                    setEditedWord(word);
                  }}
                  onSaveEdit={handleSaveEdit}
                  onEditChange={setEditedWord}
                  onDelete={initiateDelete}
                />
              ))}
            </div>

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
              disabled={loading}
              size="large"
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => { setShowDeleteConfirmation(false); setPendingDeleteItem(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Word"
        message="Are you sure you want to delete this word?"
      />

      <ConfirmationModal
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => { setShowCloseConfirmation(false); onClose(); }}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close?"
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); onClose(); }}
        onConfirm={() => { setShowSuccessModal(false); onClose(); }}
        title="Success!"
        message="Your changes have been saved successfully!"
        showCancelButton={false}
      />

      <ConfirmationModal
        isOpen={validationModal.isOpen}
        onClose={() => setValidationModal({ isOpen: false, message: "" })}
        onConfirm={() => setValidationModal({ isOpen: false, message: "" })}
        title="Validation Error"
        message={validationModal.message}
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
    </DragDropProvider>
  );
};

export default EditWordModal;
