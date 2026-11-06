import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getScrambleWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { getListName } from "@/lib/listName";
import ScrambleWordsGame from "@/components/ScrambleWordsGame";
import NoWordsModal from "@/components/NoWordsModal";
import { shuffleArray } from "@/lib/shuffle";
import { getListWordRefs } from "@/lib/gameWords";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  // Header's user lookup and the data queries start before the ownership check so they run
  // in parallel with it. The check is still awaited first: a non-owner gets notFound()
  // exactly as before, and the early results are discarded.
  preloadCurrentUserDetails();
  const dataPromise = Promise.all([
    getScrambleWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
    getListWordRefs(parseInt(listId)),
  ]);
  dataPromise.catch(() => {
    // Surfaced below where it is awaited (or superseded by the ownership check's redirect/404)
  });
  await requireListOwnerForPage(parseInt(listId));
  const [result, listName, listWords] = await dataPromise;
  
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={listName}>
          {result.success && result.data && result.data.length > 0 ? (
            <ScrambleWordsGame 
              // New word ids after a regenerate remount the game, which resets its state
              // (built from the database order, so the shuffle below does not change the key)
              key={result.data.map((word) => word.id).join("-")}
              listId={listId}
              listWords={listWords}
              // Question order is shuffled on every page load; the options inside a question are not
              scrambleWordsData={shuffleArray(result.data)}
            />
          ) : (
            <NoWordsModal 
              isOpen={true}
              title="No Scramble Words Available"
              message="This list doesn't have scramble words generated yet. Please go back and generate them first."
            />
          )}
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}

export default page;
