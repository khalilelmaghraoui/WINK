import { getRaincheckStateDetails } from "@/lib/invite-page";
import type { Invite } from "@/lib/invite-store";

export function RaincheckState({ invite }: { invite: Invite }) {
  const details = getRaincheckStateDetails(invite);
  const hasDetails =
    details.selectedOptionLabel || details.note || details.suggestedDate;

  return (
    <section
      aria-labelledby="raincheck-state-heading"
      className="space-y-4 rounded-lg border border-stone-300 bg-white p-5"
    >
      <div className="space-y-2">
        <h2
          className="text-xl font-semibold text-stone-950"
          id="raincheck-state-heading"
        >
          Raincheck sent.
        </h2>
        <p className="text-base text-stone-700">
          Timing did not work out, but the door is still open.
        </p>
      </div>

      {hasDetails ? (
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <Detail label="Reason" value={details.selectedOptionLabel} />
          <Detail label="Note" value={details.note} />
          <Detail label="Suggested day" value={details.suggestedDate} />
        </dl>
      ) : null}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="space-y-1">
      <dt className="font-medium text-stone-600">{label}</dt>
      <dd className="text-base text-stone-950">{value}</dd>
    </div>
  );
}
