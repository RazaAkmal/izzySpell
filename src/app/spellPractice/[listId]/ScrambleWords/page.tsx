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
  await requireListOwnerForPage(parseInt(listId));
  // Header's user lookup runs in parallel with this page's queries
  preloadCurrentUserDetails();
  const [result, listName, listWords] = await Promise.all([
    getScrambleWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
    getListWordRefs(parseInt(listId)),
  ]);
  
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
