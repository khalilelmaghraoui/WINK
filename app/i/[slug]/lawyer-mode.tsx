import { respondToInviteAction } from "./actions";
import { RaincheckPanel } from "./raincheck-panel";
import type { Invite } from "@/lib/invite-store";

export function LawyerMode({
  invite,
  previewMode,
  signatureError
}: {
  invite: Invite;
  previewMode: boolean;
  signatureError: boolean;
}) {
  return (
    <section
      aria-labelledby="lawyer-mode-heading"
      className="space-y-5 rounded-lg border border-stone-300 bg-white p-5"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase text-stone-600">
          Lawyer mode
        </p>
        <h2
          className="text-xl font-semibold text-stone-950"
          id="lawyer-mode-heading"
        >
          Case No. {invite.slug}: Petition for an excellent plan
        </h2>
        <p className="text-sm text-stone-700">
          A playful filing. Not a binding contract. No remains fully available.
        </p>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="font-medium text-stone-600">Petitioner</dt>
          <dd className="text-base text-stone-950">
            {invite.senderName || "Not provided"}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium text-stone-600">
            Honorable decision-maker
          </dt>
          <dd className="text-base text-stone-950">{invite.recipientName}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-stone-950">
          Case argument
        </h3>
        <p className="whitespace-pre-wrap text-base leading-7 text-stone-800">
          {invite.message}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-stone-950">Evidence</h3>
        <ul className="space-y-2 text-base text-stone-800">
          <li>Date and time: {formatStartsAt(invite) || "Not provided"}</li>
          <li>Place: {invite.placeDetails.name || "Not provided"}</li>
          <li>Address: {invite.placeDetails.address || "Not provided"}</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-stone-950">
          Terms of approval
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-base text-stone-800">
          <li>Approval means yes to this plan, not to anything else.</li>
          <li>Raincheck and No are valid responses.</li>
          <li>This court respects clear boundaries.</li>
        </ul>
      </div>

      <div className="space-y-4 border-t border-stone-200 pt-4">
        <form action={respondToInviteAction} className="space-y-3">
          <input name="slug" type="hidden" value={invite.slug} />
          <input
            name="previewMode"
            type="hidden"
            value={previewMode ? "true" : "false"}
          />
          <input name="response" type="hidden" value="yes" />
          <input name="requiresSignature" type="hidden" value="true" />
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-stone-950"
              htmlFor="signatureApproval"
            >
              Type approved to accept
            </label>
            <p className="text-sm text-stone-700">
              Raincheck and No do not require this approval.
            </p>
            <input
              aria-describedby={
                signatureError ? "signatureApproval-error" : undefined
              }
              aria-invalid={signatureError ? "true" : undefined}
              className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/20"
              id="signatureApproval"
              name="signatureApproval"
              type="text"
            />
            {signatureError ? (
              <p className="text-sm text-red-700" id="signatureApproval-error">
                Type approved before accepting the case.
              </p>
            ) : null}
          </div>
          <button
            aria-label="Approve and answer yes to this invitation"
            className="min-h-11 w-full rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
            type="submit"
          >
            Approve and say Yes
          </button>
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          <RaincheckPanel
            previewMode={previewMode}
            slug={invite.slug}
            triggerLabel="Request continuance"
          />
          <form action={respondToInviteAction}>
            <input name="slug" type="hidden" value={invite.slug} />
            <input
              name="previewMode"
              type="hidden"
              value={previewMode ? "true" : "false"}
            />
            <input name="response" type="hidden" value="no" />
            <button
              aria-label="Answer no to this invitation"
              className="min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
              type="submit"
            >
              Dismiss politely
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function formatStartsAt(invite: Invite): string | null {
  if (!invite.dateDetails.startsAt) {
    return null;
  }

  const [date, time] = invite.dateDetails.startsAt.split("T");

  return [date, time].filter(Boolean).join(" at ");
}
