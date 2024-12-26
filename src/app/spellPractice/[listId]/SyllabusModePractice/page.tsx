import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllabusModePage from "@/components/SyllabusMode";
import { getWordsByListId } from "@/app/actions/prismaActions";



async function page({
  params,
  searchParams,
}: {
  params: { listId: string };
  searchParams: { page?: string };
}) {

//for listId 
  const listId = params.listId;
  const page = parseInt(searchParams?.page || "1", 10);
    const { words } = await getWordsByListId(parseInt(listId), page);
  return (
    <DashboardLayout showFooter={false}>
       
       {words.length > 0 &&   <SyllabusModePage words={words}  listId={listId} />}
    </DashboardLayout>
  );
}
export default page;
