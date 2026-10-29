import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { fetchSpellingLists } from "@/app/actions/prismaActions";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = (await auth()) as Session | null;
  const user = session?.user;

  // No session (e.g. ended after a password change): clear the cookie and go to sign-in
  if (!user) {
    redirect("/session-expired");
  }

  const spellingLists = user?.id ? await fetchSpellingLists(user.id) : [];

  return (
    <DashboardLayout showFooter={true}>
      <DashboardClient user={user} initialSpellingLists={spellingLists} />
    </DashboardLayout>
  );
};

export default DashboardPage;
