import type { Invite } from "./invite-store";
import {
  formatInviteDateTime,
  parseInviteLocalDateTime
} from "./invite-date-time";

export interface AcceptedRevealCalendarData {
  dateTypeLabel: string;
  startsAt: string;
  placeName: string | null;
  placeAddress: string | null;
}

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
  calendar: AcceptedRevealCalendarData | null;
}

export function getAcceptedRevealViewModel(
  invite: Invite
): AcceptedRevealViewModel {
  const startsAtLabel = formatInviteDateTime(invite.dateDetails.startsAt);
  const dateTypeLabel = formatToken(invite.dateType);
  const placeName = cleanOptionalText(invite.placeDetails.name);
  const placeAddress = cleanOptionalText(invite.placeDetails.address);
  const dressHint = getDressHint(invite);

  return {
    heading: "It's a yes.",
    summary: "The plan is here whenever you need it.",
    dateTypeLabel,
    startsAtLabel,
    placeName,
    placeAddress,
    dressHint,
    message: invite.message,
    hasDateDetails: startsAtLabel !== null,
    hasPlaceDetails: placeName !== null || placeAddress !== null,
    calendar: getCalendarData({
      dateTypeLabel,
      placeAddress,
      placeName,
      startsAt: invite.dateDetails.startsAt
    })
  };
}

function getCalendarData({
  dateTypeLabel,
  placeAddress,
  placeName,
  startsAt
}: {
  dateTypeLabel: string;
  placeAddress: string | null;
  placeName: string | null;
  startsAt: string | undefined;
}): AcceptedRevealCalendarData | null {
  const cleanedStartsAt = cleanOptionalText(startsAt);

  if (!cleanedStartsAt || !parseInviteLocalDateTime(cleanedStartsAt)) {
    return null;
  }

  return {
    dateTypeLabel,
    startsAt: cleanedStartsAt,
    placeName,
    placeAddress
  };
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
