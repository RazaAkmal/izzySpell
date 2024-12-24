import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CustomButton from "@/components/HeadlessButton";
import SpellPractice from "./SpellPractice";

async function page({
  params,
  searchParams,
}: {
  params: Promise<{ listId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const listId = (await params).listId

  const page = parseInt((await searchParams).page as string) || 1;
  return (
    <>
      <DashboardLayout showFooter={false}>
        {/* For buttons    */}
        <div className="flex justify-center gap-2 ">
          <CustomButton
            label="Study"
            variant="primary"
            radius="rounded"
            img="/images/bookIcon.svg"
          />
          <CustomButton
            label="Quiz"
            variant="secondary"
            radius="rounded"
            img="/images/QuizIcon.svg"
          />
          <CustomButton
            label="Extra"
            variant="secondary"
            radius="rounded"
            img="/images/PencelIcon.svg"
            className=""
          />
        </div>
        <SpellPractice listId={listId} page={page} />
      </DashboardLayout>
    </>
  );
}

export default page;
