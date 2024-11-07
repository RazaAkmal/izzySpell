import { Button } from '@headlessui/react';
import React from 'react';

// Define styles for each variant
const variantStyles = {
  primary: 'bg-blue text-white rounded-xl data-[hover]:bg-darkBlue data-[active]:bg-blue',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  success: 'bg-green-500 text-white hover:bg-green-600',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: keyof typeof variantStyles; 
  fullWidth?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = 'primary',
  fullWidth = false,
  className = '', // Accept className prop
  onClick,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      className={`py-2 text-sm font-Pally transition-colors 
        ${variantStyles[variant]} ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
      {...props}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
