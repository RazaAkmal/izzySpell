import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SpellPractice from "@/components/SpellPractice";
import CustomButton from "@/components/HeadlessButton";

function page() {
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

          
        <SpellPractice />
      </DashboardLayout>
    </>
  );
}

export default page;
