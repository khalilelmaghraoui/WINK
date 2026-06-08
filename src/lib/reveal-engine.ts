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

  const [date, time] = cleaned.split("T");

  return [date, time].filter(Boolean).join(" at ");
}

function getDressHint(invite: Invite): string | null {
  const possibleDressHint = cleanOptionalText(
    (invite as Invite & { dressHint?: string }).dressHint
  );

  return (
    possibleDressHint ??
    cleanOptionalText(invite.placeDetails.notes) ??
    cleanOptionalText(invite.dateDetails.notes)
  );
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
