export type UsageEventInput = {
  eventType:
    | "ACTIVITY_CREATED"
    | "GENERATION_SUCCESS"
    | "GENERATION_FAILED"
    | "PAGE_VIEW"
    | "PAGE_DURATION"
    | "VALIDATION_WARNING";
  activityType?: "WORDLE" | "WORD_SEARCH";
  activityId?: string;
  pagePath?: string;
  durationMs?: number;
  message?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function recordUsageEvent(
  event: UsageEventInput,
): Promise<boolean> {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
      keepalive: true,
    });

    if (!response.ok) {
      console.warn("Usage event was not saved:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Usage tracking unavailable:", error);
    return false;
  }
}
