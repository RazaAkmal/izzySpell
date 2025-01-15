import DashboardLayout from "@/components/DashboardLayout";
import React from "react";
import Image from "next/image";

import { auth } from "@/auth";
import { Session } from "next-auth";
import AllListData from "@/components/Listdata";
import { fetchSpellingLists } from "../actions/prismaActions";
import { redirect } from "next/navigation";

const AllListsPage = async () => {
  const session = (await auth()) as Session | null;
  if (!session) { 
    redirect('/sign-in'); 
  }
  const user = session?.user;

  if (!user) {
    return <div>Loading...</div>;
  }

  const spellingWithColors = user?.id ? await fetchSpellingLists(user.id) : [];
  
  return (
    <DashboardLayout showFooter={false}>
      <div className="bg-skyBlue rounded-2xl md:m-6 px-8 py-3 md:px-4">
        <div className="flex justify-center items-center h-20">
          <Image
            src="/images/titles/All Words Lists.svg"
            alt="all word list"
            width={300}
            height={40}
          />
        </div>
        <div className="px-4">
        <div className="hidden p-3 md:grid grid-cols-12 font-bold text-xl text-darkBlue bg-[#ECF7FF] border-2 border-sky-300 rounded-2xl">
          <div className="col-span-3">List Name</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-4 text-center">Actions</div>
        </div>
        </div>
        {user ? <AllListData userId={user.id} spellingLists={spellingWithColors} /> : <div>Loading...</div>}
      </div>
    </DashboardLayout>
  );
};

export default AllListsPage;
