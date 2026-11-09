import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllableModePage from "@/components/SyllablesMode";
import { getSyllableWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { getListName } from "@/lib/listName";
import PrepareExercises from "@/components/PrepareExercises";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  //for listId
  const listId = (await params).listId;
  // Header's user lookup and the data queries start before the ownership check so they run
  // in parallel with it. The check is still awaited first: a non-owner gets notFound()
  // exactly as before, and the early results are discarded.
  preloadCurrentUserDetails();
  const dataPromise = Promise.all([
    getSyllableWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);
  dataPromise.catch(() => {
    // Surfaced below where it is awaited (or superseded by the ownership check's redirect/404)
  });
  await requireListOwnerForPage(parseInt(listId));
  const [{ syllableWords, studiedWordCount }, listName] = await dataPromise;
  return (
    <DashboardLayout showFooter={false}>
      <ListNameProvider listId={listId} initialListName={listName}>
        {syllableWords.length > 0 ? (
          <SyllableModePage studiedWordCount={studiedWordCount} syllableWords={syllableWords} listId={parseInt(listId)} />
        ) : (
          <PrepareExercises
            listId={parseInt(listId)}
            emptyMessage="No syllable data for this list. Please edit the list to regenerate."
            backOnClose
          />
        )}
      </ListNameProvider>
    </DashboardLayout>
  );
}
export default page;
