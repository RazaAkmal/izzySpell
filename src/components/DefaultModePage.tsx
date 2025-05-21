"use client";

import React, { useEffect, useState, useCallback } from "react";
import CustomPagination from "./CustomPagination";
import Image from "next/image";
import CustomButton from "./HeadlessButton";
import { Button } from "@headlessui/react";
import { Word } from "@prisma/client";
import TextToSpeech from "./TextToSpeach";
import { useRouter } from "next/navigation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ConfirmationModal from "./ConfirmationModal";
import { markWordsAsStudied } from "@/app/actions/prismaActions";

interface DefaultModePageProps {
  words: Word[];
  listId: string;
}

interface Letter {
  letter: string;
  index: number;
  fromScrambled: boolean;
}

const ItemTypes = {
  LETTER: "letter",
};

const LetterComponent = ({
  letter,
  index,
  onClick,
}: {
  letter: string;
  index: number;
  onClick: (letter: string, index: number) => void;
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.LETTER,
      item: { letter, index, fromScrambled: true } as Letter,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [letter, index]
  );

  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    drag(ref);
  }, [drag]);

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="w-16 h-16 bg-lightGreen border-[3px] border-darkGreen text-white font-bold text-3xl flex items-center justify-center rounded-2xl cursor-pointer hover:bg-teal-600 shadow-md"
      onClick={() => onClick(letter, index)}
    >
      {letter}
    </div>
  );
};

