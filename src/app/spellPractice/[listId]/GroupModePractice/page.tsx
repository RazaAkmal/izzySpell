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
  await requireListOwnerForPage(parseInt(listId));

  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const [{ groupedWords, totalStudiedGroups }, listName] = await Promise.all([
    getGroupedWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);

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
