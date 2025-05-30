"use client";
import React from "react";
import Pagination from "rc-pagination";
import Image from "next/image";
import "./CustomPagination.module.css";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  highestReachedPage: number;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  highestReachedPage,
}) => {
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth <= 768;

  const handlePageChange = (page: number) => {
    // Allow navigation to any page up to highest reached
    if (page <= highestReachedPage) {
      onPageChange(page);
    }
  };

  const itemRender = (current: number, type: string, element: React.ReactNode) => {
    if (type === 'page') {
      const isAccessible = current <= highestReachedPage;
      return (
        <button
          className={`${
            current === currentPage 
              ? 'bg-darkGreen text-white border-darkGreen' 
              : isAccessible 
                ? 'bg-green text-white border-green hover:bg-[#6BC01A] hover:text-white hover:border-[#6BC01A]'
                : 'bg-gray-200 text-gray-400 pointer-events-none opacity-50'
          } w-10 h-10 rounded-full flex items-center justify-center mx-1 border-2 text-lg font-bold transition-all`}
          onClick={() => handlePageChange(current)}
          disabled={!isAccessible}
        >
          {current}
        </button>
      );
    }
    return element;
  };

  return (
    <Pagination
      current={currentPage}
      total={totalPages * 10}
      pageSize={10}
      prevIcon={
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center border-3 border-sky-300 bg-white transition-all ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-[#2563eb] cursor-pointer"
          }`}
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        >
          <Image
            alt="prev arrow"
            width={24}
            height={24}
            src="/images/PrevArrow.svg"
            className="w-6 h-6"
          />
        </div>
      }
      nextIcon={
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center border-3 border-sky-300 bg-white transition-all ${
            currentPage === totalPages || currentPage >= highestReachedPage
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-[#2563eb] cursor-pointer"
          }`}
          onClick={() => 
            currentPage < highestReachedPage && 
            handlePageChange(currentPage + 1)
          }
        >
          <Image
            alt="Next arrow"
            width={24}
            height={24}
            src="/images/NextArrow.svg"
            className="w-6 h-6"
          />
        </div>
      }
      onChange={handlePageChange}
      itemRender={itemRender}
      className={`custom-pagination ${isSmallScreen ? "small-screen" : ""}`}
    />
  );
};

export default CustomPagination;
