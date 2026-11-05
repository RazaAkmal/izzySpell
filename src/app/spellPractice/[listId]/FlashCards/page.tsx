import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getFlashCardsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { getListName } from "@/lib/listName";
import FlashCardsGame from "@/components/FlashCardsGame";
import NoWordsModal from "@/components/NoWordsModal";
import { shuffleArray } from "@/lib/shuffle";
import { getListWordRefs } from "@/lib/gameWords";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  await requireListOwnerForPage(parseInt(listId));
  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const [result, listName, listWords] = await Promise.all([
    getFlashCardsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
    getListWordRefs(parseInt(listId)),
  ]);
  
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={listName}>
          {result.success && result.data && result.data.length > 0 ? (
            <FlashCardsGame 
              // New card ids after a regenerate remount the game, which resets its state
              // (built from the database order, so the shuffle below does not change the key)
              key={result.data.map((card) => card.id).join("-")}
              listId={listId}
              listWords={listWords}
              // Card order is shuffled on every page load; the options inside a card are not
              flashCardsData={shuffleArray(result.data)}
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
