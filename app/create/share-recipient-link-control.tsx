"use client";

import { useEffect, useState } from "react";

interface ShareRecipientLinkControlProps {
  recipientPath: string;
}

type ShareStatus =
  | "idle"
  | "shared"
  | "share_fallback"
  | "copied"
  | "copy_fallback";

export function ShareRecipientLinkControl({
  recipientPath
}: ShareRecipientLinkControlProps) {
  const [origin, setOrigin] = useState("");
  const [shareSupported, setShareSupported] = useState(false);
  const [status, setStatus] = useState<ShareStatus>("idle");

  useEffect(() => {
    setOrigin(window.location.origin);
    setShareSupported(typeof navigator.share === "function");
  }, []);

  const recipientUrl = origin
    ? new URL(recipientPath, origin).toString()
    : recipientPath;
  const statusText = getStatusText(status, shareSupported);

  async function shareRecipientLink() {
    if (!navigator.share) {
      setStatus("share_fallback");
      return;
    }

    try {
      await navigator.share({
        title: "WINK invitation",
        text: "I made you a WINK invitation.",
        url: recipientUrl
      });
      setStatus("shared");
    } catch (error) {
      if (isAbortError(error)) {
        setStatus("idle");
        return;
      }

      setStatus("share_fallback");
    }
  }

  async function copyRecipientLink() {
    if (!navigator.clipboard) {
      setStatus("copy_fallback");
      return;
    }

    try {
      await navigator.clipboard.writeText(recipientUrl);
      setStatus("copied");
    } catch {
      setStatus("copy_fallback");
    }
  }

  return (
    <div className="space-y-3">
      <p className="select-all break-all rounded-md border border-wink-border bg-wink-surface px-3 py-3 font-mono text-sm text-wink-text">
        {recipientUrl}
      </p>
      <p
        aria-live="polite"
        className="min-h-5 text-sm text-wink-text-secondary"
        role="status"
      >
        {statusText}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {shareSupported ? (
          <button
            className="min-h-11 rounded-md bg-wink-primary px-4 py-2 text-sm font-semibold text-wink-surface transition-colors hover:bg-wink-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2"
            type="button"
            onClick={shareRecipientLink}
          >
            Share recipient link
          </button>
        ) : null}
        <button
          className="min-h-11 rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text transition-colors hover:border-wink-primary hover:text-wink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2"
          type="button"
          onClick={copyRecipientLink}
        >
          Copy recipient link
        </button>
      </div>
    </div>
  );
}

function getStatusText(status: ShareStatus, shareSupported: boolean): string {
  if (status === "shared") {
    return "Recipient link shared.";
  }

  if (status === "share_fallback") {
    return "Could not share. Copy the link instead.";
  }

  if (status === "copied") {
    return "Recipient link copied.";
  }

  if (status === "copy_fallback") {
    return "Could not copy. Select the link manually.";
  }

  return shareSupported
    ? "Share or copy the recipient link when you are ready."
    : "Native sharing is unavailable here. Copy the recipient link instead.";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
