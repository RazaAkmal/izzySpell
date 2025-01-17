import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@headlessui/react";
import CustomButton from "./HeadlessButton";
import { SpellingListWithWords } from "@/lib/defination";
import { revalidateRoute } from "@/app/actions/revalidate";
import { processFileWithAI } from "@/app/actions/AiService";

interface ModalProps {
  isOpen: boolean;
  listWithWords: SpellingListWithWords;
  onClose: () => void;
  userId?: string;
}

const EditWordModal: React.FC<ModalProps> = ({
  isOpen,
  listWithWords,
  onClose,
  userId,
}) => {
  const [listName, setListName] = useState<string>(listWithWords.listName);
  const [loading, setLoading] = useState<boolean>(false);
  const [spellList, setSpellList] = useState(listWithWords.words);
  const [modifiedWords, setModifiedWords] = useState<
    { id: number; word: string }[]
  >([]);
  const [newWords, setNewWords] = useState<string[]>([]);

  const handleWordChange = (id: number, newWord: string) => {
    setSpellList((prevList) =>
      prevList.map((spell) =>
        spell.id === id ? { ...spell, word: newWord } : spell
      )
    );

    setModifiedWords((prevModifiedWords) => {
      const isAlreadyModified = prevModifiedWords.some(
        (word) => word.id === id
      );
      if (isAlreadyModified) {
        return prevModifiedWords.map((word) =>
          word.id === id ? { ...word, word: newWord } : word
        );
      } else {
        return [...prevModifiedWords, { id, word: newWord }];
      }
    });
  };

  const handleNewWordChange = (index: number, newWord: string) => {
    setNewWords((prevNewWords) =>
      prevNewWords.map((word, i) => (i === index ? newWord : word))
    );
  };

  const addNewWordField = () => {
    setNewWords((prevNewWords) => [...prevNewWords, ""]);
  };

  useEffect(() => {
    setSpellList(listWithWords.words);
    setListName(listWithWords.listName);
  }, [listWithWords]);

  const handleDelete = async (wordId: number) => {
    const confirmed = confirm("Are you sure you want to delete this word?");
    if (!confirmed) return;
    setLoading(true)
    try {
      // Call the delete API route
      await fetch(
        `/api/delete-word?wordId=${wordId}&&listId=${listWithWords.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSpellList(spellList.filter((word) => word.id !== wordId));
      setLoading(false)
      await revalidateRoute("/lists");
    } catch (error) {
      setLoading(false)
      console.error("Error deleting word:", error);
      alert("Failed to delete the word. Please try again.");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    if (
      modifiedWords.some((word) => !word.word.trim()) ||
      !listName.trim() ||
      newWords.some((word) => !word.trim())
    ) {
      alert("Please ensure all words are valid and the list name is provided.");
      return;
    }
    // Check if the spelling list has changed
    const originalWordsString = JSON.stringify(
      listWithWords.words.map((word) => word.word)
    );
    const currentWordsString = JSON.stringify(
      spellList.map((word) => word.word)
    );

    const hasWordsChanged =
      originalWordsString !== currentWordsString || newWords.length > 0;

    try {
      if (hasWordsChanged) {
        const mergedWordsString = `${currentWordsString} ${newWords.join(" ")}`;

        const response = await processFileWithAI(mergedWordsString);
        const AIResponse = await response.data;
        if (!response.success) {
          alert(`${response.error}`);
          return;
        }
        try {
          const requestData = {
            userId,
            listId: listWithWords.id,
            listName,
            words: [
              ...modifiedWords,
              ...newWords.map((word) => ({ id: null, word })),
            ],
            extractedWords: AIResponse, // Object containing syllable and grouped words
          };
          const response = await fetch("/api/update-words", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });

          if (!response.ok) {
            throw new Error("Failed to save the list");
          }

          alert("Your changes have been saved successfully!");
          await revalidateRoute("/lists");
          setModifiedWords([]);
          setNewWords([]);
          setLoading(false);
          onClose();
        } catch (error) {
          console.error("Error saving the list:", error);
          setLoading(false);
          alert("An error occurred while saving the list. Please try again.");
        }
        return;
      } else {
        alert("There is no change to save");
        setLoading(false);
        return;
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving the list:", error);
      alert(
        "An unexpected error occurred while processing the file. Please try again."
      );
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

          {/* Editable Word List */}
          <div className="m-3 rounded-md ">
            <h2 className="text-center text-xl font-bold text-purple mb-4">
              View and Edit Your List
            </h2>
            <div className="grid grid-cols-3 gap-3 overflow-auto h-auto max-h-80 p-4">
              {spellList.map((spell, index) => (
                <div
                  key={spell.id}
                  className="flex items-center gap-3 justify-start bg-white rounded-2xl shadow-md p-3"
                >
                  <span className="text-green bg-green bg-opacity-25 opacity-45 p-1 rounded-full text-center  h-8 w-8 border-2 border-green font-bold">
                    {index + 1}
                  </span>
                  <input
                    value={spell.word}
                    onChange={(e) => handleWordChange(spell.id, e.target.value)}
                    className="text-gray-700 font-semibold border-b-2 bg-transparent border-gray-200 p-1 focus:outline-none focus:border-blue-500"
                  />
                  <Image
                    src="/images/deleteIcon.svg"
                    alt="deleteIcon"
                    width={30}
                    height={30}
                    className="cursor-pointer"
                    onClick={() => handleDelete(spell.id)}
                  />
                </div>
              ))}

              {newWords.map((word, index) => (
                <div
                  key={`new-word-${index}`}
                  className="flex items-center justify-start bg-white rounded-2xl shadow-md p-3"
                >
                  <span className="text-gray-500 bg-gray-200 p-1 rounded-full text-center h-8 w-8 font-bold mr-3">
                    {spellList.length + index + 1}
                  </span>
                  <input
                    value={word}
                    onChange={(e) => handleNewWordChange(index, e.target.value)}
                    className="text-gray-700 font-semibold border-b-2 bg-transparent border-gray-200 p-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <CustomButton
                label="Add New Word"
                fullWidth={false}
                onClick={addNewWordField}
                size="small"
              />
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
    </div>
  );
};

export default EditWordModal;
