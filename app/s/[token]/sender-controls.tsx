"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { SenderCancelActionState } from "./actions";

const initialCancelState: SenderCancelActionState = {
  status: "idle"
};

interface SenderControlsProps {
  canCancel: boolean;
  cancelAction: (
    state: SenderCancelActionState,
    formData: FormData
  ) => Promise<SenderCancelActionState>;
  recipientPath: string;
}

export function SenderControls({
  canCancel,
  cancelAction,
  recipientPath
}: SenderControlsProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "fallback"
  >("idle");
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelState, formAction] = useActionState(
    cancelAction,
    initialCancelState
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (cancelState.status === "success") {
      setIsConfirmingCancel(false);
      router.refresh();
    }
  }, [cancelState.status, router]);

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
  const cancelStatusText = getCancelStatusText(cancelState.status);

  return (
    <section
      aria-labelledby="sender-controls-heading"
      className="space-y-5 border-t border-stone-200 pt-5"
    >
      <div className="space-y-1">
        <h2
          className="text-lg font-semibold text-stone-950"
          id="sender-controls-heading"
        >
          Sender controls
        </h2>
        <p className="text-sm leading-6 text-stone-700">
          Keep these actions private. Anyone with this sender link can use
          them.
        </p>
      </div>

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

      {canCancel ? (
        <div className="space-y-3 border-t border-stone-200 pt-5">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-stone-950">
              Need to stop this invitation?
            </h3>
            <p className="text-sm leading-6 text-stone-700">
              You can cancel it before they answer. After cancellation, the
              recipient will no longer be able to respond.
            </p>
          </div>

          {isConfirmingCancel ? (
            <div className="space-y-3 rounded-md border border-stone-300 bg-stone-50 p-3">
              <p className="text-sm font-semibold text-stone-950">
                Cancel this invitation?
              </p>
              <p className="text-sm leading-6 text-stone-700">
                The recipient will no longer be able to respond.
              </p>
              <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
                <CancelSubmitButton />
                <button
                  className="min-h-11 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-950 transition-colors hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2"
                  type="button"
                  onClick={() => setIsConfirmingCancel(false)}
                >
                  Keep invitation open
                </button>
              </form>
            </div>
          ) : (
            <button
              className="min-h-11 w-full rounded-md border border-wink-danger px-4 py-2 text-sm font-semibold text-wink-danger transition-colors hover:bg-wink-danger/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 sm:w-auto"
              type="button"
              onClick={() => setIsConfirmingCancel(true)}
            >
              Cancel invitation
            </button>
          )}

          {cancelStatusText ? (
            <p
              aria-live="polite"
              className="text-sm text-stone-700"
              role="status"
            >
              {cancelStatusText}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function CancelSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-11 rounded-md bg-wink-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wink-danger/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Cancelling..." : "Yes, cancel invitation"}
    </button>
  );
}

function getCancelStatusText(
  status: SenderCancelActionState["status"]
): string | null {
  if (status === "success") {
    return "Invitation cancelled.";
  }

  if (status === "unavailable" || status === "storage_unavailable") {
    return "This invitation could not be cancelled.";
  }

  return null;
}
