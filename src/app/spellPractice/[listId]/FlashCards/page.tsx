import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getFlashCardsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import FlashCardsGame from "@/components/FlashCardsGame";
import NoWordsModal from "@/components/NoWordsModal";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  const result = await getFlashCardsByListId(parseInt(listId));
  
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId}>
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
