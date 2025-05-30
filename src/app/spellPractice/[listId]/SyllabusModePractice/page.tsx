import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllabusModePage from "@/components/SyllabusMode";
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
      {syllableWords.length > 0 && <SyllabusModePage studiedWordCount={studiedWordCount} syllableWords={syllableWords} listId={parseInt(listId)} />}
    </DashboardLayout>
  );
}
export default page;
