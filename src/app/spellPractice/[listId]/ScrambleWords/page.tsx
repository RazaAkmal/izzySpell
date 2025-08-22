import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getScrambleWordsByListId } from "@/app/actions/prismaActions";
import { ListNameProvider } from "@/context/ListNameContext";
import ScrambleWordsGame from "@/components/ScrambleWordsGame";
import NoWordsModal from "@/components/NoWordsModal";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  const result = await getScrambleWordsByListId(parseInt(listId));
  
  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId}>
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
