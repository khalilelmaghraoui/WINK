const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  weekday: "long"
});

interface ParsedInviteDateTime {
  year: number;
  month: number;
  day: number;
  time: {
    hour: number;
    minute: number;
  } | null;
}

export function formatInviteDateTime(
  rawValue: string | null | undefined
): string | null {
  const cleaned = rawValue?.trim();

  if (!cleaned) {
    return null;
  }

  const parsed = parseInviteDateTime(cleaned);

  if (!parsed) {
    return formatMalformedFallback(cleaned);
  }

  const dateLabel = formatDateLabel(parsed);

  if (!parsed.time) {
    return dateLabel;
  }

  return `${dateLabel} \u00b7 ${formatTimeLabel(parsed.time.hour, parsed.time.minute)}`;
}

function parseInviteDateTime(value: string): ParsedInviteDateTime | null {
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

  if (!isValidCalendarDate(year, month, day)) {
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

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function formatDateLabel({
  day,
  month,
  year
}: Pick<ParsedInviteDateTime, "day" | "month" | "year">): string {
  const date = new Date(Date.UTC(year, month - 1, day));

  return dateFormatter.format(date);
}

function formatTimeLabel(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = String(minute).padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
}

function formatMalformedFallback(value: string): string {
  return value.replace("T", " at ");
}
