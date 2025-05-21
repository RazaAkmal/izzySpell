import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import GroupModePage from "@/components/GroupModePage";
import { getGroupedWordsByListId } from "@/app/actions/prismaActions";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId

  const { groupedWords } = await getGroupedWordsByListId(parseInt(listId));
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
