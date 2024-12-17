import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DefaultModePage from "@/components/DefaultModePage";

function page() {
  return (
    <>
      <DashboardLayout showFooter={false}>

        <DefaultModePage />
      </DashboardLayout>
    </>
  );
}
export default page;
