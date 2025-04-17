"use client";

import React, { useState } from "react";
import UploadWord from "@/components/UploadWord";
import WordList from "@/components/WordList";
import ClientList from "@/components/ClientList";
import { fetchSpellingLists } from "@/app/actions/prismaActions";

interface DashboardClientProps {
  user: any;
  initialSpellingLists: any[];
}

const DashboardClient: React.FC<DashboardClientProps> = ({
  user,
  initialSpellingLists,
}) => {
  const [spellingLists, setSpellingLists] = useState(initialSpellingLists);

  const refreshSpellingLists = async () => {
    if (user?.id) {
      console.log("in refetch");
      const updatedLists = await fetchSpellingLists(user.id);
      setSpellingLists(updatedLists);
    }
  };
  console.log("spellingLists", spellingLists);
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-around gap-2 m-2">
        <UploadWord user={user} />
        <WordList
          user={user}
          spellingLists={spellingLists}
          refreshSpellingLists={refreshSpellingLists} // Pass the callback
        />
      </div>
      <div className="p-4 bg-skyBlue rounded-2xl shadow-md m-2 md:m-5 mt-3">
        <ClientList spellingLists={spellingLists} />
      </div>
    </div>
  );
};

export default DashboardClient;