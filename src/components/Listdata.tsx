"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function AllListData() {
  const dummyData = [
    {
      id: 1,
      name: "Spelling list-1",
      date: "Oct, 18 2024",
      progress: 20,
    },
    {
      id: 2,
      name: "Spelling list-2",
      date: "Oct, 18 2024",
      progress: 35,
    },
    {
      id: 3,
      name: "Spelling list-3",
      date: "Oct, 18 2024",
      progress: 58,
    },
    {
      id: 4,
      name: "Spelling list-4",
      date: "Oct, 18 2024",
      progress: 90,
    },
    {
      id: 5,
      name: "Spelling list-5",
      date: "Oct, 18 2024",
      progress: 0,
    },
  ];

  const updatedData = dummyData.map((item) => {
    let status = "Start Learning Now";
    let color = "bg-yellow-500";
    if (item.progress > 0 && item.progress <= 25) {
      color = "bg-purple";
      status = "Continue Learning";
    } else if (item.progress > 25 && item.progress <= 50) {
      color = "bg-orange";
      status = "Continue Learning";
    } else if (item.progress > 50 && item.progress <= 75) {
      color = "bg-green";
      status = "Continue Learning";
    } else if (item.progress > 75) {
      color = "bg-blue";
      status = "Continue Learning";
    }

    return { ...item, status, color };
  });

  const route = useRouter();

  // For dynamic routing
  const handleViewList = (id: number) => {
    route.push(`/lists/${id}`);
  };

  return (
    <div className="m-5 py-2 px-5 rounded-lg">
      {updatedData.map((list) => (
        <div
          key={list.id}
          className="grid grid-cols-1 md:grid-cols-12 items-center py-2 px-4 bg-[#ECF7FF] border-2 border-sky-300 rounded-lg mb-3 shadow-md gap-5"
        >
          <div className="md:col-span-3 flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-full ${list.color}`}
              title={list.name}
            ></div>
            <p className="font-bold text-sky-600 text-base md:text-xl">
              {list.name}
            </p>
          </div>

          <div className="md:col-span-5 flex flex-col sm:flex-row items-center gap-4">
            <p className="text-black font-bold text-sm md:text-xl">
              {list.date}
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-48 bg-gray-200 h-7 border-2 border-sky-300 rounded-full overflow-hidden">
                <div
                  className={`h-full p-2 rounded-full ${list.color}`}
                  style={{ width: `${list.progress}%` }}
                >
                  <p className="flex ml-3 h-full items-center font-bold text-center justify-center text-white text-sm">
                    {list.progress}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col sm:flex-row items-center gap-4 justify-end">
            <button
              className={`px-5 py-2 ${
                list.progress === 0 ? list.color : "bg-blue"
              } border-[3px] border-b-white rounded-lg text-white font-bold text-sm sm:text-lg`}
            >
              {list.status}
            </button>
            <button
              className="px-5 py-2 bg-blue border-[3px] border-gray-300 text-white font-bold rounded-lg text-sm sm:text-lg"
              onClick={() => handleViewList(list.id)}
            >
              View All
            </button>
            <div className="flex items-center justify-center">
              <Image
                src="/images/icons.svg"
                alt="all word list"
                width={70}
                height={70}
                className="w-16 h-16"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AllListData;
