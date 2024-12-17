import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SyllabusModePage from "@/components/SyllabusMode";

function page() {
  return (
    <>
      <DashboardLayout showFooter={false}>

        <SyllabusModePage />
      </DashboardLayout>
    </>
  );
}
export default page;
