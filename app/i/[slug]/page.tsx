import type { Metadata } from "next";

import { flagUnknownSenderAction, respondToInviteAction } from "./actions";
import { CompatibilityReport } from "./compatibility-report";
import { KindReplyAssistant } from "./kind-reply-assistant";
import { LawyerMode } from "./lawyer-mode";
import { UnbotheredMode } from "./unbothered-mode";
import {
  getInviteForRecipientPage,
  getInvitePageMetadata,
  getRecipientPageState,
  isPreviewModeParam,
  shouldShowCompatibilityReport,
  shouldShowKindReplyAssistant,
  shouldShowLawyerMode,
  shouldShowUnbotheredMode
} from "@/lib/invite-page";
import { inviteStore } from "@/lib/invite-store";
import type { Invite } from "@/lib/invite-store";
import { getModePresentation } from "@/lib/mode-engine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = getInvitePageMetadata();

interface InvitePageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    previewMode?: string | string[];
    signatureError?: string | string[];
  };
}

export default async function InvitePage({
  params,
  searchParams
}: InvitePageProps) {
  const previewMode = isPreviewModeParam(searchParams?.previewMode);
  const invite = await getInviteForRecipientPage({
    previewMode,
    slug: params.slug,
    store: inviteStore
  });

  if (!invite) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-5 py-10">
        <section className="space-y-3 rounded-lg border border-stone-300 bg-white p-5">
          <p className="text-sm font-medium text-stone-600">Invite not found</p>
          <h1 className="text-2xl font-semibold text-stone-950">
            This invitation is not available.
          </h1>
          <p className="text-base text-stone-700">
            Check the link and try again.
          </p>
        </section>
      </main>
    );
  }

  const pageState = getRecipientPageState(invite.status);
  const presentation = getModePresentation(invite);
  const showLawyerMode = shouldShowLawyerMode({
    mode: invite.mode,
    state: pageState
  });
  const showUnbotheredMode = shouldShowUnbotheredMode({
    mode: invite.mode,
    state: pageState
  });
  const signatureError = isPreviewModeParam(searchParams?.signatureError);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8">
      <article className="space-y-6">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase text-stone-600">
            WINK invite
          </p>
          <h1 className="text-2xl font-semibold text-stone-950">
            {presentation.headline}
          </h1>
          <p className="text-base text-stone-700">{presentation.subtitle}</p>
          {previewMode ? (
            <p className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-700">
              Preview mode is on. No opens or actions will be saved.
            </p>
          ) : null}
        </header>

        {pageState !== "respondable" ? (
          <StateMessage invite={invite} pageState={pageState} />
        ) : null}

        {shouldShowKindReplyAssistant(pageState) ? (
          <KindReplyAssistant invite={invite} />
        ) : null}

        {shouldShowCompatibilityReport(pageState) ? (
          <>
            {!showUnbotheredMode ? (
              <section
                aria-labelledby="mode-presentation-heading"
                className="space-y-3 rounded-lg border border-stone-300 bg-white p-5"
              >
                <p className="text-sm font-medium text-stone-600">
                  {presentation.modeLabel} mode
                </p>
                <h2
                  className="text-lg font-semibold text-stone-950"
                  id="mode-presentation-heading"
                >
                  {invite.recipientName}, you have an invitation.
                </h2>
                <p className="text-base leading-7 text-stone-800">
                  {presentation.body}
                </p>
                <p className="text-sm text-stone-700">
                  {presentation.safetyNote}
                </p>
              </section>
            ) : null}
            <CompatibilityReport presentation={presentation} />
          </>
        ) : null}

        {showLawyerMode ? (
          <LawyerMode
            invite={invite}
            previewMode={previewMode}
            signatureError={signatureError}
          />
        ) : null}

        {showUnbotheredMode ? (
          <UnbotheredMode
            invite={invite}
            noTapCount={invite.noTapCount}
            previewMode={previewMode}
          />
        ) : null}

        {!showLawyerMode && !showUnbotheredMode ? (
          <section
            aria-labelledby="invite-message-heading"
            className="space-y-3 rounded-lg border border-stone-300 bg-white p-5"
          >
            <h2
              className="text-lg font-semibold text-stone-950"
              id="invite-message-heading"
            >
              Message
            </h2>
            <p className="whitespace-pre-wrap text-base leading-7 text-stone-800">
              {invite.message}
            </p>
          </section>
        ) : null}

        <section
          aria-labelledby="invite-details-heading"
          className="space-y-4 rounded-lg border border-stone-300 bg-white p-5"
        >
          <h2
            className="text-lg font-semibold text-stone-950"
            id="invite-details-heading"
          >
            Details
          </h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <Detail label="From" value={invite.senderName} />
            <Detail label="To" value={invite.recipientName} />
            <Detail label="Mode" value={formatToken(invite.mode)} />
            <Detail label="Tone" value={formatToken(invite.tone)} />
            <Detail label="Date type" value={formatToken(invite.dateType)} />
            <Detail label="Date and time" value={formatStartsAt(invite)} />
            <Detail label="Place" value={invite.placeDetails.name} />
            <Detail label="Address" value={invite.placeDetails.address} />
            <Detail label="Dress hint" value={getDressHint(invite)} />
          </dl>
        </section>

        {pageState === "respondable" &&
        !showLawyerMode &&
        !showUnbotheredMode ? (
          <ResponseActions
            invite={invite}
            presentation={presentation}
            previewMode={previewMode}
          />
        ) : null}
      </article>
    </main>
  );
}

