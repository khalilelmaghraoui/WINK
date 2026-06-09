import {
  parseInviteLocalDateTime,
  type InviteLocalDateTimeParts
} from "./invite-date-time";

export interface AcceptedCalendarInput {
  dateTypeLabel: string;
  startsAt: string | null | undefined;
  placeName: string | null;
  placeAddress: string | null;
}

export interface CalendarEventData {
  title: string;
  startsAt: InviteLocalDateTimeParts;
  location: string | null;
  description: string | null;
}

export interface SerializeCalendarEventOptions {
  uid: string;
  generatedAt: Date;
}

const calendarDescription = "Saved from a private WINK invitation.";

export function createCalendarEventData(
  input: AcceptedCalendarInput
): CalendarEventData | null {
  const startsAt = parseInviteLocalDateTime(input.startsAt);

  if (!startsAt) {
    return null;
  }

  return {
    title: `WINK — ${input.dateTypeLabel}`,
    startsAt,
    location: formatLocation(input.placeName, input.placeAddress),
    description: calendarDescription
  };
}

export function serializeCalendarEventToIcs(
  event: CalendarEventData,
  options: SerializeCalendarEventOptions
): string {
  const dtstamp = formatUtcTimestamp(options.generatedAt);

  if (!dtstamp) {
    throw new Error("Cannot serialize calendar event with an invalid timestamp.");
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WINK//Private Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(options.uid)}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART${formatStartsAt(event.startsAt)}`,
    `SUMMARY:${escapeIcsText(event.title)}`
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return `${lines.join("\r\n")}\r\n`;
}

function formatLocation(
  placeName: string | null,
  placeAddress: string | null
): string | null {
  const parts = [placeName, placeAddress]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(", ") : null;
}

function formatStartsAt(startsAt: InviteLocalDateTimeParts): string {
  const date = [
    String(startsAt.year).padStart(4, "0"),
    String(startsAt.month).padStart(2, "0"),
    String(startsAt.day).padStart(2, "0")
  ].join("");

  if (!startsAt.hasTime || startsAt.hour === null || startsAt.minute === null) {
    return `;VALUE=DATE:${date}`;
  }

  return `:${date}T${String(startsAt.hour).padStart(2, "0")}${String(
    startsAt.minute
  ).padStart(2, "0")}00`;
}

function formatUtcTimestamp(value: Date): string | null {
  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return [
    String(value.getUTCFullYear()).padStart(4, "0"),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
    "T",
    String(value.getUTCHours()).padStart(2, "0"),
    String(value.getUTCMinutes()).padStart(2, "0"),
    String(value.getUTCSeconds()).padStart(2, "0"),
    "Z"
  ].join("");
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
