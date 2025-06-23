import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllableModePage from "@/components/SyllablesMode";
import { getSyllableWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  //for listId
  const listId = (await params).listId;

  const { syllableWords,  studiedWordCount } = await getSyllableWordsByListId(parseInt(listId));
  return (
    <DashboardLayout showFooter={false}>
      <ListNameProvider listId={listId}>
        {syllableWords.length > 0 && <SyllableModePage studiedWordCount={studiedWordCount} syllableWords={syllableWords} listId={parseInt(listId)} />}
      </ListNameProvider>
    </DashboardLayout>
  );
}
export default page;
