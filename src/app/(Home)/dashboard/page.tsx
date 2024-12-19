import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import UploadWord from "@/components/UploadWord";
import WordList from "@/components/WordList";
import List from "@/components/MyList";
import { auth } from "@/auth";
import { Session } from "next-auth";

const DashboardPage = async () => {
  const session = (await auth()) as Session | null;
  const user = session?.user;

  if (!user) {
    return <div>Loading...</div>;
  }

  // Fetch data for the list (API request on the server side)
  
  return (
    <DashboardLayout showFooter={true}>
      <div className="flex flex-col md:flex-row justify-around gap-2 m-2">
        {user ? <UploadWord user={user} /> : <div>Loading...</div>}
        <WordList />
      </div>
      {user ? <List user={user} /> : <div>Loading...</div>}
    </DashboardLayout>
  );
};

export default DashboardPage;
