"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SpellingListItem } from "@/lib/defination";
import moment from "moment";
import EditWordModal from "./EditWordsModal";
import { deleteList, fetchWordsForList, resetListProgress } from "@/app/actions/prismaActions";
import { revalidateRoute } from "@/app/actions/revalidate";
import ConfirmationModal from "./ConfirmationModal";
import type { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";

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
  const [pendingResetId, setPendingResetId] = useState<number | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Prefetch a row's "Continue Learning" page when the user is about to click
  // (hover, focus or touch), so the click shows the loading screen straight away.
  // Done on intent rather than on mount because a user can have dozens of lists.
  // "auto" prefetches only up to the loading screen, so progress data is still
  // fetched fresh on click. ("View All" already opens instantly: it shares this
  // page's loading screen.) No-op in `next dev`.
  const prefetchedListIds = useRef(new Set<number>());
  const prefetchListPages = (listId: number) => {
    if (prefetchedListIds.current.has(listId)) return;
    prefetchedListIds.current.add(listId);
    route.prefetch(`/spellPractice/${listId}`, { kind: "auto" as PrefetchKind });
  };

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

  const initiateReset = (listId: number) => {
    setPendingResetId(listId);
    setShowResetConfirmation(true);
  };

  const handleDelete = async (listId: number) => {
    setIsDeleteLoading(true);
    try {
      const result = await deleteList(listId, userId!);

      if (result.success) {
        setSuccessMessage(result.message);
        setShowDeleteConfirmation(false);
        setShowSuccessModal(true);
        revalidateRoute("/lists");
      } else {
        console.error("Error deleting list:", result.message || "Unknown error");
        
        // Show error to user
        setErrorMessage(result.message || "Failed to delete the list. Please try again.");
        setShowDeleteConfirmation(false);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowDeleteConfirmation(false);
      setShowErrorModal(true);
    } finally {
      setIsDeleteLoading(false);
      setPendingDeleteId(null);
    }
  };

  const handleReset = async (listId: number) => {
    setIsResetLoading(true);
    try {
      const result = await resetListProgress(listId, userId!);

      if (result.success) {
        setSuccessMessage(result.message);
        setShowResetConfirmation(false);
        setShowSuccessModal(true);
        revalidateRoute("/lists");
      } else {
        console.error("Error resetting list progress:", result.message || "Unknown error");
        
        // Show error to user
        setErrorMessage(result.message || "Failed to reset the list progress. Please try again.");
        setShowResetConfirmation(false);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error in handleReset:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowResetConfirmation(false);
      setShowErrorModal(true);
    } finally {
      setIsResetLoading(false);
      setPendingResetId(null);
    }
  };

  return (
    <div className="mt-5 rounded-lg md:px-4">
      {spellingLists.map((item) => (
        <div
          key={item.id}
          onMouseEnter={() => prefetchListPages(item.id)}
          onFocus={() => prefetchListPages(item.id)}
          onTouchStart={() => prefetchListPages(item.id)}
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
              {moment(item.createdAt).format("MMM DD, YYYY")}
            </p>
          <div className="md:col-span-3 flex me-5 gap-2 w-full md:w-auto">
            <div className="w-full bg-gray-200 h-6 border-2 border-sky-300 rounded-full overflow-hidden">
              <div
                className={`h-full p-2 rounded-full ${item.progress === 0 ? 'bg-gray-200' : item.color}`}
                style={{ width: item.progress === 0 ? '100%' : `${item.progress}%` }}
              >
                <p className={`flex ml-3 h-full items-center font-bold text-center justify-center ${item.progress === 0 ? 'text-gray-500' : 'text-white'} text-sm`}>
                  {item.progress}%
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-between md:justify-center gap-2 sm:flex-row items-center text-left">
            <button
              onClick={() => handleContinueLearning(item.id)}
              className={`!text-sm w-[180px] flex items-center justify-center px-3 hover-scale py-2 lg:px-5 lg:py-2 ${
                item.progress === 0 ? item.color : "bg-blue"
              } border-[3px] border-b-white rounded-lg text-white font-bold text-sm sm:text-lg`}
            >
              {item.progress === 0 ? "Start Learning" : "Continue Learning"}
            </button>
            <button
              className="!text-sm px-3 hover-scale py-1 lg:px-5 lg:py-2 bg-blue border-[3px] border-gray-300 text-white font-bold rounded-lg"
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
            <Image
              src="/images/resetIcon.svg"
              alt="resetIcon"
              width={40}
              height={40}
              className="hover-scale lg:w-10 lg:h-10 w-8 h-8 cursor-pointer"
              onClick={() => initiateReset(item.id)}
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
          if (!isDeleteLoading) {
            setShowDeleteConfirmation(false);
            setPendingDeleteId(null);
          }
        }}
        onConfirm={() => {
          if (pendingDeleteId && !isDeleteLoading) {
            handleDelete(pendingDeleteId);
          }
        }}
        title="Delete List"
        message="Are you sure you want to delete this list?"
        isLoading={isDeleteLoading}
        confirmText="Yes"
      />

      <ConfirmationModal
        isOpen={showResetConfirmation}
        onClose={() => {
          if (!isResetLoading) {
            setShowResetConfirmation(false);
            setPendingResetId(null);
          }
        }}
        onConfirm={() => {
          if (pendingResetId && !isResetLoading) {
            handleReset(pendingResetId);
          }
        }}
        title="Reset List Progress"
        message="Are you sure you want to reset all progress for this list? This will mark all words as unstudied."
        isLoading={isResetLoading}
        confirmText="Yes"
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        showCancelButton={false}
      />

      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        showCancelButton={false}
        confirmText="OK"
      />
    </div>
  );
}

export default AllListData;
