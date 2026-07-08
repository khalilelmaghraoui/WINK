"use client";

import { useEffect, useState } from "react";

interface CopyPrivateSenderLinkControlProps {
  senderPath: string;
}

export function CopyPrivateSenderLinkControl({
  senderPath
}: CopyPrivateSenderLinkControlProps) {
  const [origin, setOrigin] = useState("");
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "fallback"
  >("idle");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const senderUrl = origin ? new URL(senderPath, origin).toString() : senderPath;
  const copyStatusText =
    copyStatus === "copied"
      ? "Private sender link copied."
      : copyStatus === "fallback"
        ? "Could not copy. Select the private sender link manually."
        : "Copy the private sender link and keep it somewhere safe.";

  async function copyPrivateSenderLink() {
    if (!navigator.clipboard) {
      setCopyStatus("fallback");
      return;
    }

    try {
      await navigator.clipboard.writeText(senderUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("fallback");
    }
  }

  return (
    <div className="space-y-3">
      <p className="select-all break-all rounded-md border border-wink-border bg-wink-surface px-3 py-3 font-mono text-sm text-wink-text">
        {senderUrl}
      </p>
      <p
        aria-live="polite"
        className="min-h-5 text-sm text-wink-text-secondary"
        role="status"
      >
        {copyStatusText}
      </p>
      <button
        className="min-h-11 w-full rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text transition-colors hover:border-wink-primary hover:text-wink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 sm:w-auto"
        type="button"
        onClick={copyPrivateSenderLink}
      >
        Copy private sender link
      </button>
    </div>
  );
}
