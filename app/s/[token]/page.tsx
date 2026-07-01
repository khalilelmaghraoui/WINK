import type { Metadata } from "next";

import { cancelSenderInviteAction } from "./actions";
import type { SenderCancelActionState } from "./actions";
import { SenderControls } from "./sender-controls";
import { getEffectiveInvite } from "@/lib/invite-lifecycle";
import { inviteStore } from "@/lib/invite-store";
import { formatInviteDateTime } from "@/lib/invite-date-time";
import {
  getSenderStatusViewModel,
  type SenderStatusRaincheck,
  type SenderStatusViewModel
} from "@/lib/sender-status";
import { isInvitePersistenceConfigurationError } from "@/lib/storage/invite-store-config";

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
}

export default async function SenderStatusPage({
  params
}: SenderStatusPageProps) {
  const { token } = await params;

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
        cancelAction={cancelSenderInviteAction.bind(null, token)}
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
  recipientPath,
  viewModel
}: {
  cancelAction: (
    state: SenderCancelActionState,
    formData: FormData
  ) => Promise<SenderCancelActionState>;
  recipientPath: string;
  viewModel: SenderStatusViewModel;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8">
      <article className="space-y-6 rounded-lg border border-stone-300 bg-white p-5">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase text-stone-600">
            {viewModel.label}
          </p>
          <h1 className="text-2xl font-semibold text-stone-950">
            {viewModel.heading}
          </h1>
          <p className="text-base text-stone-700">{viewModel.summary}</p>
        </header>

        {viewModel.plan ? <PlanSummary viewModel={viewModel} /> : null}
        {viewModel.raincheck ? (
          <RaincheckSummary raincheck={viewModel.raincheck} />
        ) : null}
        {viewModel.kind === "declined" ? (
          <DeclineMessage
            noMessageText={viewModel.noMessageText}
            recipientMessage={viewModel.recipientMessage}
          />
        ) : null}

        <SenderControls
          canCancel={viewModel.kind === "pending" || viewModel.kind === "opened"}
          cancelAction={cancelAction}
          recipientPath={recipientPath}
        />

        <p className="border-t border-stone-200 pt-4 text-sm text-stone-600">
          Keep this private link. Anyone with it can view this status page.
        </p>
      </article>
    </main>
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
      className="space-y-3 border-t border-stone-200 pt-4"
    >
      <h2
        className="text-lg font-semibold text-stone-950"
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
      className="space-y-3 border-t border-stone-200 pt-4"
    >
      <h2
        className="text-lg font-semibold text-stone-950"
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
        <p className="whitespace-pre-wrap break-words text-base leading-7 text-stone-800">
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
      className="space-y-3 border-t border-stone-200 pt-4"
    >
      <h2
        className="text-lg font-semibold text-stone-950"
        id="sender-message-heading"
      >
        A message from the recipient
      </h2>
      {recipientMessage ? (
        <p className="whitespace-pre-wrap break-words rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-base leading-7 text-stone-900">
          {recipientMessage}
        </p>
      ) : (
        <p className="text-base text-stone-700">{noMessageText}</p>
      )}
    </section>
  );
}

function SenderUnavailableState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-5 py-10">
      <section className="space-y-3 rounded-lg border border-stone-300 bg-white p-5">
        <p className="text-sm font-medium text-stone-600">Private status</p>
        <h1 className="text-2xl font-semibold text-stone-950">
          This invitation is no longer available.
        </h1>
        <p className="text-base text-stone-700">
          This private link cannot show invitation details.
        </p>
      </section>
    </main>
  );
}

function SenderTemporaryUnavailableState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-5 py-10">
      <section className="space-y-3 rounded-lg border border-stone-300 bg-white p-5">
        <p className="text-sm font-medium text-stone-600">
          Temporarily unavailable
        </p>
        <h1 className="text-2xl font-semibold text-stone-950">
          This status could not be loaded right now.
        </h1>
        <p className="text-base text-stone-700">
          Please try again in a moment.
        </p>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="font-medium text-stone-600">{label}</dt>
      <dd className="break-words text-base text-stone-950">
        {value || "Not provided"}
      </dd>
    </div>
  );
}
