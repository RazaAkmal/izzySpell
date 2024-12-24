import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DefaultModePage from "@/components/DefaultModePage";
import { getWordsByListId } from "@/app/actions/prismaActions";

async function page({
  params,
  searchParams,
}: {
  params: { listId: string };
  searchParams: { page?: string };
}) {
  const { listId } = params;
  const page = parseInt(searchParams.page as string) || 1;
  const { words } = await getWordsByListId(parseInt(listId), page);

  return (
    <>
      <DashboardLayout showFooter={false}>
        {words.length > 0 && <DefaultModePage words={words} listId={listId} />}
      </DashboardLayout>
    </>
  );
}
export default page;
