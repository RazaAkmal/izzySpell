import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DefaultModePage from "@/components/DefaultModePage";
import { getWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId
  const { words, studiedWordCount } = await getWordsByListId(parseInt(listId));
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId}>
          { words.length > 0 && <DefaultModePage studiedWordCount={studiedWordCount} words={words} listId={listId} /> }
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}
export default page;