function StateMessage({
  invite,
  pageState
}: {
  invite: Invite;
  pageState:
    | "accepted"
    | "raincheck"
    | "declined"
    | "flagged"
    | "expired"
    | "cancelled"
    | "unavailable";
}) {
  const stateCopy = {
    accepted: {
      heading: "You said yes.",
      body: "This invitation has been accepted."
    },
    raincheck: {
      heading: "Raincheck sent.",
      body: invite.counterOffer?.message
        ? `Your note: ${invite.counterOffer.message}`
        : "This invitation is marked for a raincheck."
    },
    declined: {
      heading: "Fair enough. Thanks for being honest.",
      body: "This invitation has been respectfully declined."
    },
    flagged: {
      heading: "This invitation has been flagged.",
      body: "You marked that you do not know this person. No notification is sent to the sender."
    },
    expired: {
      heading: "This invitation has expired.",
      body: "It is no longer available."
    },
    cancelled: {
      heading: "This invitation was cancelled.",
      body: "It is no longer available."
    },
    unavailable: {
      heading: "This invitation is not available.",
      body: "It cannot be answered right now."
    }
  }[pageState];

  return (
    <section
      aria-labelledby="invite-state-heading"
      className="space-y-2 rounded-lg border border-stone-300 bg-white p-5"
    >
      <h2
        className="text-xl font-semibold text-stone-950"
        id="invite-state-heading"
      >
        {stateCopy.heading}
      </h2>
      <p className="text-base text-stone-700">{stateCopy.body}</p>
    </section>
  );
}

function ResponseActions({
  invite,
  presentation,
  previewMode
}: {
  invite: Invite;
  presentation: ReturnType<typeof getModePresentation>;
  previewMode: boolean;
}) {
  return (
    <section
      aria-labelledby="invite-actions-heading"
      className="space-y-4 rounded-lg border border-stone-300 bg-white p-5"
    >
      <div className="space-y-1">
        <h2
          className="text-lg font-semibold text-stone-950"
          id="invite-actions-heading"
        >
          Your answer
        </h2>
        <p className="text-sm text-stone-700">
          Choose the response that feels right.
        </p>
        {previewMode ? (
          <p className="text-sm text-stone-700">
            Preview mode is on, so responses will not be saved.
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ResponseForm
          ariaLabel="Answer yes to this invitation"
          invite={invite}
          label={presentation.responseCopy.yes}
          previewMode={previewMode}
          response="yes"
          variant="primary"
        />
        <ResponseForm
          ariaLabel="Ask for a raincheck"
          invite={invite}
          label={presentation.responseCopy.raincheck}
          previewMode={previewMode}
          response="raincheck"
          variant="secondary"
        />
        <ResponseForm
          ariaLabel="Answer no to this invitation"
          invite={invite}
          label={presentation.responseCopy.no}
          previewMode={previewMode}
          response="no"
          variant="secondary"
        />
      </div>

      <form action={respondToInviteAction} className="space-y-2">
        <input name="slug" type="hidden" value={invite.slug} />
        <input
          name="previewMode"
          type="hidden"
          value={previewMode ? "true" : "false"}
        />
        <input name="response" type="hidden" value="raincheck" />
        <label
          className="block text-sm font-medium text-stone-950"
          htmlFor="counterOfferMessage"
        >
          Optional raincheck note
        </label>
        <textarea
          className="min-h-24 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/20"
          id="counterOfferMessage"
          name="counterOfferMessage"
          rows={3}
        />
        <button
          className="min-h-11 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
          type="submit"
        >
          Send raincheck with note
        </button>
      </form>

      <form action={flagUnknownSenderAction}>
        <input name="slug" type="hidden" value={invite.slug} />
        <input
          name="previewMode"
          type="hidden"
          value={previewMode ? "true" : "false"}
        />
        <button
          className="min-h-11 w-full rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-800 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
          type="submit"
        >
          I do not know this person
        </button>
      </form>
    </section>
  );
}

function ResponseForm({
  ariaLabel,
  invite,
  label,
  previewMode,
  response,
  variant
}: {
  ariaLabel: string;
  invite: Invite;
  label: string;
  previewMode: boolean;
  response: "yes" | "raincheck" | "no";
  variant: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "min-h-11 w-full rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
      : "min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2";

  return (
    <form action={respondToInviteAction}>
      <input name="slug" type="hidden" value={invite.slug} />
      <input
        name="previewMode"
        type="hidden"
        value={previewMode ? "true" : "false"}
      />
      <input name="response" type="hidden" value={response} />
      <button aria-label={ariaLabel} className={className} type="submit">
        {label}
      </button>
    </form>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="font-medium text-stone-600">{label}</dt>
      <dd className="text-base text-stone-950">{value || "Not provided"}</dd>
    </div>
  );
}

function formatToken(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStartsAt(invite: Invite): string | null {
  if (!invite.dateDetails.startsAt) {
    return null;
  }

  const [date, time] = invite.dateDetails.startsAt.split("T");

  return [date, time].filter(Boolean).join(" at ");
}

function getDressHint(invite: Invite): string | null {
  const possibleDressHint = (invite as Invite & { dressHint?: string }).dressHint;

  return possibleDressHint ?? null;
}
