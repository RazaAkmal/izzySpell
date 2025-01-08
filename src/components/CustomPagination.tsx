"use client";
import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect screen size and update state
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="custom-pagination">
      {isMobile ? (
        <div className="mobile-pagination flex items-center justify-between">
          <button
            className={`prev-button ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          >
            <Image
              alt="prev arrow"
              width={20}
              height={20}
              src="/images/PrevArrow.svg"
              className="w-6"
            />
          </button>
          <span className="current-page text-lg font-bold">{currentPage}</span>
          <button
            className={`next-button ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          >
            <Image
              alt="next arrow"
              width={20}
              height={20}
              src="/images/NextArrow.svg"
              className="w-6"
            />
          </button>
        </div>
      ) : (
        <Pagination
          current={currentPage}
          total={totalPages * 10}
          pageSize={10}
          prevIcon={
            <span
              className={`relative ${
                currentPage === 1
                  ? "bg-white opacity-70 cursor-not-allowed"
                  : "cursor-pointer"
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
              className={`relative ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
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
          className="custom-pagination"
        />
      )}
    </div>
  );
};

export default CustomPagination;
