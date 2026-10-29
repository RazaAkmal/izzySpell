import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { getTimeDurationsForList } from "@/app/actions/AiService";
import QuizModePage from "@/components/QuizModePage";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId
  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  // Words (incl. list name) and the AI timer suggestions load together,
  // so neither needs a separate request from the browser after the page loads
  const [{ list, words }, aiDurations] = await Promise.all([
    getWordsByListId(parseInt(listId)),
    getTimeDurationsForList(parseInt(listId)),
  ]);
  return (
    <DashboardLayout showFooter={false}>
      <ListNameProvider listId={listId} initialListName={list?.listName}>
        <QuizModePage
          words={words}
          listId={listId}
          initialAiSuggestions={aiDurations.success && aiDurations.data ? aiDurations.data : null}
        />
      </ListNameProvider>
    </DashboardLayout>
  );
}
export default page;
