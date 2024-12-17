import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import GroupModePage from "@/components/GroupModePage";

function page() {
  return (
    <>
      <DashboardLayout showFooter={false}>

        <GroupModePage />
      </DashboardLayout>
    </>
  );
}
export default page;
