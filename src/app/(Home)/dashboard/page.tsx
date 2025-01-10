import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import UploadWord from "@/components/UploadWord";
import WordList from "@/components/WordList";
import { auth } from "@/auth";
import { Session } from "next-auth";
import ClientList from "@/components/ClientList";
import { SpellingListItem } from "@/lib/defination";
import { getColorForProgress } from "@/app/utils/colors";

async function fetchSpellingLists(userId: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; 
  const response = await fetch(`${baseUrl}/api/spelling-list?userId=${userId}`, {
    cache: 'no-store'
  });
  const { spellingLists } = await response.json();
  return (
    spellingLists?.map((item: SpellingListItem) => ({
      ...item,
      color: getColorForProgress(item.progress),
    })) || []
  );
}

const DashboardPage = async () => {
  const session = (await auth()) as Session | null;
  const user = session?.user;

  if (!user) {
    return <div>Loading...</div>;
  }

  const spellingLists = await fetchSpellingLists(user.id);
 
  // Fetch data for the list (API request on the server side)
  
  return (
    <DashboardLayout showFooter={true}>
      <div className="flex flex-col md:flex-row justify-around gap-2 m-2">
        {user ? <UploadWord user={user} /> : <div>Loading...</div>}
        <WordList spellingLists={spellingLists} />
      </div>
      {user ?<div className="p-4 bg-skyBlue rounded-2xl shadow-md m-2 md:m-5 mt-3">
      {/* Pass data to client component */}
      <ClientList spellingLists={spellingLists} />
    </div> : <div>Loading...</div>}
    </DashboardLayout>
  );
};

export default DashboardPage;
