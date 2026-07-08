import { respondToInviteAction } from "./actions";
import { RaincheckPanel } from "./raincheck-panel";
import { formatInviteDateTime } from "@/lib/invite-date-time";
import type { Invite } from "@/lib/invite-store";
import {
  PrimaryButton,
  ResponseButtonGroup,
  SecondaryButton
} from "../../../components/ui";

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
      className="space-y-5"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-wink-text-secondary">
          Lawyer mode
        </p>
        <h2
          className="text-xl font-semibold text-wink-text"
          id="lawyer-mode-heading"
        >
          Case No. {invite.slug}: Petition for an excellent plan
        </h2>
        <p className="text-sm text-wink-text-secondary">
          A playful filing. Not a binding contract. No remains fully available.
        </p>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="font-semibold text-wink-text-secondary">Petitioner</dt>
          <dd className="text-base text-wink-text">
            {invite.senderName || "Not provided"}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-semibold text-wink-text-secondary">
            Honorable decision-maker
          </dt>
          <dd className="text-base text-wink-text">{invite.recipientName}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-wink-text">
          Case argument
        </h3>
        <p className="whitespace-pre-wrap font-display text-xl italic leading-relaxed text-wink-text">
          {invite.message}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-wink-text">Evidence</h3>
        <ul className="space-y-2 text-base text-wink-text">
          <li>
            Date and time:{" "}
            {formatInviteDateTime(invite.dateDetails.startsAt) ||
              "Not provided"}
          </li>
          <li>Place: {invite.placeDetails.name || "Not provided"}</li>
          <li>Address: {invite.placeDetails.address || "Not provided"}</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-wink-text">
          Terms of approval
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-base text-wink-text">
          <li>Approval means yes to this plan, not to anything else.</li>
          <li>Raincheck and No are valid responses.</li>
          <li>This court respects clear boundaries.</li>
        </ul>
      </div>

      <div className="space-y-4 border-t border-wink-border pt-4">
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
              className="block text-sm font-semibold text-wink-text"
              htmlFor="signatureApproval"
            >
              Type approved to accept
            </label>
            <p className="text-sm text-wink-text-secondary">
              Raincheck and No do not require this approval.
            </p>
            <input
              aria-describedby={
                signatureError ? "signatureApproval-error" : undefined
              }
              aria-invalid={signatureError ? "true" : undefined}
              className="min-h-11 w-full rounded-md border border-wink-border bg-wink-surface px-3 py-2 text-base text-wink-text outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
              id="signatureApproval"
              name="signatureApproval"
              type="text"
            />
            {signatureError ? (
              <p className="text-sm text-wink-danger" id="signatureApproval-error">
                Type approved before accepting the case.
              </p>
            ) : null}
          </div>
          <PrimaryButton
            aria-label="Approve and answer yes to this invitation"
            className="w-full"
            type="submit"
          >
            Approve and say Yes
          </PrimaryButton>
        </form>

        <ResponseButtonGroup label="Other valid answers">
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
            <SecondaryButton
              aria-label="Answer no to this invitation"
              className="w-full"
              type="submit"
            >
              Dismiss politely
            </SecondaryButton>
          </form>
        </ResponseButtonGroup>
      </div>
    </section>
  );
}
