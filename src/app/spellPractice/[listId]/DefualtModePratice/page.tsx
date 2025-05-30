import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DefaultModePage from "@/components/DefaultModePage";
import { getWordsByListId } from "@/app/actions/prismaActions";

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
        {words.length > 0 && <DefaultModePage studiedWordCount={studiedWordCount} words={words} listId={listId} />}
      </DashboardLayout>
    </>
  );
}
export default page;
