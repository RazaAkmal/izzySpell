import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import GroupModePage from "@/components/GroupModePage";
import { getGroupedWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { getListName } from "@/lib/listName";

async function page({ params }: { params: Promise<{ listId: string }> }) {
  const listId = (await params).listId;

  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const [{ groupedWords, totalStudiedGroups }, listName] = await Promise.all([
    getGroupedWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);

  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={listName}>
          {groupedWords.length > 0 && (
            <GroupModePage
              studiedPage={totalStudiedGroups + 1}
              groupedWords={groupedWords}
              listId={listId}
            />
          )}
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}
export default page;
