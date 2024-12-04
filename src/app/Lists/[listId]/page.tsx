"use client";
import DashboardLayout from "@/components/DashboardLayout";
import UserList from "@/components/UserList";
import React from "react";
import Image from "next/image";
import CustomButton from "@/components/HeadlessButton";
import { useParams, useRouter } from "next/navigation";

function ListPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };


  const { listId } = useParams(); 

  const handleContinueLearning = () => {
    router.push(`/spellPractice/${listId}`); 
  };
  return (
    <div>
      <DashboardLayout showFooter={false}>
        {/* Header Section */}
        <div className="flex">
          {/* Back Arrow */}
          <div className="flex items-center m-4">
            <Image
              src={"/images/backArrow.svg"}
              alt="Back Arrow"
              width={20}
              height={20}
              className="h-12 w-12 cursor-pointer"
              onClick={handleBack}
            />
            <button
              className="ml-2 text-lg font-semibold text-gray-600 cursor-pointer"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
          <div className="flex gap-5 mx-auto justify-center items-center">
            <CustomButton
              fullWidth={false}
              radius="rounded"
              label="Remaining Words"
              img="/images/notesIcon.svg"
              className=" "
            />

            <CustomButton
              fullWidth={false}
              label="Complete Words"
              radius="rounded"
              variant="secondary"
              img="/images/notesIcon.svg"
            />
          </div>
          <CustomButton
      fullWidth={false}
      label="Continue Learning"
      size="small"
      radius="square"
      variant="success"
      onClick={handleContinueLearning} // Call the handler on click
    />
        </div>

        <div className=" px-1">
          <UserList />
        </div>
      </DashboardLayout>
    </div>
  );
}

export default ListPage;
