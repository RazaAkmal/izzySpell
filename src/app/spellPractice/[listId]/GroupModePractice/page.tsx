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

  const { groupedWords, totalStudiedGroups } = await getGroupedWordsByListId(parseInt(listId));

  return (
    <>
      <DashboardLayout showFooter={false}>

      {groupedWords.length > 0 && <GroupModePage studiedPage={totalStudiedGroups + 1}  groupedWords={groupedWords} listId={listId} />}
      </DashboardLayout>
    </>
  );
}
export default page;
