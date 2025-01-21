"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SpellingListItem } from "@/lib/defination";
import CustomButton from "./HeadlessButton";
import { useRouter } from "next/navigation";

const ClientList = ({
  spellingLists,
}: {
  spellingLists: SpellingListItem[];
}) => {
  const router=useRouter()

  const [displayedLists, setDisplayedLists] = useState(
    spellingLists.slice(-3)
  );
  const [allLists, setAllLists] = useState(spellingLists);

  const handleRemoveItem = (itemId: number) => {
    const newDisplayedLists = displayedLists.filter(
      (item) => item.id !== itemId
    );
    if (
      newDisplayedLists.length < 3 &&
      allLists.length > displayedLists.length
    ) {
      const remainingItems = allLists.slice(
        displayedLists.length,
        displayedLists.length + 1
      );
      setDisplayedLists([...newDisplayedLists, ...remainingItems]);
    } else {
      setDisplayedLists(newDisplayedLists);
    }
    setAllLists(allLists.filter((item) => item.id !== itemId));
  };
  const handleNavigateToList = () => {
    const isNavigate = localStorage.getItem("isNavigate");
    if (isNavigate === "true") {
      router.push("/lists");
      localStorage.removeItem("isNavigate");
    } else if (isNavigate === "false") {
      const userConfirmed = confirm(
        "Changes you made may not be saved. Are you sure you want to continue?"
      );
      if (userConfirmed) {
        router.push("/lists");
        localStorage.removeItem("isNavigate");
      } 
    } else {
      router.push("/lists");
      localStorage.removeItem("isNavigate");
    }
  };
  const handleNavigateToSpellParactice = (id: number) => {
    const isNavigate = localStorage.getItem("isNavigate");
    if (isNavigate === "true") {
      router.push(`/spellPractice/${id}`);
      localStorage.removeItem("isNavigate");
    } else if (isNavigate === "false") {
      const userConfirmed = confirm(
        "Changes you made may not be saved. Are you sure you want to continue?"
      );
      if (userConfirmed) {
        router.push(`/spellPractice/${id}`);
        localStorage.removeItem("isNavigate");
      } 
    } else {
      router.push(`/spellPractice/${id}`);
      localStorage.removeItem("isNavigate");
    }
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
        <div className="flex justify-between gap-5 md:flex-row flex-col cursor-pointer">
          {displayedLists.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavigateToSpellParactice(item.id)}
              className="flex w-full items-center p-2 bg-white border-[1px] border-gray-600 rounded-lg shadow-md space-x-3"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}
              ></div>
              <span className="flex-grow font-medium text-gray-700">
                {item.listName}
              </span>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => handleRemoveItem(item.id)}
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
    </>
  );
};

export default ClientList;
