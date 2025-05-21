'use client';

import CustomButton from "@/components/HeadlessButton";
import { useRouter } from "next/navigation";

const GoToHomeButton: React.FC = () => {
  const router = useRouter();

  return (
    <CustomButton
      label="Go to Home"
      size="medium"
      variant="success"
      radius="rounded"
      onClick={() => router.push("/dashboard")}
    />
  );
};

export default GoToHomeButton;