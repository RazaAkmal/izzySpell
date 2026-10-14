import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DefaultModePage from "@/components/DefaultModePage";
import { getWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId
  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const { list, words, studiedWordCount } = await getWordsByListId(parseInt(listId));
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={list?.listName}>
          { words.length > 0 && <DefaultModePage studiedWordCount={studiedWordCount} words={words} listId={listId} /> }
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}
export default page;
