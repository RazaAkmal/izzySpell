import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import UploadWord from "@/components/UploadWord";
import WordList from "@/components/WordList";
import { auth } from "@/auth";
import { Session } from "next-auth";
import ClientList from "@/components/ClientList";
import { fetchSpellingLists } from "@/app/actions/prismaActions";

const DashboardPage = async () => {
  const session = (await auth()) as Session | null;
  const user = session?.user;

  if (!user) {
    return <div>Loading...</div>;
  }


  const spellingLists = user?.id ? await fetchSpellingLists(user.id) : [];

  return (
    <DashboardLayout showFooter={true}>
      {user ? (
        <div>
          <div className="flex flex-col md:flex-row justify-around gap-2 m-2">
            <UploadWord user={user} />
            <WordList user={user} spellingLists={spellingLists} />
          </div>
          <div className="p-4 bg-skyBlue rounded-2xl shadow-md m-2 md:m-5 mt-3">
            <ClientList spellingLists={spellingLists} />
          </div>
        </div>
      ) : (
        <div>Loading ...</div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
