import { Button } from "@headlessui/react";
import React from "react";

// Define styles for each variant
const variantStyles = {
  primary:
    "bg-blue text-white rounded-xl data-[hover]:bg-darkBlue data-[active]:bg-blue",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  success: "bg-green-500 text-white hover:bg-green-600",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

// Define styles for each size
const sizeStyles = {
  small: "py-2 px-4 text-base",
  medium: "py-3 px-6 text-sm",
  large: "py-2 px-16 text-lg",
};

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  fullWidth?: boolean;
  disabled?: boolean;
  arrow?: string; // New prop for the arrow image
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className = "",
  onClick,
  disabled,
  arrow,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      aria-disabled={disabled}
      className={`font-Pally transition-colors border-[2px] border-[#FFFFFF] opacity-100 rounded-xl
        shadow-[2px_2px_0px_rgba(0,0,250,0.4)] 
        flex items-center justify-center gap-2 
        ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? "w-full" : "w-auto"
      } ${className}`}
      {...props}
    >
      {label}
      {arrow && <img src={arrow} alt="Arrow" className=" w-5 h-5" />}
    </Button>
  );
};

export default CustomButton;
