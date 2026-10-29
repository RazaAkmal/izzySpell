import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getFlashCardsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { getListName } from "@/lib/listName";
import FlashCardsGame from "@/components/FlashCardsGame";
import NoWordsModal from "@/components/NoWordsModal";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const [result, listName] = await Promise.all([
    getFlashCardsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);
  
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={listName}>
          {result.success && result.data && result.data.length > 0 ? (
            <FlashCardsGame 
              listId={listId}
              flashCardsData={result.data}
            />
          ) : (
            <NoWordsModal 
              isOpen={true}
              title="No Flash Cards Available"
              message="This list doesn't have flash cards generated yet. Please go back and generate them first."
            />
          )}
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}

export default page;
