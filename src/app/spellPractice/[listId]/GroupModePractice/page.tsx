import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import GroupModePage from "@/components/GroupModePage";
import { getGroupedWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { getListName } from "@/lib/listName";
import NoModeData from "@/components/NoModeData";

async function page({ params }: { params: Promise<{ listId: string }> }) {
  const listId = (await params).listId;
  // Header's user lookup and the data queries start before the ownership check so they run
  // in parallel with it. The check is still awaited first: a non-owner gets notFound()
  // exactly as before, and the early results are discarded.
  preloadCurrentUserDetails();
  const dataPromise = Promise.all([
    getGroupedWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);
  dataPromise.catch(() => {
    // Surfaced below where it is awaited (or superseded by the ownership check's redirect/404)
  });
  await requireListOwnerForPage(parseInt(listId));
  const [{ groupedWords, totalStudiedGroups }, listName] = await dataPromise;

  // Every group is playable (even a group with one word), so any row means there is a page
  const hasPlayableGroups = groupedWords.length > 0;

  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={listName}>
          {hasPlayableGroups ? (
            <GroupModePage
              studiedPage={totalStudiedGroups + 1}
              groupedWords={groupedWords}
              listId={listId}
            />
          ) : (
            <NoModeData
              listId={listId}
              message="No group data for this list. Please edit the list to regenerate."
            />
          )}
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}
export default page;
