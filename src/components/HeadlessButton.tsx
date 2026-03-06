import { Button } from "@headlessui/react";
import React from "react";
import Image from "next/image";

// Define styles for each variant
const variantStyles = {
  primary:
    "bg-blue text-white border-[2px] border-[#FFFFFF] opacity-100",
  secondary:
    "bg-gray-200 text-blue font-bold border-2 border-blue",
  success: "bg-green border-2 border-white text-white",
  danger: "bg-red-500 text-white",
};

// Define styles for each size
const sizeStyles = {
  small: "py-1 px-4 sm:px-8 text-sm sm:text-md",
  medium: "py-2 px-6 sm:px-8 text-base sm:text-lg",
  large: "py-2 px-8 sm:px-16 text-base sm:text-lg",
  extralarge: "py-2 px-12 sm:px-24 text-base sm:text-lg",
};
const radiusStyle = {
  square: "rounded-xl",
  rounded: "rounded-full",
};

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: React.ReactNode;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  radius?: keyof typeof radiusStyle;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  arrow?: string;
  img?: string;
  imageClassName?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = "primary",
  size = "medium",
  radius = "square",
  fullWidth = false,
  className = "",
  onClick,
  disabled = false,
  loading = false,
  arrow,
  img,
  imageClassName,
  ...props
}) => {
  return (
    <Button
      onClick={disabled || loading ? undefined : onClick}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      className={`font-Pally shadow-[2px_2px_0px_rgba(0,0,250,0.4)]
      flex items-center justify-center gap-1.5 sm:gap-2 hover-scale
      min-h-[44px] touch-manipulation
      ${variantStyles[variant]} ${sizeStyles[size]} ${radiusStyle[radius]} ${
        fullWidth ? "w-full" : "w-auto"
      } ${disabled && !loading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} ${loading ? "pointer-events-none" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {img && (
            <Image
              width={40}
              height={40}
              src={img}
              alt="Arrow"
              className={imageClassName || "w-8 h-8 sm:w-10 sm:h-10"}
            />
          )}
          <span className="whitespace-nowrap">{label}</span>
          {arrow && (
            <Image
              width={40}
              height={40}
              src={arrow}
              alt="Arrow"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
          )}
        </>
      )}
    </Button>
  );
};

export default CustomButton;
