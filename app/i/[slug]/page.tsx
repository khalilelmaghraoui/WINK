import type { Metadata } from "next";

import { flagUnknownSenderAction, respondToInviteAction } from "./actions";
import { AcceptedReveal } from "./accepted-reveal";
import { CompatibilityReport } from "./compatibility-report";
import { KindReplyAssistant } from "./kind-reply-assistant";
import { LawyerMode } from "./lawyer-mode";
import { RaincheckPanel } from "./raincheck-panel";
import { RaincheckState } from "./raincheck-state";
import { UnbotheredMode } from "./unbothered-mode";
import {
  getInvitePageLoadResult,
  getInvitePageMetadata,
  getRecipientPageState,
  isPreviewModeParam,
  shouldShowCompatibilityReport,
  shouldShowInviteDetails,
  shouldShowKindReplyAssistant,
  shouldShowLawyerMode,
  shouldShowRaincheckPanel,
  shouldShowUnbotheredMode
} from "@/lib/invite-page";
import { formatInviteDateTime } from "@/lib/invite-date-time";
import { getInviteLocationLink } from "@/lib/invite-location";
import { inviteStore } from "@/lib/invite-store";
import type { Invite } from "@/lib/invite-store";
import { getModePresentation } from "@/lib/mode-engine";
import { createGoogleMapsLocationProvider } from "@/lib/providers/google-maps-location-provider";
import { getAcceptedRevealViewModel } from "@/lib/reveal-engine";
import {
  CinematicEnvelope,
  InviteCard,
  ModeBadge,
  PageShell,
  PrimaryButton,
  ResponseButtonGroup,
  SecondaryButton,
  SectionDivider
} from "../../../components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = getInvitePageMetadata();

interface InvitePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    previewMode?: string | string[];
    signatureError?: string | string[];
  }>;
}

