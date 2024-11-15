'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface ListItemProps {
  id: number;
  title: string;
  color: string;
}

const List: React.FC = () => {
  const [list, setList] = useState<ListItemProps[]>([
    { id: 1, title: 'Spelling list-1', color: '#9C52FC' },
    { id: 2, title: 'Spelling list-2', color: '#CF8C09' },
    { id: 3, title: 'Spelling list-3', color: '#F94DB5' },
  ]);

  return (
    <div className="p-4 bg-skyBlue opacity-70 rounded-lg shadow-md md:m-5  mt-3">
      <h2 className="text-center text-purple font-bold text-lg mb-4">My List</h2>
      <div className="flex flex-wrap   gap-4  ">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-1  bg-white border-[1px] border-gray-600 rounded-lg shadow-md space-x-3 w-72"
          >
            {/* Circle Background */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: item.color }}
            ></div>
            {/* Title */}
            <span className="flex-grow font-medium text-gray-700">{item.title}</span>
            {/* Cancel Icon */}
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setList(list.filter((el) => el.id !== item.id))} // Removes item on click
            >
             <Image
                  src="/images/Vector.svg"
                  alt="User avatar"
                  width={36}
                  height={49}
                />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
