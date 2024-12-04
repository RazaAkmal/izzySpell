import { Button } from "@headlessui/react";
import React from "react";
import Image from "next/image";

// Define styles for each variant
const variantStyles = {
  primary:
    "bg-blue text-white  data-[hover]:bg-darkBlue data-[active]:bg-blue border-[2px] border-[#FFFFFF] opacity-100 ",
  secondary:
    "bg-gray-200 text-blue font-bold hover:bg-gray-300 border-2 border-blue ",
  success: "bg-green border-2 border-white text-white hover:bg-green-600",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

// Define styles for each size
const sizeStyles = {
  small: "py-1 m-3 px-8 text-lg  ",
  medium: " py-3 px-8 text-lg",
  large: "py-2 px-16 text-lg",
  extralarge: "py-2 px-24 text-lg",
};
const radiusStyle = {
  square: "rounded-xl",
  rounded: "rounded-full",
};

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  radius?: keyof typeof radiusStyle;
  fullWidth?: boolean;
  disabled?: boolean;
  arrow?: string;
  img?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = "primary",
  size = "medium",
  radius = "square",
  fullWidth = false,
  className = "",
  onClick,
  disabled,
  arrow,
  img,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      aria-disabled={disabled}
      className={`font-Pally transition-colors 
      shadow-[2px_2px_0px_rgba(0,0,250,0.4)] 
      flex items-center justify-center gap-2 
      ${variantStyles[variant]} ${sizeStyles[size]} ${radiusStyle[radius]} ${
        fullWidth ? "w-full" : "w-auto"
      } ${className}`}
      {...props}
    >
      {img && (
        <Image
          width={50}
          height={50}
          src={img}
          alt="Arrow"
          className="w-10 h-10"
        />
      )}
      {label}
      {arrow && (
        <Image
          width={50}
          height={50}
          src={arrow}
          alt="Arrow"
          className="w-5 h-5"
        />
      )}
    </Button>
  );
};

export default CustomButton;
