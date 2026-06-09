import type { LocationLink } from "@/lib/providers/location-provider";

export function OpenInMaps({ locationLink }: { locationLink: LocationLink }) {
  return (
    <div className="space-y-2">
      <a
        aria-label={locationLink.accessibleLabel}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-center text-sm font-semibold text-wink-text transition-colors duration-200 hover:border-wink-focus hover:bg-wink-surface-muted focus:outline-none focus:ring-2 focus:ring-wink-focus focus:ring-offset-2 focus:ring-offset-wink-background sm:w-auto"
        href={locationLink.href}
        referrerPolicy="no-referrer"
        rel="noopener noreferrer"
        target="_blank"
      >
        Open in {locationLink.providerLabel}
      </a>
      <p className="text-sm leading-6 text-wink-text-secondary">
        The place is shared with {locationLink.providerLabel} only when you open
        the link.
      </p>
    </div>
  );
}
