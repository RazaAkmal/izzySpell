import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SpellPractice from "./SpellPractice";
import { preloadPracticeHubData } from "./practiceHubData";
import { requireListOwnerForPage } from "@/lib/requireSession";
import { preloadCurrentUserDetails } from "@/app/actions/getUserDetails";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;
  // Start the hub's queries and the header's user lookup before the ownership check,
  // so all three run in parallel. If the check fails, notFound() fires and the
  // preloaded results are simply discarded (the hub data is only ever rendered to the owner).
  preloadPracticeHubData(parseInt(listId));
  preloadCurrentUserDetails();
  await requireListOwnerForPage(parseInt(listId));

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
