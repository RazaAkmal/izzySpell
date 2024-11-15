import { Button } from '@headlessui/react';
import React from 'react';

// Define styles for each variant
const variantStyles = {
  primary: 'bg-blue text-white rounded-xl data-[hover]:bg-darkBlue data-[active]:bg-blue',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  success: 'bg-green-500 text-white hover:bg-green-600',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

// Define styles for each size
const sizeStyles = {
  small: 'py-2 px-4 text-xs',
  medium: 'py-3 px-12 text-sm',
  large: 'py-2 px-32 text-lg',
};

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: keyof typeof variantStyles; 
  size?: keyof typeof sizeStyles; 
  fullWidth?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = 'primary',
  size = 'medium', // Default to medium size
  fullWidth = false,
  className = '', 
  onClick,
  disabled,
  ...props
}) => {
  return (
    <Button
    onClick={onClick}
    aria-disabled={disabled}
    className={`font-Pally transition-colors border-[4px] border-[#FFFFFF] opacity-100 rounded-xl
      shadow-[2px_2px_0px_rgba(0,0,250,0.4)] 
      ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
    {...props}
  >
    {label}
  </Button>
  );
};

export default CustomButton;
