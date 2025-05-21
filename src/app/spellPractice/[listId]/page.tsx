import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SpellPractice from "./SpellPractice";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;

  return (
    <>
      <DashboardLayout showFooter={false}>
        <SpellPractice listId={listId} />
      </DashboardLayout>
    </>
  );
}

export default page;
