'use client';

import CustomButton from "@/components/HeadlessButton";
import { markWordsAsStudied } from "@/app/actions/prismaActions";

interface MarkAsStudiedButtonProps {
  wordIds: number[]
}

const MarkAsStudiedButton: React.FC<MarkAsStudiedButtonProps> = ({ wordIds }) => {
  const markWordsStudied = async () => {
    const result = await markWordsAsStudied(wordIds);
    if (result.success) {
      alert("Words marked as studied successfully!");
    } else {
      alert(`${result.error}`);
    }
  };

  return (
    <CustomButton
      label="Mark as studied"
      size="small"
      variant="success"
      radius="rounded"
      className="w-full md:w-auto"
      onClick={markWordsStudied}
    />
  );
};

export default MarkAsStudiedButton;