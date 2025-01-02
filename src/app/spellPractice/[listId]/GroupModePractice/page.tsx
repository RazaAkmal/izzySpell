import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import GroupModePage from "@/components/GroupModePage";
import { getGroupedWordsByListId } from "@/app/actions/prismaActions";

async function page({
  params,
  searchParams,
}: {
  params: Promise<{ listId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const listId = (await params).listId

  const page = parseInt((await searchParams).page as string) || 1;
  const { groupedWords } = await getGroupedWordsByListId(parseInt(listId), page);
  console.log(groupedWords, 'groupedWords')
  return (
    <>
      <DashboardLayout showFooter={false}>

      {groupedWords.length > 0 && <GroupModePage groupedWords={groupedWords} listId={listId} />}
      </DashboardLayout>
    </>
  );
}
export default page;
