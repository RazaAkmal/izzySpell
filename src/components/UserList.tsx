import React from "react";
import spells from "@/app/Data/spells.json";

const UserList = () => {
  return (
    <div className="p-4 m-3 bg-skyBlue rounded-md">
      <h2 className="text-center text-xl font-bold text-purple mb-4">
        Spelling List-1
      </h2>
      <div className="grid grid-cols-3 gap-3 overflow-auto h-auto max-h-screen p-5 ">
        {spells.map((spell) => (
          <div
            key={spell.id}
            className="flex items-center justify-start bg-white rounded-2xl shadow-md p-3  "
          >
            <span className="text-green bg-green bg-opacity-25 opacity-45 rounded-full text-center h-8 w-8 border-2 border-green font-bold mr-3">
              {spell.id}
            </span>
            <span className="text-gray-700 font-semibold">{spell.word}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
