"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SpellingListItem } from "@/lib/defination";
import CustomButton from "./HeadlessButton";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";

const MyRecentList = ({
  spellingLists,
}: {
  spellingLists: SpellingListItem[];
}) => {
  const router = useRouter();
  const [displayedLists, setDisplayedLists] = useState(spellingLists.slice(0, 3));
  const [allLists, setAllLists] = useState(spellingLists);
  const [showNavigateConfirmation, setShowNavigateConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ path: string; id?: number } | null>(null);

  // Sync state with updated spellingLists prop
  useEffect(() => {
    setAllLists(spellingLists);
    setDisplayedLists(spellingLists.slice(0, 3)); // Always show the newest 3 lists
  }, [spellingLists]);

  const handleRemoveItem = (itemId: number) => {
    const updatedAllLists = allLists.filter((item) => item.id !== itemId);
    setAllLists(updatedAllLists);

    const updatedDisplayedLists = updatedAllLists.slice(-3); // Update displayed lists
    setDisplayedLists(updatedDisplayedLists);
  };

  const initiateNavigation = (path: string, id?: number) => {
    const isNavigate = localStorage.getItem("isNavigate");
    if (isNavigate === "false") {
      setShowNavigateConfirmation(true);
      setPendingNavigation({ path, id });
    } else {
      executeNavigation(path, id);
    }
  };

  const executeNavigation = (path: string, id?: number) => {
    const finalPath = id ? `/spellPractice/${id}` : path;
    router.push(finalPath);
    localStorage.removeItem("isNavigate");
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      const path = pendingNavigation.id 
        ? `/spellPractice/${pendingNavigation.id}` 
        : pendingNavigation.path;
      executeNavigation(path);
    }
    setShowNavigateConfirmation(false);
    setPendingNavigation(null);
  };

  const handleNavigateToList = () => {
    initiateNavigation("/lists");
  };


  return (
    <>
      <div className="flex items-center justify-between md:flex-row flex-col">
        <div className="w-52 md:block hidden"></div>
        <Image
          src="/images/titles/MyListTitle.svg"
          alt="User avatar"
          width={40}
          height={40}
          className="w-52"
        />
        <CustomButton
          label="Manage Lists"
          fullWidth={false}
          size="small"
          arrow="/images/arrow.svg"
          className="mb-3"
          onClick={handleNavigateToList}
        />
      </div>
      {displayedLists.length > 0 ? (
        <div className="flex justify-between gap-5 md:flex-row flex-col">
          {displayedLists.map((item) => (
            <div
              key={item.id}
              onClick={() => initiateNavigation("", item.id)}
              className={`flex w-full items-center p-2 bg-white border-[1px] border-gray-600 rounded-lg shadow-md space-x-3 hover-scale cursor-pointer`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}
              />
              <span className="flex-grow font-medium text-gray-700">
                {item.listName}
              </span>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent click
                  handleRemoveItem(item.id);
                }}
              >
                <Image
                  src="/images/Vector.svg"
                  alt="Delete icon"
                  width={22}
                  height={22}
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex justify-center text-darkBlue text-center font-semibold text-md">
          No recent list to show
        </p>
      )}
      <ConfirmationModal
        isOpen={showNavigateConfirmation}
        onClose={() => {
          setShowNavigateConfirmation(false);
          setPendingNavigation(null);
        }}
        onConfirm={handleConfirmNavigation}
        title="Unsaved Changes"
        message="Changes you made may not be saved. Are you sure you want to continue?"
      />
    </>
  );
};

export default MyRecentList;
