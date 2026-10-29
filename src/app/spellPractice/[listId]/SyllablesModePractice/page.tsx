import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllableModePage from "@/components/SyllablesMode";
import { getSyllableWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { getListName } from "@/lib/listName";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  //for listId
  const listId = (await params).listId;

  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const [{ syllableWords,  studiedWordCount }, listName] = await Promise.all([
    getSyllableWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);
  return (
    <DashboardLayout showFooter={false}>
      <ListNameProvider listId={listId} initialListName={listName}>
        {syllableWords.length > 0 && <SyllableModePage studiedWordCount={studiedWordCount} syllableWords={syllableWords} listId={parseInt(listId)} />}
      </ListNameProvider>
    </DashboardLayout>
  );
}
export default page;
