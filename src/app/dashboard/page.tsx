// pages/dashboardPage.js
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import UploadWord from "@/components/UploadWord";
import WordList from "@/components/WordList";
import List from "@/components/MyList";

const DashboardPage = () => {
  return (
    <DashboardLayout showFooter={true}>
      <div className="flex flex-col md:flex-row justify-around gap-2 m-2">
        <UploadWord />
        <WordList />
      </div>
      <List />
    </DashboardLayout>
  );
};

export default DashboardPage;
