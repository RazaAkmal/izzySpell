'use client';

import CustomButton from "@/components/HeadlessButton";
import { useRouter } from "next/navigation";

const GoToHomeButton: React.FC = () => {
  const router = useRouter();

  return (
    <CustomButton
      label="Go to Home"
      size="small"
      variant="success"
      radius="rounded"
      className="w-full md:w-auto mt-0"
      onClick={() => router.push("/")}
    />
  );
};

export default GoToHomeButton;