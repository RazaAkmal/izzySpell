import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import GroupModePage from "@/components/GroupModePage";
import { getWordsByListId } from "@/app/actions/prismaActions";

async function page({
  params,
  searchParams,
}: {
  params: Promise<{ listId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const listId = (await params).listId

  const page = parseInt((await searchParams).page as string) || 1;
  const { words } = await getWordsByListId(parseInt(listId), page);
  return (
    <>
      <DashboardLayout showFooter={false}>

      {words.length > 0 && <GroupModePage words={words} listId={listId} />}
      </DashboardLayout>
    </>
  );
}
export default page;
