import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SpellPractice from "./SpellPractice";
import { preloadPracticeHubData } from "./practiceHubData";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  // Start the hub's queries now so they run alongside DashboardLayout's user lookup
  preloadPracticeHubData(parseInt(listId));

  return (
    <>
      <DashboardLayout showFooter={false}>
        {/* No ListNameProvider here: nothing on this page reads the list name,
            and the provider's client-side fetch was an extra request */}
        <SpellPractice listId={listId} />
      </DashboardLayout>
    </>
  );
}

export default page;
