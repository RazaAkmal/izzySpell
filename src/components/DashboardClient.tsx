"use client";

import React, { useEffect, useState } from "react";
import UploadWord from "@/components/UploadWord";
import WordList from "@/components/WordList";
import RecenetList from "@/components/RecentList";
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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isUploading) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]);

  const refreshSpellingLists = async () => {
    if (user?.id) {
      const updatedLists = await fetchSpellingLists(user.id);
      setSpellingLists(updatedLists);
    }
  };
  return (
    <div className="relative">
      {isUploading && (
        <div className="fixed inset-0 z-50 cursor-wait" />
      )}
      <div className="flex flex-col md:flex-row justify-around gap-2 m-2">
        <UploadWord user={user} refreshSpellingLists={refreshSpellingLists} onProcessingChange={setIsUploading} />
        <WordList
          user={user}
          spellingLists={spellingLists}
          refreshSpellingLists={refreshSpellingLists}
          onProcessingChange={setIsUploading}
        />
      </div>
      <div className="p-4 bg-skyBlue rounded-2xl shadow-md m-2 md:m-5 mt-3">
        <RecenetList spellingLists={spellingLists} />
      </div>
    </div>
  );
};

export default DashboardClient;