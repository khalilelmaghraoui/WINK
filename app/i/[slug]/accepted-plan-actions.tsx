import { AddToCalendar } from "./add-to-calendar";
import { OpenInMaps } from "./open-in-maps";
import type { LocationLink } from "@/lib/providers/location-provider";
import type { AcceptedRevealCalendarData } from "@/lib/reveal-engine";

export function AcceptedPlanActions({
  calendar,
  locationLink
}: {
  calendar: AcceptedRevealCalendarData | null;
  locationLink: LocationLink | null;
}) {
  if (!calendar && !locationLink) {
    return null;
  }

  return (
    <section
      aria-labelledby="accepted-plan-actions-heading"
      className="border-t border-wink-border pt-5"
    >
      <div className="space-y-3">
        <h2
          className="text-sm font-semibold uppercase text-wink-text-secondary"
          id="accepted-plan-actions-heading"
        >
          Plan actions
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {calendar ? <AddToCalendar calendar={calendar} /> : null}
          {locationLink ? <OpenInMaps locationLink={locationLink} /> : null}
        </div>
      </div>
    </section>
  );
}
