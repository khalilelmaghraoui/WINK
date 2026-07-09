import type { Metadata } from "next";

import { cancelSenderInviteFormAction } from "./actions";
import {
  SenderControls,
  type SenderControlsCancelStatus
} from "./sender-controls";
import { getEffectiveInvite } from "@/lib/invite-lifecycle";
import { inviteStore } from "@/lib/invite-store";
import { formatInviteDateTime } from "@/lib/invite-date-time";
import {
  getSenderStatusViewModel,
  type SenderStatusKind,
  type SenderStatusRaincheck,
  type SenderStatusViewModel
} from "@/lib/sender-status";
import { isInvitePersistenceConfigurationError } from "@/lib/storage/invite-store-config";
import {
  PageShell,
  PrivateLinkNotice,
  SectionDivider,
  StatusCard
} from "../../../components/ui";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Private WINK status",
  description: "Open your private WINK link to view the invitation status.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "Private WINK status",
    description: "Open your private WINK link to view the invitation status.",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Private WINK status",
    description: "Open your private WINK link to view the invitation status."
  }
};

interface SenderStatusPageProps {
  params: Promise<{
    token: string;
  }>;
  searchParams?: Promise<{
    cancel?: string | string[];
  }>;
}

export default async function SenderStatusPage({
  params,
  searchParams
}: SenderStatusPageProps) {
  const { token } = await params;
  const cancelStatus = normalizeCancelStatus((await searchParams)?.cancel);

  try {
    const loadedInvite = await inviteStore.getInviteBySenderToken(token);

    if (!loadedInvite) {
      return <SenderUnavailableState />;
    }

    const invite = getEffectiveInvite(loadedInvite, new Date());
    const viewModel = getSenderStatusViewModel(invite);

    if (viewModel.isUnavailable) {
      return <SenderUnavailableState />;
    }

    return (
      <SenderStatusView
        cancelAction={cancelSenderInviteFormAction.bind(null, token)}
        cancelStatus={cancelStatus}
        recipientPath={`/i/${invite.slug}`}
        viewModel={viewModel}
      />
    );
  } catch (error) {
    if (isInvitePersistenceConfigurationError(error)) {
      return <SenderTemporaryUnavailableState />;
    }

    throw error;
  }
}

function SenderStatusView({
  cancelAction,
  cancelStatus,
  recipientPath,
  viewModel
}: {
  cancelAction: (formData: FormData) => Promise<never>;
  cancelStatus: SenderControlsCancelStatus;
  recipientPath: string;
  viewModel: SenderStatusViewModel;
}) {
  return (
    <PageShell className="py-8 sm:py-12" maxWidth="invite">
      <div className="space-y-5">
        <PrivateLinkNotice eyebrow="Private post office receipt">
          Anyone with this link can see this page. WINK cannot recover it if
          lost.
        </PrivateLinkNotice>

        <StatusCard
          description={
            <span>
              {viewModel.heading} {viewModel.summary}
            </span>
          }
          quotedMessage={viewModel.recipientMessage ?? undefined}
          status={toReceiptStatus(viewModel.kind)}
          title={getReceiptTitle(viewModel.kind)}
        >
          <p className="text-xs font-semibold uppercase text-wink-text-secondary">
            {viewModel.label}
          </p>

        {viewModel.plan ? <PlanSummary viewModel={viewModel} /> : null}
        {viewModel.raincheck ? (
          <RaincheckSummary raincheck={viewModel.raincheck} />
        ) : null}
        {viewModel.kind === "declined" && !viewModel.recipientMessage ? (
          <DeclineMessage
            noMessageText={viewModel.noMessageText}
            recipientMessage={viewModel.recipientMessage}
          />
        ) : null}

          <SectionDivider />

        <SenderControls
          canCancel={viewModel.kind === "pending" || viewModel.kind === "opened"}
          cancelAction={cancelAction}
          cancelStatus={cancelStatus}
          recipientPath={recipientPath}
        />

        <p className="border-t border-wink-border pt-4 text-sm text-wink-text-secondary">
          Keep this private link. Anyone with it can view this status page.
        </p>
        </StatusCard>
      </div>
    </PageShell>
  );
}

