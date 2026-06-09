import { AcceptedPlanActions } from "./accepted-plan-actions";
import type { AcceptedRevealViewModel } from "@/lib/reveal-engine";
import type { LocationLink } from "@/lib/providers/location-provider";

export function AcceptedReveal({
  locationLink,
  reveal
}: {
  locationLink: LocationLink | null;
  reveal: AcceptedRevealViewModel;
}) {
  return (
    <section
      aria-labelledby="accepted-reveal-heading"
      className="space-y-6 rounded-lg border border-wink-border border-t-wink-success bg-wink-surface p-5 shadow-[0_18px_50px_rgba(24,21,18,0.08)]"
    >
      <div className="space-y-3 border-b border-wink-border pb-5">
        <p className="text-sm font-semibold uppercase text-wink-success">
          Accepted
        </p>
        <h1
          className="font-display text-3xl font-semibold leading-tight text-wink-text"
          id="accepted-reveal-heading"
        >
          {reveal.heading}
        </h1>
        <p className="text-base leading-7 text-wink-text-secondary">
          {reveal.summary}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-wink-text">
          Invitation message
        </h2>
        <p className="whitespace-pre-wrap break-words text-base leading-7 text-wink-text">
          {reveal.message}
        </p>
      </div>

      <section
        aria-labelledby="accepted-reveal-when"
        className="border-t border-wink-border pt-5"
      >
        <h2
          className="text-sm font-semibold uppercase text-wink-text-secondary"
          id="accepted-reveal-when"
        >
          When
        </h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <RevealDetail label="Plan" value={reveal.dateTypeLabel} />
          {reveal.hasDateDetails ? (
            <RevealDetail label="Time" value={reveal.startsAtLabel} />
          ) : null}
        </dl>
      </section>

      {reveal.hasPlaceDetails ? (
        <section
          aria-labelledby="accepted-reveal-place"
          className="space-y-3 border-t border-wink-border pt-5"
        >
          <h2
            className="text-sm font-semibold uppercase text-wink-text-secondary"
            id="accepted-reveal-place"
          >
            Place
          </h2>
          <PlaceDetails
            address={reveal.placeAddress}
            name={reveal.placeName}
          />
        </section>
      ) : null}

      {reveal.dressHint ? (
        <section
          aria-labelledby="accepted-reveal-note"
          className="space-y-1 border-t border-wink-border pt-5"
        >
          <h2
            className="text-sm font-semibold uppercase text-wink-text-secondary"
            id="accepted-reveal-note"
          >
            Note
          </h2>
          <p className="break-words text-base leading-7 text-wink-text">
            {reveal.dressHint}
          </p>
        </section>
      ) : null}

      <AcceptedPlanActions
        calendar={reveal.calendar}
        locationLink={locationLink}
      />

      <p className="border-t border-wink-border pt-4 text-sm leading-6 text-wink-text-secondary">
        Keep this private link. It stays your plan.
      </p>
    </section>
  );
}

function PlaceDetails({
  address,
  name
}: {
  address: string | null;
  name: string | null;
}) {
  return (
    <div className="space-y-1">
      {name ? (
        <p className="break-words text-base font-semibold leading-7 text-wink-text">
          {name}
        </p>
      ) : null}
      {address ? (
        <p className="break-words text-base leading-7 text-wink-text-secondary">
          {address}
        </p>
      ) : null}
    </div>
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
