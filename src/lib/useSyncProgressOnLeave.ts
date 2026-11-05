"use client";

import { useCallback, useEffect, useRef } from "react";
import { syncListProgress } from "@/app/actions/prismaActions";

// Practice modes auto-save each correct answer with a single write. The list's progress
// and the hub page are refreshed here instead: once when the session is left, or when the
// tab is hidden (the last event a closing tab or a backgrounded phone reliably gets).
export function useSyncProgressOnLeave(listId: number) {
  const pending = useRef(false);

  useEffect(() => {
    const syncIfPending = () => {
      if (!pending.current) return;
      pending.current = false;
      syncListProgress(listId)
        .then((result) => {
          if (result.success === false) {
            console.error("Progress sync failed for list:", listId, result.error);
          }
        })
        .catch((err) => console.error("Progress sync failed for list:", listId, err));
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") syncIfPending();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      syncIfPending();
    };
  }, [listId]);

  const markProgressPending = useCallback(() => {
    pending.current = true;
  }, []);
  // For after a full save, which already refreshes progress and the hub page
  const clearProgressPending = useCallback(() => {
    pending.current = false;
  }, []);

  return { markProgressPending, clearProgressPending };
}
