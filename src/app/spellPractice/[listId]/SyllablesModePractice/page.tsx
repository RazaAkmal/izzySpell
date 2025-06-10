import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllableModePage from "@/components/SyllablesMode";
import { getSyllableWordsByListId } from "@/app/actions/prismaActions";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  //for listId
  const listId = (await params).listId;

  const { syllableWords,  studiedWordCount } = await getSyllableWordsByListId(parseInt(listId));
  console.log("syllableWords", studiedWordCount);
  return (
    <DashboardLayout showFooter={false}>
      {syllableWords.length > 0 && <SyllableModePage studiedWordCount={studiedWordCount} syllableWords={syllableWords} listId={parseInt(listId)} />}
    </DashboardLayout>
  );
}
export default page;