const SlotComponent = ({
  letter,
  index,
  onDrop,
}: {
  letter: string | undefined;
  index: number;
  onDrop: (item: Letter, index: number) => void;
}) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.LETTER,
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
      drop: (item: Letter) => onDrop(item, index),
    }),
    [index, onDrop]
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.LETTER,
      item: { letter, index, fromScrambled: false } as Letter,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [letter, index]
  );

  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    drop(ref);
    drag(ref);
  }, [drop, drag]);

  return (
    <div
      ref={ref}
      className={`flex flex-wrap w-14 h-14 border-2 border-darkGreen rounded-xl items-center justify-center shadow-md ${
        letter ? "bg-darkGreen" : "bg-greenLite"
      } ${isOver ? "bg-yellow-200" : ""}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="text-2xl font-bold text-white">{letter || ""}</span>
    </div>
  );
};
const DefaultModePage: React.FC<DefaultModePageProps> = ({ words, listId }) => {
  const wordsSpell = words.map((word) => word.word);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLetters, setSelectedLetters] = useState<string[]>(
    Array(wordsSpell[0]?.length || 0).fill("")
  );
  const [isCorrect, setIsCorrect] = useState(true);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentWord = wordsSpell[currentPage - 1];

  const scrambleWord = useCallback((word: string): string[] => {
    const letters = [...word];
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedLetters(Array(wordsSpell[page - 1]?.length || 0).fill(""));
    setIsCorrect(true);
  };

  const validateWord = (letters: string[]) => {
    if (!currentWord) return;

    if (letters.length === currentWord.length) {
      const isMatching = currentWord === letters.join("");
      if (isMatching) {
        setIsCorrect(true);
        setTimeout(() => {
          setCurrentPage((prevPage) => prevPage + 1);
          setSelectedLetters(
            Array(wordsSpell[currentPage]?.length || 0).fill("")
          );
        }, 2000);
      } else {
        setIsCorrect(false);
      }
    }
  };

  const handleDrop = (item: Letter, slotIndex: number) => {
    const selected = [...selectedLetters];
    const scrambled = [...scrambledLetters];

    if (item.fromScrambled) {
      // If the letter is from the scrambled area, add it to the first empty slot in selectedLetters
      const nextEmptyIndex = selected.findIndex((slot) => slot === "");
      if (nextEmptyIndex !== -1) {
        selected[nextEmptyIndex] = item.letter;
        const scrambledIndex = scrambled.indexOf(item.letter);
        if (scrambledIndex > -1) {
          scrambled.splice(scrambledIndex, 1);
        }
      }
    } else {
      // If the letter is being dragged within the selectedLetters, swap it with the target slot
      const draggedItem = selected[item.index];
      const targetItem = selected[slotIndex];

      // Swap the letters
      selected[item.index] = targetItem;
      selected[slotIndex] = draggedItem;
    }

    setSelectedLetters(selected);
    setScrambledLetters(scrambled);
    validateWord(selected);
  };

  const handleDropToScrambled = (item: Letter) => {
    if (!item.fromScrambled) {
      const selected = [...selectedLetters];
      const scrambled = [...scrambledLetters];

      selected[item.index] = "";
      scrambled.push(item.letter);

      setSelectedLetters(selected);
      setScrambledLetters(scrambled);
      validateWord(selected);
    }
  };

  const handleLetterClick = (letter: string, index: number) => {
    const nextEmptyIndex = selectedLetters.findIndex((slot) => slot === "");

    if (nextEmptyIndex !== -1) {
      const updatedLetters = [...selectedLetters];
      updatedLetters[nextEmptyIndex] = letter;
      setSelectedLetters(updatedLetters);

      setScrambledLetters((prevScrambled) => {
        const newScrambled = [...prevScrambled];
        newScrambled.splice(index, 1);
        return newScrambled;
      });

      validateWord(updatedLetters);
    }
  };

  const handleReset = () => {
    setSelectedLetters(Array(currentWord?.length || 0).fill(""));
    setIsCorrect(true);
    if (currentWord) {
      setScrambledLetters(scrambleWord(currentWord));
    }
  };

  const handleClose = () => {
    setShowConfirmation(true);
  };

  const handleConfirmClose = async () => {
    // Get IDs of completed words (up to current page)
    router.push(`/spellPractice/${listId}`);
    const completedWordIds = words
      .slice(0, currentPage)
      .map((word) => word.id);

    if (completedWordIds.length > 0) {
      await markWordsAsStudied(completedWordIds);
    }
  };

  useEffect(() => {
    if (currentWord) {
      setScrambledLetters(scrambleWord(currentWord));
      setSelectedLetters(Array(currentWord.length).fill(""));
    }
  }, [currentWord, scrambleWord]);

  const ScrambledDropZone = () => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.LETTER,
      drop: (item: Letter) => handleDropToScrambled(item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    const ref = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      drop(ref);
    }, [drop]);

    return (
      <div
        ref={ref}
        className={`flex flex-wrap justify-center gap-3 p-4 rounded-lg ${
          isOver ? "bg-yellow-200" : "bg-transparent"
        }`}
      >
        {scrambledLetters.length > 0 ? (
          scrambledLetters.map((letter, index) => (
            <LetterComponent
              letter={letter}
              index={index}
              key={index}
              onClick={handleLetterClick}
            />
          ))
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-darkGreen rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-darkGreen">+</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-skyBlue m-7 mt-1 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between flex-col-reverse md:flex-row relative">
          <CustomButton
            label={`Total Words ${currentPage} / ${wordsSpell.length}`}
            variant="success"
            size="small"
            img="/images/bookIcon.svg"
          />
          <Image
            src="/images/titles/DefaultModeTitle.svg"
            alt="Default title"
            width={250}
            height={24}
            className="md:mr-40"
          />
          <Button className="focus:outline-none md:relative absolute md:right-0 top-0 right-[-10]">
            <Image
              src="/images/Vector.svg"
              alt="Cancel Button"
              width={30}
              height={30}
              onClick={handleClose}
            />
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <CustomPagination
            currentPage={currentPage}
            totalPages={wordsSpell.length}
            onPageChange={handlePageChange}
          />
          {currentWord && (
            <>
              <p className="text-base md:text-2xl font-bold text-darkBlue text-center">
                Click or drag letters to form the word!
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                <div
                  className={`flex flex-wrap border-[3px] rounded-2xl md:ml-4 p-4 bg-white justify-center gap-3 ${
                    selectedLetters.every((item) => item !== "")
                      ? isCorrect
                        ? "border-darkGreen"
                        : "border-red-500"
                      : "border-darkGreen"
                  }`}
                >
                  {selectedLetters.map((letter, index) => (
                    <SlotComponent
                      letter={letter}
                      index={index}
                      onDrop={handleDrop}
                      key={index}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  {!isCorrect &&
                    selectedLetters.every((item) => item !== "") && (
                      <button onClick={handleReset} className="rounded-2xl">
                        <Image
                          src="/images/resetIcon.svg"
                          alt="Reset"
                          width={60}
                          height={60}
                        />
                      </button>
                    )}
                </div>

                {isCorrect && selectedLetters.every((item) => item !== "") && (
                  <div className="flex items-center justify-center">
                    <button className="text-white font-bold text-lg rounded-full">
                      <Image
                        src="/images/completeIcon.svg"
                        alt="OK"
                        width={60}
                        height={60}
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <ScrambledDropZone />
              </div>

              <div>
                <TextToSpeech heightWidth={60} spell={currentWord} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => router.push(`/spellPractice/${listId}`)}
        onConfirm={handleConfirmClose}
        title="Mark Words as Studied"
        message="Would you like to mark your completed words as studied before leaving?"
      />
    </DndProvider>
  );
};

export default DefaultModePage;
