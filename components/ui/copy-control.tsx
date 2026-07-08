"use client";

import { useState } from "react";

interface CopyControlProps {
  className?: string;
  copiedFeedbackLabel?: string;
  copyButtonLabel?: string;
  disabled?: boolean;
  failedFeedbackLabel?: string;
  label: string;
  value: string;
}

type CopyState = "idle" | "copied" | "failed";

export function CopyControl({
  className = "",
  copiedFeedbackLabel = "Copied.",
  copyButtonLabel = "Copy link",
  disabled = false,
  failedFeedbackLabel = "Could not copy. Select the link and copy it manually.",
  label,
  value
}: CopyControlProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function copyValue() {
    if (disabled) {
      return;
    }

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(value);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const feedback =
    copyState === "copied"
      ? copiedFeedbackLabel
      : copyState === "failed"
        ? failedFeedbackLabel
        : "";

  return (
    <div className={["space-y-2", className].filter(Boolean).join(" ")}>
      <p className="text-sm font-semibold text-wink-text">{label}</p>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <output
          aria-label={label}
          className={[
            "min-h-11 rounded-md border border-wink-border bg-wink-surface-muted",
            "px-3 py-2.5 text-base leading-relaxed text-wink-text",
            "select-all whitespace-pre-wrap break-all"
          ].join(" ")}
        >
          {value}
        </output>
        <button
          aria-label={`${copyButtonLabel}: ${label}`}
          className={[
            "inline-flex min-h-11 items-center justify-center rounded-md border",
            "border-wink-border bg-wink-surface px-5 py-2.5 text-sm font-semibold text-wink-text",
            "transition-colors duration-200 hover:border-wink-primary hover:bg-wink-surface-muted motion-reduce:transition-none",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background",
            "disabled:cursor-not-allowed disabled:border-wink-border disabled:bg-wink-surface-muted disabled:text-wink-text-secondary"
          ].join(" ")}
          disabled={disabled}
          onClick={copyValue}
          type="button"
        >
          {copyState === "copied" ? copiedFeedbackLabel : copyButtonLabel}
        </button>
      </div>
      <p aria-live="polite" className="min-h-5 text-sm text-wink-text-secondary">
        {feedback}
      </p>
    </div>
  );
}
