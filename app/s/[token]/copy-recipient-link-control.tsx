"use client";

import { useEffect, useState } from "react";

interface CopyRecipientLinkControlProps {
  recipientPath: string;
}

export function CopyRecipientLinkControl({
  recipientPath
}: CopyRecipientLinkControlProps) {
  const [origin, setOrigin] = useState("");
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "fallback"
  >("idle");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const displayRecipientLink = origin
    ? new URL(recipientPath, origin).toString()
    : recipientPath;

  async function copyRecipientLink() {
    if (!navigator.clipboard) {
      setCopyStatus("fallback");
      return;
    }

    try {
      await navigator.clipboard.writeText(displayRecipientLink);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("fallback");
    }
  }

  const copyStatusText =
    copyStatus === "copied"
      ? "Recipient link copied."
      : copyStatus === "fallback"
        ? "Could not copy. Select the link manually."
        : "Copy the recipient link when you need it again.";

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-stone-950">
          Copy recipient link
        </h3>
        <p className="text-sm leading-6 text-stone-700">
          Share this `/i/` link with the recipient. It never includes your
          private sender token.
        </p>
      </div>
      <p className="select-all break-all rounded-md border border-stone-300 bg-stone-50 px-3 py-3 font-mono text-sm text-stone-950">
        {displayRecipientLink}
      </p>
      <p aria-live="polite" className="text-sm text-stone-700" role="status">
        {copyStatusText}
      </p>
      <button
        className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 sm:w-auto"
        type="button"
        onClick={copyRecipientLink}
      >
        Copy recipient link
      </button>
    </div>
  );
}
