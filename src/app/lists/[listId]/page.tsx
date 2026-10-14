import DashboardLayout from "@/components/DashboardLayout";
import React from "react";
import { auth } from "@/auth";
import { Session } from "next-auth";
import ShowWords from "@/components/ShowWords";
import { fetchWordsForList } from "@/app/actions/prismaActions";
const WordsPage = async ({
  params,
}: {
  params: Promise<{ listId: string }>
}) => {
  const session = (await auth()) as Session | null;
  const user = session?.user;
  const listID = (await params).listId

  if (!user) {
    return <div>Loading...</div>;
  }
  // Read the list directly instead of calling this app's own /api/fetch-words over HTTP
  const spellingListWithWords = await fetchWordsForList(user.id as string, parseInt(listID));


  return (
    <DashboardLayout showFooter={false}>
      <ShowWords spellingListWithWords={spellingListWithWords} />
    </DashboardLayout>
  );
};

export default WordsPage;
