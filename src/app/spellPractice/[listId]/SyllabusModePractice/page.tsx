import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllabusModePage from "@/components/SyllabusMode";
import { getSyllableWordsByListId } from "@/app/actions/prismaActions";

async function page({
  params,
  searchParams,
}: {
  params: Promise<{ listId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  //for listId
  const listId = (await params).listId;

  const page = parseInt((await searchParams).page as string) || 1;
  const { syllableWords } = await getSyllableWordsByListId(parseInt(listId), page);
  return (
    <DashboardLayout showFooter={false}>
      {syllableWords.length > 0 && <SyllabusModePage syllableWords={syllableWords} listId={listId} />}
    </DashboardLayout>
  );
}
export default page;
