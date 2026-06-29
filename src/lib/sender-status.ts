import { formatInviteDateTime } from "./invite-date-time";
import type { Invite, RaincheckOption } from "./invite-store";

export type SenderStatusKind =
  | "pending"
  | "opened"
  | "accepted"
  | "raincheck"
  | "declined"
  | "expired"
  | "cancelled"
  | "unavailable";

export interface SenderStatusPlan {
  dateTypeLabel: string;
  startsAtLabel: string | null;
  placeName: string | null;
  placeAddress: string | null;
}

export interface SenderStatusRaincheck {
  message: string | null;
  selectedOptionLabel: string | null;
  suggestedDate: string | null;
  proposedPlace: string | null;
}

export interface SenderStatusViewModel {
  kind: SenderStatusKind;
  label: string;
  heading: string;
  summary: string;
  plan: SenderStatusPlan | null;
  raincheck: SenderStatusRaincheck | null;
  recipientMessage: string | null;
  noMessageText: string | null;
  isUnavailable: boolean;
}

const raincheckOptionLabels: Record<RaincheckOption, string> = {
  different_day: "Different day",
  different_place: "Different place",
  keep_it_casual: "Keep it casual"
};

export function getSenderStatusViewModel(
  invite: Invite
): SenderStatusViewModel {
  if (invite.status === "flagged") {
    return unavailableStatus();
  }

  const plan = getPlan(invite);

  switch (invite.status) {
    case "pending":
      return {
        kind: "pending",
        label: "Private status",
        heading: "Waiting for them to open the invitation.",
        summary: "Keep this private link. Updates appear here when you refresh.",
        plan,
        raincheck: null,
        recipientMessage: null,
        noMessageText: null,
        isUnavailable: false
      };
    case "opened":
      return {
        kind: "opened",
        label: "Private status",
        heading: "The invitation has been opened.",
        summary: "No exact open time is shown. Refresh this link to check for a response.",
        plan,
        raincheck: null,
        recipientMessage: null,
        noMessageText: null,
        isUnavailable: false
      };
    case "accepted":
      return {
        kind: "accepted",
        label: "Accepted",
        heading: "They said yes.",
        summary: "The accepted plan is below.",
        plan,
        raincheck: null,
        recipientMessage: null,
        noMessageText: null,
        isUnavailable: false
      };
    case "raincheck":
      return {
        kind: "raincheck",
        label: "Raincheck",
        heading: "They sent a raincheck.",
        summary: "Their counter-offer details are shown when they shared any.",
        plan,
        raincheck: getRaincheck(invite),
        recipientMessage: null,
        noMessageText: null,
        isUnavailable: false
      };
    case "declined":
      return {
        kind: "declined",
        label: "Declined",
        heading: "They said no.",
        summary: "No is a complete answer.",
        plan: null,
        raincheck: null,
        recipientMessage: invite.recipientMessage,
        noMessageText: invite.recipientMessage
          ? null
          : "No additional message was sent.",
        isUnavailable: false
      };
    case "expired":
      return {
        kind: "expired",
        label: "Expired",
        heading: "The invitation expired before a response.",
        summary: "You can create a new invitation if the plan is still on.",
        plan: null,
        raincheck: null,
        recipientMessage: null,
        noMessageText: null,
        isUnavailable: false
      };
    case "cancelled":
      return {
        kind: "cancelled",
        label: "Cancelled",
        heading: "This invitation was cancelled.",
        summary: "It is no longer available for responses.",
        plan: null,
        raincheck: null,
        recipientMessage: null,
        noMessageText: null,
        isUnavailable: false
      };
    case "draft":
    default:
      return unavailableStatus();
  }
}

function getPlan(invite: Invite): SenderStatusPlan {
  return {
    dateTypeLabel: formatToken(invite.dateType),
    startsAtLabel: formatInviteDateTime(invite.dateDetails.startsAt),
    placeName: cleanOptionalText(invite.placeDetails.name),
    placeAddress: cleanOptionalText(invite.placeDetails.address)
  };
}

function getRaincheck(invite: Invite): SenderStatusRaincheck {
  const option = invite.counterOffer?.selectedOption;

  return {
    message: cleanOptionalText(invite.counterOffer?.message),
    selectedOptionLabel: option ? raincheckOptionLabels[option] : null,
    suggestedDate: cleanOptionalText(invite.counterOffer?.proposedDateIso),
    proposedPlace: cleanOptionalText(invite.counterOffer?.proposedPlace)
  };
}

function unavailableStatus(): SenderStatusViewModel {
  return {
    kind: "unavailable",
    label: "Private status",
    heading: "This invitation is no longer available.",
    summary: "This private link cannot show invitation details.",
    plan: null,
    raincheck: null,
    recipientMessage: null,
    noMessageText: null,
    isUnavailable: true
  };
}

function cleanOptionalText(value: string | undefined | null): string | null {
  const cleaned = value?.trim();

  return cleaned ? cleaned : null;
}

function formatToken(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
