import React from "react";
import Image from "next/image";

function AllListData() {
  // Dummy data
  const dummyData = [
    {
      id: 1,
      name: "Spelling list-1",
      date: "Oct, 18 2024",
      progress: 70,
      status: "Continue Learning",
      color: "bg-green",
    },
    {
      id: 2,
      name: "Spelling list-2",
      date: "Oct, 18 2024",
      progress: 30,
      status: "Start Learning now",
      color: "bg-yellow-500",
    },
    {
      id: 3,
      name: "Spelling list-3",
      date: "Oct, 18 2024",
      progress: 30,
      status: "Continue Learning",
      color: "bg-green",
    },
    {
      id: 4,
      name: "Spelling list-4",
      date: "Oct, 18 2024",
      progress: 70,
      status: "Continue Learning",
      color: "bg-sky-500",
    },
  ];

  return (
    <div className=" m-5 p-5 rounded-lg">
      {dummyData.map((list) => (
        <div
          key={list.id}
          className="grid grid-cols-1 md:grid-cols-12 items-center py-2 px-4 bg-sky-200 border-2 border-sky-300 rounded-lg mb-3 shadow-md gap-5"
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
                  className="h-full rounded-full  bg-sky-400"
                  style={{ width: `${list.progress}%` }}
                >
                  <p className="flex h-full items-center font-bold text-center justify-center  text-white  text-sm">
                    {list.progress}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col sm:flex-row items-center gap-4 justify-end">
            <button
              className={`px-5 py-2 border-[3px] border-b-white rounded-lg text-white font-bold text-sm sm:text-lg ${list.color}`}
            >
              {list.status}
            </button>
            <button className="px-5 py-2 bg-blue border-[3px] border-gray-300 text-white font-bold rounded-lg text-sm sm:text-lg">
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
