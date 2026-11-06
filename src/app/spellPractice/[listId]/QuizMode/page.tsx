import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { getTimeDurationsForList } from "@/app/actions/AiService";
import QuizModePage from "@/components/QuizModePage";

// Fisher-Yates shuffle, so the quiz order differs on every visit
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId
  // Header's user lookup and the data queries start before the ownership check so they run
  // in parallel with it. The check is still awaited first: a non-owner gets notFound()
  // exactly as before, and the early results are discarded.
  preloadCurrentUserDetails();
  // Words (incl. list name) and the AI timer suggestions load together,
  // so neither needs a separate request from the browser after the page loads
  const dataPromise = Promise.all([
    getWordsByListId(parseInt(listId)),
    getTimeDurationsForList(parseInt(listId)),
  ]);
  dataPromise.catch(() => {
    // Surfaced below where it is awaited (or superseded by the ownership check's redirect/404)
  });
  await requireListOwnerForPage(parseInt(listId));
  const [{ list, words }, aiDurations] = await dataPromise;
  const shuffledWords = shuffleArray(words);
  return (
    <DashboardLayout showFooter={false}>
      <ListNameProvider listId={listId} initialListName={list?.listName}>
        <QuizModePage
          words={shuffledWords}
          listId={listId}
          initialAiSuggestions={aiDurations.success && aiDurations.data ? aiDurations.data : null}
        />
      </ListNameProvider>
    </DashboardLayout>
  );
}
export default page;
