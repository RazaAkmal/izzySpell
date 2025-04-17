import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { fetchSpellingLists } from "@/app/actions/prismaActions";
import DashboardClient from "@/components/DashboardClient";

const DashboardPage = async () => {
  const session = (await auth()) as Session | null;
  const user = session?.user;

  if (!user) {
    return <div>Loading...</div>;
  }

  const spellingLists = user?.id ? await fetchSpellingLists(user.id) : [];

  return (
    <DashboardLayout showFooter={true}>
      <DashboardClient user={user} initialSpellingLists={spellingLists} />
    </DashboardLayout>
  );
};

export default DashboardPage;
