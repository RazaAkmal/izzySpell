"use client";

import { useCallback, useEffect, useRef } from "react";
import { syncListProgress } from "@/app/actions/prismaActions";

type SaveResult = { success: boolean; error?: string } | undefined;

// Practice modes auto-save each correct answer with a single write. The list's progress
// and the hub page are refreshed here instead: once when the session is left, or when the
// tab is hidden (the last event a closing tab or a backgrounded phone reliably gets).
//
// It also remembers what is already saved (starting from what the server says was studied),
// so a word or group finished again on a repeat run never calls the server a second time.
export function useSyncProgressOnLeave<K extends string | number>(
  listId: number,
  initiallyStudied: readonly K[]
) {
  const pending = useRef(false);
  const saved = useRef<Set<K> | null>(null);
  saved.current ??= new Set(initiallyStudied);
  // Auto-saves still on their way to the server
  const inFlight = useRef(new Set<Promise<unknown>>());

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

  // Background save of one finished word/group. Skipped when it is already saved; a failed
  // save is forgotten so finishing it again (or the end-of-session save) retries it.
  const autoSave = useCallback((key: K, save: () => Promise<SaveResult>) => {
    const done = saved.current!;
    if (done.has(key)) return;
    done.add(key);
    pending.current = true;
    const fail = (err: unknown) => {
      done.delete(key);
      console.error("Auto-save failed:", key, err);
    };
    const request = save()
      .then((result) => {
        if (result?.success === false) fail(result.error);
      })
      .catch(fail)
      .finally(() => inFlight.current.delete(request));
    inFlight.current.add(request);
  }, []);

  // End of a session. Saves only what isn't saved yet (that call refreshes progress too);
  // with nothing new it just refreshes progress if this session saved anything, and with
  // nothing changed at all it makes no call. Throws if the save fails.
  const saveFinishedSession = useCallback(
    async (all: readonly K[], saveMany: (keys: K[]) => Promise<SaveResult>) => {
      // Wait for auto-saves still running, so a slow or failed one is known before deciding
      await Promise.all(inFlight.current);
      const done = saved.current!;
      const unsaved = all.filter((key) => !done.has(key));
      if (unsaved.length > 0) {
        const result = await saveMany(unsaved);
        if (result?.success === false) throw new Error(result.error || "Save failed");
        unsaved.forEach((key) => done.add(key));
      } else if (pending.current) {
        const result = await syncListProgress(listId);
        if (result.success === false) throw new Error(result.error);
      }
      pending.current = false;
    },
    [listId]
  );

  return { autoSave, saveFinishedSession };
}
