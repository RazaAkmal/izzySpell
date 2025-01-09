"use client";
import React from "react";
import Pagination from "rc-pagination";
import Image from "next/image";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth <= 768;
  return (
    <Pagination
      current={currentPage}
      total={totalPages * 10}
      pageSize={10}
      prevIcon={
        <span
          className={`relative${
            currentPage === 1
              ? " bg-white opacity-70 cursor-not-allowed"
              : " cursor-pointer"
          }`}
        >
          <Image
            alt="prev arrow"
            width={10}
            height={10}
            src="/images/PrevArrow.svg"
            className="w-6 m-3"
          />
        </span>
      }
      nextIcon={
        <span
          className={`relative${
            currentPage === totalPages
              ? " opacity-50 cursor-not-allowed"
              : " cursor-pointer"
          }`}
        >
          <Image
            alt="Next arrow"
            width={10}
            height={10}
            src="/images/NextArrow.svg"
            className="w-6 m-3"
          />
        </span>
      }
      onChange={onPageChange}
      className={`custom-pagination ${isSmallScreen ? "small-screen" : ""}`}
    />
  );
};

export default CustomPagination;
