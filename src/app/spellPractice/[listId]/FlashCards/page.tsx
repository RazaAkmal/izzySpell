import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import FlashCardsGame from "@/components/FlashCardsGame";
import NoWordsModal from "@/components/NoWordsModal";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  const { words } = await getWordsByListId(parseInt(listId));
  
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId}>
          {words.length > 0 ? (
            <FlashCardsGame 
              words={words} 
              listId={listId} 
            />
          ) : (
            <NoWordsModal 
              isOpen={true}
              title="No Words Available"
              message="This list doesn't have any words to play Flash Cards. Please choose another list."
            />
          )}
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}

export default page;