function PlanSummary({ viewModel }: { viewModel: SenderStatusViewModel }) {
  const plan = viewModel.plan;

  if (!plan) {
    return null;
  }

  return (
    <section
      aria-labelledby="sender-plan-heading"
      className="space-y-3 border-t border-wink-border pt-4"
    >
      <h2
        className="text-lg font-semibold text-wink-text"
        id="sender-plan-heading"
      >
        Plan summary
      </h2>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <Detail label="Type" value={plan.dateTypeLabel} />
        <Detail label="When" value={plan.startsAtLabel} />
        <Detail label="Place" value={plan.placeName} />
        <Detail label="Address" value={plan.placeAddress} />
      </dl>
    </section>
  );
}

function RaincheckSummary({
  raincheck
}: {
  raincheck: SenderStatusRaincheck;
}) {
  return (
    <section
      aria-labelledby="sender-raincheck-heading"
      className="space-y-3 border-t border-wink-border pt-4"
    >
      <h2
        className="text-lg font-semibold text-wink-text"
        id="sender-raincheck-heading"
      >
        Raincheck details
      </h2>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <Detail label="Option" value={raincheck.selectedOptionLabel} />
        <Detail
          label="Suggested day"
          value={formatInviteDateTime(raincheck.suggestedDate)}
        />
        <Detail label="Suggested place" value={raincheck.proposedPlace} />
      </dl>
      {raincheck.message ? (
        <p className="whitespace-pre-wrap break-words text-base leading-7 text-wink-text">
          {raincheck.message}
        </p>
      ) : null}
    </section>
  );
}

function DeclineMessage({
  noMessageText,
  recipientMessage
}: {
  noMessageText: string | null;
  recipientMessage: string | null;
}) {
  return (
    <section
      aria-labelledby="sender-message-heading"
      className="space-y-3 border-t border-wink-border pt-4"
    >
      <h2
        className="text-lg font-semibold text-wink-text"
        id="sender-message-heading"
      >
        A message from the recipient
      </h2>
      {recipientMessage ? (
        <p className="whitespace-pre-wrap break-words rounded-md border border-wink-border bg-wink-surface-muted px-3 py-3 text-base leading-7 text-wink-text">
          {recipientMessage}
        </p>
      ) : (
        <p className="text-base text-wink-text-secondary">{noMessageText}</p>
      )}
    </section>
  );
}

function SenderUnavailableState() {
  return (
    <PageShell className="flex items-center" maxWidth="invite">
      <StatusCard
        description="This private link cannot show invitation details."
        status="expired"
        title="This invitation is no longer available."
      />
    </PageShell>
  );
}

function SenderTemporaryUnavailableState() {
  return (
    <PageShell className="flex items-center" maxWidth="invite">
      <StatusCard
        description="Please try again in a moment."
        status="pending"
        title="This status could not be loaded right now."
      />
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="font-medium text-wink-text-secondary">{label}</dt>
      <dd className="break-words text-base text-wink-text">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function normalizeCancelStatus(
  value: string | string[] | undefined
): SenderControlsCancelStatus {
  const status = Array.isArray(value) ? value[0] : value;

  return status === "success" || status === "unavailable" ? status : null;
}

type ReceiptStatus =
  | "pending"
  | "opened"
  | "accepted"
  | "rainchecked"
  | "declined"
  | "cancelled"
  | "expired"
  | "flagged";

function toReceiptStatus(kind: SenderStatusKind): ReceiptStatus {
  if (kind === "raincheck") {
    return "rainchecked";
  }

  if (kind === "unavailable") {
    return "expired";
  }

  return kind;
}

function getReceiptTitle(kind: SenderStatusKind): string {
  const titles: Record<SenderStatusKind, string> = {
    accepted: "Accepted.",
    cancelled: "Cancelled.",
    declined: "Declined.",
    expired: "Expired.",
    opened: "Opened.",
    pending: "Pending.",
    raincheck: "Rainchecked.",
    unavailable: "Unavailable."
  };

  return titles[kind];
}
