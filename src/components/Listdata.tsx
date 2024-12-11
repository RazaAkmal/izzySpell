"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SpellingListItem } from "@/lib/defination";
import moment from "moment";

function AllListData({ spellingLists }: { spellingLists: SpellingListItem[] }) {
  const route = useRouter();
  const handleContinueLearning = (listId: number) => {
    route.push(`/spellPractice/${listId}`);
  };
  const handleViewList = (id: number) => {
    route.push(`/lists/${id}`);
  };
  return (
    <div className="mt-5 rounded-lg px-4">
      {spellingLists.map((item) => (
        <div
          key={item.id}
          className="grid px-2 py-2 grid-cols-1 md:grid-cols-12 text-left gap-4 items-center md:gap-0 bg-[#ECF7FF] border-2 border-sky-300 rounded-2xl mb-3 shadow-md"
        >
          <div className="md:col-span-3 flex items-center gap-2">
            <div
              className={`h-10 w-10 rounded-full ${item.color}`}
              title={item.listName}
            ></div>
            <p className="font-bold text-sky-600 text-base md:text-xl">
              {item.listName}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-black font-bold text-sm md:text-xl">
              {moment(item.createdAt).format("MMM, DD YYYY")}
            </p>
          </div>
          <div className="md:col-span-3 flex  gap-2 w-full md:w-auto">
            <div className="w-full sm:w-48 bg-gray-200 h-6 border-2 border-sky-300 rounded-full overflow-hidden">
              <div
                className={`h-full p-2 rounded-full ${item.color}`}
                style={{ width: `${item.progress}%` }}
              >
                <p className="flex ml-3 h-full items-center font-bold text-center justify-center text-white text-sm">
                  {item.progress}%
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-between md:justify-center gap-2 sm:flex-row items-center text-left">
            <button
              onClick={() => handleContinueLearning(item.id)}
              className={`px-5 py-2 ${
                item.progress === 0 ? item.color : "bg-blue"
              } border-[3px] border-b-white rounded-lg text-white font-bold text-sm sm:text-lg`}
            >
              {item.progress === 0 ? "Start Learning Now" : "Continue Learning"}
            </button>
            <button
              className="px-5 py-2 bg-blue border-[3px] border-gray-300 text-white font-bold rounded-lg text-sm sm:text-lg"
              onClick={() => handleViewList(item.id)}
            >
              View All
            </button>
            <Image
              src="/images/EditICon.svg"
              alt="all word list"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <Image
              src="/images/deleteIcon.svg"
              alt="all word list"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default AllListData;
