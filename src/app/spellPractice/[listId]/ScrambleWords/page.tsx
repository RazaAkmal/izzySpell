import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getScrambleWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";
import { getListName } from "@/lib/listName";
import ScrambleWordsGame from "@/components/ScrambleWordsGame";
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
    getScrambleWordsByListId(parseInt(listId)),
    getListName(parseInt(listId)),
  ]);
  
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId} initialListName={listName}>
          {result.success && result.data && result.data.length > 0 ? (
            <ScrambleWordsGame 
              listId={listId}
              scrambleWordsData={result.data}
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
