import type { AcceptedRevealViewModel } from "@/lib/reveal-engine";

export function AcceptedReveal({
  reveal
}: {
  reveal: AcceptedRevealViewModel;
}) {
  return (
    <section
      aria-labelledby="accepted-reveal-heading"
      className="space-y-5 rounded-lg border border-wink-border bg-wink-surface p-5 shadow-[0_18px_50px_rgba(24,21,18,0.08)]"
    >
      <div className="space-y-3 border-b border-wink-border pb-5">
        <p className="text-sm font-semibold uppercase text-wink-success">
          Accepted
        </p>
        <h2
          className="font-display text-3xl font-semibold leading-tight text-wink-text"
          id="accepted-reveal-heading"
        >
          {reveal.heading}
        </h2>
        <p className="text-base leading-7 text-wink-text-secondary">
          {reveal.summary}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-wink-text">
          Invitation message
        </h3>
        <p className="whitespace-pre-wrap break-words text-base leading-7 text-wink-text">
          {reveal.message}
        </p>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <RevealDetail label="Date type" value={reveal.dateTypeLabel} />
        {reveal.hasDateDetails ? (
          <RevealDetail label="When" value={reveal.startsAtLabel} />
        ) : null}
      </dl>

      {reveal.hasPlaceDetails ? (
        <div className="space-y-3 rounded-md border border-wink-border bg-wink-background p-4">
          <h3 className="text-base font-semibold text-wink-text">Place</h3>
          <dl className="grid gap-4 text-sm">
            <RevealDetail label="Name" value={reveal.placeName} />
            <RevealDetail label="Address" value={reveal.placeAddress} />
          </dl>
        </div>
      ) : null}

      {reveal.dressHint ? (
        <div className="space-y-1 rounded-md border border-wink-border bg-wink-background p-4">
          <p className="text-sm font-semibold text-wink-text-secondary">
            Dress hint
          </p>
          <p className="break-words text-base leading-7 text-wink-text">
            {reveal.dressHint}
          </p>
        </div>
      ) : null}

      <p className="border-t border-wink-border pt-4 text-sm leading-6 text-wink-text-secondary">
        You can revisit this same private link if you need the plan again.
      </p>
    </section>
  );
}

function RevealDetail({
  label,
  value
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="space-y-1">
      <dt className="font-semibold text-wink-text-secondary">{label}</dt>
      <dd className="break-words text-base leading-7 text-wink-text">
        {value}
      </dd>
    </div>
  );
}
