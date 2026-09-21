"use client";

import { useEffect } from "react";
import { recordUsageEvent } from "@/lib/usageEvents";

type PageUsageTrackerProps = {
  pagePath: string;
  activityType: "WORDLE" | "WORD_SEARCH";
};

export default function PageUsageTracker({
  pagePath,
  activityType,
}: PageUsageTrackerProps) {
  useEffect(() => {
    let visibleSince: number | null =
      document.visibilityState === "visible" ? performance.now() : null;

    let visibleDuration = 0;
    let finished = false;

    // Cancelled during React's development-only effect replay.
    const viewTimer = window.setTimeout(() => {
      void recordUsageEvent({
        eventType: "PAGE_VIEW",
        activityType,
        pagePath,
      });
    }, 0);

    function stopVisibleTimer() {
      if (visibleSince !== null) {
        visibleDuration += performance.now() - visibleSince;
        visibleSince = null;
      }
    }

    function handleVisibilityChange() {
      stopVisibleTimer();

      if (!finished && document.visibilityState === "visible") {
        visibleSince = performance.now();
      }
    }

    function finishVisit() {
      if (finished) return;

      finished = true;
      stopVisibleTimer();

      const durationMs = Math.min(86_400_000, Math.round(visibleDuration));

      // Ignore immediate mounts/unmounts and development effect replay.
      if (durationMs < 1000) return;

      void recordUsageEvent({
        eventType: "PAGE_DURATION",
        activityType,
        pagePath,
        durationMs,
        metadata: {
          measurement: "visible page duration",
        },
      });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("pagehide", finishVisit);

    return () => {
      window.clearTimeout(viewTimer);

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("pagehide", finishVisit);

      finishVisit();
    };
  }, [pagePath, activityType]);

  return null;
}
