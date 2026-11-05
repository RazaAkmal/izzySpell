"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "./ConfirmationModal";

interface RegenerateButtonProps {
  label: string;
  confirmTitle: string;
  confirmMessage: string;
  onRegenerate: () => Promise<{ success: boolean; error?: string }>;
}

// Small outline button + confirmation. On success the page data is refreshed, and the
// server page re-keys the game, so the game restarts with the new content.
const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  label,
  confirmTitle,
  confirmMessage,
  onRegenerate,
}) => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onRegenerate();
      if (result.success) {
        setShowConfirm(false);
        router.refresh();
      } else {
        setShowConfirm(false);
        setError(result.error || "Could not regenerate. Please try again.");
      }
    } catch (err) {
      console.error("Regenerate failed:", err);
      setShowConfirm(false);
      setError("Could not regenerate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setShowConfirm(true);
        }}
        disabled={isLoading}
        className="text-xs px-3 py-1 rounded-lg border border-darkBlue text-darkBlue bg-transparent hover:bg-white/60 disabled:opacity-50"
      >
        {isLoading ? "Regenerating..." : label}
      </button>
      {error && (
        <p className="text-xs text-red-600 max-w-[220px] text-right" role="alert">
          {error}
        </p>
      )}
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => !isLoading && setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Yes, Regenerate"
        cancelText="Cancel"
        isLoading={isLoading}
      />
    </div>
  );
};

export default RegenerateButton;
