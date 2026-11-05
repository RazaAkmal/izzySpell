import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllableModePage from "@/components/SyllablesMode";
import { getSyllableWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { getListName } from "@/lib/listName";
import NoModeData from "@/components/NoModeData";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  //for listId
  const listId = (await params).listId;
  await requireListOwnerForPage(parseInt(listId));

  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const [{ syllableWords,  studiedWordCount }, listName] = await Promise.all([
    getSyllableWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);
  return (
    <DashboardLayout showFooter={false}>
      <ListNameProvider listId={listId} initialListName={listName}>
        {syllableWords.length > 0 ? (
          <SyllableModePage studiedWordCount={studiedWordCount} syllableWords={syllableWords} listId={parseInt(listId)} />
        ) : (
          <NoModeData
            listId={listId}
            message="No syllable data for this list. Please edit the list to regenerate."
          />
        )}
      </ListNameProvider>
    </DashboardLayout>
  );
}
export default page;
