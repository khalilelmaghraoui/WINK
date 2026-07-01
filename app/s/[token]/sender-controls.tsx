import { CopyRecipientLinkControl } from "./copy-recipient-link-control";

export type SenderControlsCancelStatus = "success" | "unavailable" | null;

interface SenderControlsProps {
  canCancel: boolean;
  cancelAction: (formData: FormData) => Promise<never>;
  cancelStatus: SenderControlsCancelStatus;
  recipientPath: string;
}

export function SenderControls({
  canCancel,
  cancelAction,
  cancelStatus,
  recipientPath
}: SenderControlsProps) {
  const cancelStatusText = getCancelStatusText(cancelStatus);

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
          Keep these actions private. Anyone with this sender link can use them.
        </p>
      </div>

      <CopyRecipientLinkControl recipientPath={recipientPath} />

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

          <details className="space-y-3 rounded-md border border-stone-300 bg-stone-50 p-3">
            <summary className="min-h-11 cursor-pointer rounded-md border border-wink-danger px-4 py-2 text-sm font-semibold text-wink-danger transition-colors hover:bg-wink-danger/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2">
              Cancel invitation
            </summary>
            <div className="space-y-3 pt-3">
              <p className="text-sm font-semibold text-stone-950">
                Cancel this invitation?
              </p>
              <p className="text-sm leading-6 text-stone-700">
                The recipient will no longer be able to respond.
              </p>
              <form action={cancelAction} className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="min-h-11 rounded-md bg-wink-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wink-danger/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2"
                  type="submit"
                >
                  Yes, cancel invitation
                </button>
                <span className="self-center text-sm text-stone-600">
                  Close this confirmation to keep the invitation open.
                </span>
              </form>
            </div>
          </details>
        </div>
      ) : null}

      {cancelStatusText ? (
        <p aria-live="polite" className="text-sm text-stone-700" role="status">
          {cancelStatusText}
        </p>
      ) : null}
    </section>
  );
}

function getCancelStatusText(
  status: SenderControlsCancelStatus
): string | null {
  if (status === "success") {
    return "Invitation cancelled.";
  }

  if (status === "unavailable") {
    return "This invitation could not be cancelled.";
  }

  return null;
}