export default async function InvitePage({
  params,
  searchParams
}: InvitePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const previewMode = isPreviewModeParam(resolvedSearchParams?.previewMode);
  const loadResult = await getInvitePageLoadResult({
    previewMode,
    slug: resolvedParams.slug,
    store: inviteStore
  });

  if (loadResult.state === "temporarily_unavailable") {
    return <TemporaryUnavailableState />;
  }

  if (loadResult.state === "not_found") {
    return <InviteNotFoundState />;
  }

  const invite = loadResult.invite;

  const pageState = getRecipientPageState(invite.status);
  const presentation = getModePresentation(invite);
  const acceptedReveal =
    pageState === "accepted" ? getAcceptedRevealViewModel(invite) : null;
  const locationLink =
    pageState === "accepted"
      ? getInviteLocationLink(
          invite.placeDetails,
          createGoogleMapsLocationProvider()
        )
      : null;
  const showLawyerMode = shouldShowLawyerMode({
    mode: invite.mode,
    state: pageState
  });
  const showUnbotheredMode = shouldShowUnbotheredMode({
    mode: invite.mode,
    state: pageState
  });
  const showInviteDetails = shouldShowInviteDetails(pageState);
  const signatureError = isPreviewModeParam(
    resolvedSearchParams?.signatureError
  );

  return (
    <PageShell className="py-8 sm:py-12" maxWidth="invite" variant="dim">
      <div className="space-y-5">
        {pageState !== "accepted" && previewMode ? (
          <p className="rounded-md border border-wink-border bg-wink-background px-3 py-2 text-sm text-wink-text-secondary">
            Preview mode is on. No opens or actions will be saved.
          </p>
        ) : null}

        {pageState === "respondable" ? (
          <div aria-hidden="true" className="mx-auto max-w-[520px] opacity-45 blur-[1px]">
            <CinematicEnvelope open recipient={invite.recipientName} size="md" />
          </div>
        ) : null}

        <InviteCard
          eyebrow={
            pageState === "accepted"
              ? "It's a date"
              : `A private invitation for ${invite.recipientName}`
          }
          message={pageState !== "accepted" ? presentation.subtitle : undefined}
          modeSlot={
            pageState !== "accepted" ? (
              <ModeBadge mode={invite.mode} />
            ) : null
          }
          title={pageState === "accepted" ? "It's a date." : presentation.headline}
          titleId="recipient-invite-heading"
          variant={pageState === "accepted" ? "accepted" : "live"}
        >
          {pageState === "raincheck" ? (
            <>
              <RaincheckState invite={invite} />
              <SectionDivider />
            </>
          ) : null}

          {acceptedReveal ? (
            <AcceptedReveal locationLink={locationLink} reveal={acceptedReveal} />
          ) : null}

          {pageState !== "respondable" &&
          pageState !== "raincheck" &&
          pageState !== "accepted" ? (
            <StateMessage pageState={pageState} />
          ) : null}

          {shouldShowKindReplyAssistant(pageState) ? (
            <KindReplyAssistant invite={invite} />
          ) : null}

          {shouldShowCompatibilityReport(pageState) ? (
            <>
              {!showUnbotheredMode ? (
                <section
                  aria-labelledby="mode-presentation-heading"
                  className="space-y-3"
                >
                  <p className="text-xs font-semibold uppercase text-wink-text-secondary">
                    {presentation.modeLabel} mode
                  </p>
                  <h2
                    className="text-lg font-semibold text-wink-text"
                    id="mode-presentation-heading"
                  >
                    {invite.recipientName}, you have an invitation.
                  </h2>
                  <p className="text-base leading-7 text-wink-text">
                    {presentation.body}
                  </p>
                  <p className="text-sm text-wink-text-secondary">
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

          {showInviteDetails &&
          pageState !== "accepted" &&
          !showLawyerMode &&
          !showUnbotheredMode ? (
            <section aria-labelledby="invite-message-heading" className="space-y-3">
              <h2
                className="text-sm font-semibold uppercase text-wink-text-secondary"
                id="invite-message-heading"
              >
                Message
              </h2>
              <p className="whitespace-pre-wrap font-display text-xl italic leading-relaxed text-wink-text">
                {invite.message}
              </p>
            </section>
          ) : null}

          {showInviteDetails && pageState !== "accepted" ? (
            <section aria-labelledby="invite-details-heading" className="space-y-4">
              <SectionDivider />
              <h2
                className="text-sm font-semibold uppercase text-wink-text-secondary"
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
                <Detail
                  label="Date and time"
                  value={formatInviteDateTime(invite.dateDetails.startsAt)}
                />
                <Detail label="Place" value={invite.placeDetails.name} />
                <Detail label="Address" value={invite.placeDetails.address} />
                <Detail label="Dress hint" value={getDressHint(invite)} />
              </dl>
            </section>
          ) : null}

          {pageState === "respondable" &&
          !showLawyerMode &&
          !showUnbotheredMode ? (
            <ResponseActions
              invite={invite}
              presentation={presentation}
              previewMode={previewMode}
            />
          ) : null}
        </InviteCard>
      </div>
    </PageShell>
  );
}

function InviteNotFoundState() {
  return (
    <PageShell className="flex items-center" maxWidth="invite" variant="dim">
      <InviteCard
        eyebrow="Invite not found"
        title="This invitation is not available."
        titleId="invite-not-found-heading"
        variant="preview"
      >
        <p className="text-base text-wink-text-secondary">
          Check the link and try again.
        </p>
      </InviteCard>
    </PageShell>
  );
}

function TemporaryUnavailableState() {
  return (
    <PageShell className="flex items-center" maxWidth="invite" variant="dim">
      <InviteCard
        eyebrow="Temporarily unavailable"
        title="This invitation could not be loaded right now."
        titleId="invite-temporary-unavailable-heading"
        variant="preview"
      >
        <p className="text-base text-wink-text-secondary">
          Please try again in a moment.
        </p>
      </InviteCard>
    </PageShell>
  );
}

function StateMessage({
  pageState
}: {
  pageState:
    | "accepted"
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
    declined: {
      heading: "Fair enough. Thanks for being honest.",
      body: "This invitation has been respectfully declined."
    },
    flagged: {
      heading: "This invitation has been flagged.",
      body: "You marked that you do not know this person. No notification is sent to the sender."
    },
    expired: {
      eyebrow: "Invitation expired",
      heading: "This invitation is no longer open for responses.",
      body: "The sender can create a new invitation if the plan is still on."
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
      className="space-y-2"
    >
      {"eyebrow" in stateCopy ? (
        <p className="text-xs font-semibold uppercase text-wink-text-secondary">
          {stateCopy.eyebrow}
        </p>
      ) : null}
      <h2
        className="text-xl font-semibold text-wink-text"
        id="invite-state-heading"
      >
        {stateCopy.heading}
      </h2>
      <p className="text-base text-wink-text-secondary">{stateCopy.body}</p>
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
      className="space-y-4 border-t border-wink-border pt-5"
    >
      <div className="space-y-1">
        <h2
          className="text-base font-semibold text-wink-text"
          id="invite-actions-heading"
        >
          Your answer
        </h2>
        <p className="text-sm text-wink-text-secondary">
          Choose the response that feels right. Yes, Raincheck, and No are all
          valid.
        </p>
        {previewMode ? (
          <p className="text-sm text-wink-text-secondary">
            Preview mode is on, so responses will not be saved.
          </p>
        ) : null}
      </div>

      <ResponseButtonGroup>
        <ResponseForm
          ariaLabel="Answer yes to this invitation"
          invite={invite}
          label={presentation.responseCopy.yes}
          previewMode={previewMode}
          response="yes"
          variant="primary"
        />
        {shouldShowRaincheckPanel("respondable") ? (
          <RaincheckPanel
            previewMode={previewMode}
            slug={invite.slug}
            triggerLabel={presentation.responseCopy.raincheck}
          />
        ) : null}
        <ResponseForm
          ariaLabel="Answer no to this invitation"
          invite={invite}
          label={presentation.responseCopy.no}
          previewMode={previewMode}
          response="no"
          variant="secondary"
        />
      </ResponseButtonGroup>

      <form action={flagUnknownSenderAction}>
        <input name="slug" type="hidden" value={invite.slug} />
        <input
          name="previewMode"
          type="hidden"
          value={previewMode ? "true" : "false"}
        />
        <button
          className="min-h-11 w-full rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-medium text-wink-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
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
  response: "yes" | "no";
  variant: "primary" | "secondary";
}) {
  return (
    <form action={respondToInviteAction}>
      <input name="slug" type="hidden" value={invite.slug} />
      <input
        name="previewMode"
        type="hidden"
        value={previewMode ? "true" : "false"}
      />
      <input name="response" type="hidden" value={response} />
      {variant === "primary" ? (
        <PrimaryButton aria-label={ariaLabel} className="w-full" type="submit">
          {label}
        </PrimaryButton>
      ) : (
        <SecondaryButton aria-label={ariaLabel} className="w-full" type="submit">
          {label}
        </SecondaryButton>
      )}
    </form>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="font-semibold text-wink-text-secondary">{label}</dt>
      <dd className="break-words text-base leading-7 text-wink-text">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function formatToken(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDressHint(invite: Invite): string | null {
  const possibleDressHint = (invite as Invite & { dressHint?: string }).dressHint;

  return possibleDressHint ?? null;
}
