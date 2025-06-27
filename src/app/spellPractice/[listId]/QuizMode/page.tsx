import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import QuizModePage from "@/components/QuizModePage";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId
  const { words } = await getWordsByListId(parseInt(listId));
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId}>
          <QuizModePage
            words={words}
            listId={listId}
          />
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}
export default page;
