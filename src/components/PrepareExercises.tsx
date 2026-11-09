"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { generateListExercises } from "@/app/actions/AiService";
import ConfirmationModal from "./ConfirmationModal";

// Shown when a saved list has no syllable or group exercises yet (the AI step after saving
// failed or never finished). Prepares them on open; "Try again" repeats it after a failure.
export default function PrepareExercises({
  listId,
  emptyMessage,
  backOnClose = false,
}: {
  listId: number;
  emptyMessage?: string;
  backOnClose?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"preparing" | "failed" | "empty">("preparing");
  const [isOpen, setIsOpen] = useState(true);
  const hasStarted = useRef(false);

  const prepare = useCallback(async () => {
    setStatus("preparing");
    const result = await generateListExercises(listId).catch(() => null);
    if (!result?.success) {
      setStatus("failed");
      return;
    }
    // Already prepared means this mode has nothing to show, even after the refresh
    if (result.alreadyPrepared) setStatus("empty");
    router.refresh();
  }, [listId, router]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    prepare();
  }, [prepare]);

  // A mode page has nothing behind the modal, so closing it goes back to the practice page
  const handleClose = () => {
    setIsOpen(false);
    if (backOnClose) router.push(`/spellPractice/${listId}`);
  };

  if (status === "failed") {
    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={prepare}
        title="Couldn't Prepare Exercises"
        message="We couldn't prepare Syllables and Word Groups. Your words are saved."
        confirmText="Try again"
        cancelText="Close"
      />
    );
  }

  if (status === "empty") {
    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleClose}
        title="Nothing to Practice"
        message={emptyMessage ?? ""}
        showCancelButton={false}
      />
    );
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={prepare}
      title="Preparing Exercises"
      message="Preparing Syllables and Word Groups..."
      showCancelButton={false}
      isLoading
    />
  );
}
