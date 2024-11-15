"use client";
import React, { useState } from "react";
import Image from "next/image";

interface ListItemProps {
  id: number;
  title: string;
  color: string;
}

const List: React.FC = () => {
  const [list, setList] = useState<ListItemProps[]>([
    { id: 1, title: "Spelling list-1", color: "#9C52FC" },
    { id: 2, title: "Spelling list-2", color: "#CF8C09" },
    { id: 3, title: "Spelling list-3", color: "#F94DB5" },
  ]);

  return (
    <div className="p-4 bg-skyBlue rounded-lg shadow-md m-2 md:m-5  mt-3">
      <div className="flex justify-center">
        <Image
          src="/images/titles/MyListTitle.svg"
          alt="User avatar"
          width={40}
          height={40}
          className="w-52"
        />
      </div>
      <div className="flex flex-wrap gap-4  ">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-2 bg-white border-[1px] border-gray-600 rounded-lg shadow-md space-x-3 flex-grow"    
          >
            {/* Circle Background */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: item.color }}
            ></div>
            {/* Title */}
            <span className="flex-grow font-medium text-gray-700">
              {item.title}
            </span>
            {/* Cancel Icon */}
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setList(list.filter((el) => el.id !== item.id))}
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
    </div>
  );
};

export default List;
