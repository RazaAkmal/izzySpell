import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SpellPractice from "./SpellPractice";
import { ListNameProvider } from "@/context/ListNameContext";

async function page({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const listId = (await params).listId;

  return (
    <>
      <DashboardLayout showFooter={false}>
        <ListNameProvider listId={listId}>
          <SpellPractice listId={listId} />
        </ListNameProvider>
      </DashboardLayout>
    </>
  );
}

export default page;
