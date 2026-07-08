"use client";

import { useState } from "react";

import {
  createCalendarEventData,
  serializeCalendarEventToIcs
} from "@/lib/calendar-event";
import type { AcceptedRevealCalendarData } from "@/lib/reveal-engine";

export function AddToCalendar({
  calendar
}: {
  calendar: AcceptedRevealCalendarData;
}) {
  const [status, setStatus] = useState<string | null>(null);

  function handleDownload() {
    const event = createCalendarEventData(calendar);

    if (!event) {
      setStatus("Calendar file is unavailable for this invitation.");
      return;
    }

    try {
      const ics = serializeCalendarEventToIcs(event, {
        generatedAt: new Date(),
        uid: createLocalUid()
      });
      const blob = new Blob([ics], {
        type: "text/calendar;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "wink-invitation.ics";
      link.rel = "noopener";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setStatus("Calendar file downloaded.");
    } catch {
      setStatus("Calendar file could not be created.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="min-h-11 w-full cursor-pointer rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text transition-colors duration-200 hover:border-wink-focus hover:bg-wink-surface-muted focus:outline-none focus:ring-2 focus:ring-wink-focus focus:ring-offset-2 focus:ring-offset-wink-background motion-reduce:transition-none"
        onClick={handleDownload}
        type="button"
      >
        Add to calendar
      </button>
      <p className="text-sm leading-6 text-wink-text-secondary">
        Downloads a private .ics file with the plan shown above.
      </p>
      {status ? (
        <p
          aria-live="polite"
          className="min-h-5 text-sm text-wink-text-secondary"
          role="status"
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}

function createLocalUid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `wink-${crypto.randomUUID()}`;
  }

  return `wink-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
