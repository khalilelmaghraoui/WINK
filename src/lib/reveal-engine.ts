import type { Invite } from "./invite-store";

export interface AcceptedRevealViewModel {
  heading: string;
  summary: string;
  dateTypeLabel: string;
  startsAtLabel: string | null;
  placeName: string | null;
  placeAddress: string | null;
  dressHint: string | null;
  message: string;
  hasDateDetails: boolean;
  hasPlaceDetails: boolean;
}

export function getAcceptedRevealViewModel(
  invite: Invite
): AcceptedRevealViewModel {
  const startsAtLabel = formatStartsAt(invite.dateDetails.startsAt);
  const placeName = cleanOptionalText(invite.placeDetails.name);
  const placeAddress = cleanOptionalText(invite.placeDetails.address);
  const dressHint = getDressHint(invite);

  return {
    heading: "It's a yes.",
    summary: "The plan is here whenever you need it.",
    dateTypeLabel: formatToken(invite.dateType),
    startsAtLabel,
    placeName,
    placeAddress,
    dressHint,
    message: invite.message,
    hasDateDetails: startsAtLabel !== null,
    hasPlaceDetails: placeName !== null || placeAddress !== null
  };
}

function formatStartsAt(value: string | undefined): string | null {
  const cleaned = cleanOptionalText(value);

  if (!cleaned) {
    return null;
  }

  const parsed = parseLocalStartsAt(cleaned);

  if (!parsed) {
    return cleaned;
  }

  const dateLabel = [
    weekdayNames[getDayOfWeek(parsed.year, parsed.month, parsed.day)],
    `${monthNames[parsed.month - 1]} ${parsed.day}`
  ].join(", ");

  if (!parsed.time) {
    return dateLabel;
  }

  return `${dateLabel} \u00b7 ${formatLocalTime(parsed.time.hour, parsed.time.minute)}`;
}

function getDressHint(invite: Invite): string | null {
  const possibleDressHint = cleanOptionalText(
    (invite as Invite & { dressHint?: string }).dressHint
  );

  return possibleDressHint ?? cleanOptionalText(invite.placeDetails.notes);
}

function cleanOptionalText(value: string | undefined): string | null {
  const cleaned = value?.trim();

  return cleaned ? cleaned : null;
}

function formatToken(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
] as const;

interface ParsedLocalStartsAt {
  year: number;
  month: number;
  day: number;
  time: {
    hour: number;
    minute: number;
  } | null;
}

function parseLocalStartsAt(value: string): ParsedLocalStartsAt | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(
    value
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = match[4] ? Number(match[4]) : null;
  const minute = match[5] ? Number(match[5]) : null;

  if (!isValidDateParts(year, month, day)) {
    return null;
  }

  if (hour === null || minute === null) {
    return {
      year,
      month,
      day,
      time: null
    };
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return {
    year,
    month,
    day,
    time: {
      hour,
      minute
    }
  };
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= getDaysInMonth(year, month)
  );
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isLeapYear(year: number): boolean {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function getDayOfWeek(year: number, month: number, day: number): number {
  const monthOffsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const adjustedYear = month < 3 ? year - 1 : year;

  return (
    adjustedYear +
    Math.floor(adjustedYear / 4) -
    Math.floor(adjustedYear / 100) +
    Math.floor(adjustedYear / 400) +
    monthOffsets[month - 1] +
    day
  ) % 7;
}

function formatLocalTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
}
