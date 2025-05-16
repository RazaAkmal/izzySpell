"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SpellingListItem } from "@/lib/defination";
import moment from "moment";
import EditWordModal from "./EditWordsModal";
import { deleteList, fetchWordsForList } from "@/app/actions/prismaActions";
import { revalidateRoute } from "@/app/actions/revalidate";
import ConfirmationModal from "./ConfirmationModal";

function AllListData({
  spellingLists,
  userId,
}: {
  spellingLists: SpellingListItem[];
  userId?: string;
}) {
  const route = useRouter();
  const [listWithWords, setListWithWords] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleContinueLearning = (listId: number) => {
    route.push(`/spellPractice/${listId}`);
  };
  const handleViewList = (id: number) => {
    route.push(`/lists/${id}`);
  };
  const fetchWordsFromList = async (listId: number) => {
    try {
      const response = await fetchWordsForList(userId!, listId);
      setListWithWords(response);
      setIsModalOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  const initiateDelete = (listId: number) => {
    setPendingDeleteId(listId);
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async (listId: number) => {
    try {
      const result = await deleteList(listId, userId!);

      if (result.success) {
        setSuccessMessage(result.message);
        setShowSuccessModal(true);
        revalidateRoute("/lists");
      } else {
        console.error(
          "Error deleting list:",
          result.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  return (
    <div className="mt-5 rounded-lg md:px-4">
      {spellingLists.map((item) => (
        <div
          key={item.id}
          className="grid px-2 py-2 grid-cols-1 md:grid-cols-12 text-left gap-4 items-center md:gap-0 bg-[#ECF7FF] border-2 border-sky-300 rounded-2xl mb-3 shadow-md"
        >
          <div className="md:col-span-3 flex items-center gap-2 me-3">
            <div
              className={`min-h-10 min-w-10 rounded-full ${item.color}`}
              title={item.listName}
            ></div>
            <p className="font-bold text-sky-600 text-base md:text-xl">
              {item.listName}
            </p>
          </div>
            <p className="md:col-span-2 text-black font-bold text-sm me-3 md:text-xl">
              {moment(item.createdAt).format("MMM, DD YYYY")}
            </p>
          <div className="md:col-span-3 flex me-5 gap-2 w-full md:w-auto">
            <div className="w-full bg-gray-200 h-6 border-2 border-sky-300 rounded-full overflow-hidden">
              <div
                className={`h-full p-2 rounded-full ${item.color}`}
                style={{ width: `${item.progress}%` }}
              >
                <p className="flex ml-3 h-full items-center font-bold text-center justify-center text-white text-sm">
                  {item.progress}%
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-between md:justify-center gap-2 sm:flex-row items-center text-left">
            <button
              onClick={() => handleContinueLearning(item.id)}
              className={`px-3 hover-scale py-1 lg:px-5 lg:py-2 ${
                item.progress === 0 ? item.color : "bg-blue"
              } border-[3px] border-b-white rounded-lg text-white font-bold text-sm sm:text-lg`}
            >
              {item.progress === 0 ? "Start Learning Now" : "Continue Learning"}
            </button>
            <button
              className="px-3 hover-scale py-1 lg:px-5 lg:py-2 bg-blue border-[3px] border-gray-300 text-white font-bold rounded-lg text-sm md:text-lg"
              onClick={() => handleViewList(item.id)}
            >
              View All
            </button>
            <Image
              src="/images/EditICon.svg"
              alt="editIcon"
              width={40}
              height={40}
              className="hover-scale lg:w-10 lg:h-10 w-8 h-8 cursor-pointer"
              onClick={() => {
                fetchWordsFromList(item.id);
              }}
            />
            <Image
              src="/images/deleteIcon.svg"
              alt="deleteIcon"
              width={40}
              height={40}
              className="hover-scale lg:w-10 lg:h-10 w-8 h-8 cursor-pointer"
              onClick={() => initiateDelete(item.id)}
            />
          </div>
        </div>
      ))}

      {listWithWords && (
        <EditWordModal
          listWithWords={listWithWords}
          isOpen={isModalOpen}
          userId={userId}
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (pendingDeleteId) {
            handleDelete(pendingDeleteId);
            setShowDeleteConfirmation(false);
            setPendingDeleteId(null);
          }
        }}
        title="Delete List"
        message="Are you sure you want to delete this list?"
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        showCancelButton={false}
      />
    </div>
  );
}

export default AllListData;
