import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DefaultModePage from "@/components/DefaultModePage";
import { getWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { getUserDetails, preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { showsLetterHints } from "@/lib/grade";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId
  // Header's user lookup and the word queries start before the ownership check, so all
  // run in parallel (getWordsByListId checks ownership itself and shares the cached lookup).
  // The check is still awaited first: a non-owner gets notFound() exactly as before, not
  // the plain "Spelling list not found" error getWordsByListId would throw.
  preloadCurrentUserDetails();
  const wordsPromise = getWordsByListId(parseInt(listId));
  wordsPromise.catch(() => {
    // Surfaced below where it is awaited (or superseded by the ownership check's redirect/404)
  });
  const userId = await requireListOwnerForPage(parseInt(listId));
  // getUserDetails is cached per request, so this reuses the header's lookup
  const [{ list, words, studiedWordIds }, userDetails] = await Promise.all([
    wordsPromise,
    getUserDetails(userId),
  ]);
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={list?.listName}>
          { words.length > 0 && <DefaultModePage
            studiedWordIds={studiedWordIds}
            words={words}
            listId={listId}
            showLetterHints={showsLetterHints(userDetails?.grade)}
          /> }
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}
export default page;
