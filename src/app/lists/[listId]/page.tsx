import DashboardLayout from "@/components/DashboardLayout";
import React from "react";
import { auth } from "@/auth";
import { Session } from "next-auth";
import ShowWords from "@/components/ShowWords";
import { getBaseUrl } from "@/lib/baseUrl";
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
  const baseUrl = await getBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/fetch-words?userId=${user.id}&&spellingListId=${listID}`,
    {
      cache: "no-store",
    }
  );
  const { spellingListWithWords } = await response.json();


  return (
    <DashboardLayout showFooter={false}>
      <ShowWords spellingListWithWords={spellingListWithWords} />
    </DashboardLayout>
  );
};

export default WordsPage;
