'use client'
import CustomButton from "./HeadlessButton";
import Image from "next/image";

interface StudyCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  mode: string;
  isLoading?: boolean;
}

export default function StudyCompletionModal({ isOpen, onClose, onContinue, mode, isLoading = false }: StudyCompletionModalProps) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/Success.svg"
              alt="Success"
              width={300}
              height={280}
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-purple mb-4">
            Congratulations! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Great job! You&apos;ve completed all words in {mode}!
          </p>
          <div className="flex flex-col gap-2 w-full">
            <CustomButton
              onClick={onClose}
              className="border-white !py-1"
              label={<span className="text-base">Practice Again</span>}
              variant="success"
              img="/images/resetIcon.svg"
              fullWidth
              disabled={isLoading}
            />
            <CustomButton
              onClick={onContinue}
              className="border-white !py-1"
              label={
                isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-base">Saving Progress...</span>
                  </div>
                ) : (
                  <span className="text-base">Save & Complete</span>
                )
              }
              variant="primary"
              img={!isLoading ? "/images/check-icon.png" : undefined}
              fullWidth
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              {isLoading ? "Saving your progress..." : `This will mark ${mode} words as studied`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
