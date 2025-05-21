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

  const { syllableWords } = await getSyllableWordsByListId(parseInt(listId));
  return (
    <DashboardLayout showFooter={false}>
      {syllableWords.length > 0 && <SyllabusModePage syllableWords={syllableWords} listId={listId} />}
    </DashboardLayout>
  );
}
export default page;
