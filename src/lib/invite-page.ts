import type { Metadata } from "next";

import type {
  CounterOffer,
  Invite,
  InviteStore,
  RaincheckOption
} from "./invite-store";
import type { InviteStatus } from "./invite-store";
import { isInvitePersistenceConfigurationError } from "./storage/invite-store-config";

export const invitePageGenericPreview = "You have a surprise waiting.";

export function getInvitePageMetadata(): Metadata {
  return {
    title: "WINK",
    description: invitePageGenericPreview,
    robots: {
      index: false,
      follow: false
    },
    openGraph: {
      title: "WINK",
      description: invitePageGenericPreview,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: "WINK",
      description: invitePageGenericPreview
    }
  };
}

export function isPreviewModeParam(
  value: string | string[] | undefined
): boolean {
  return Array.isArray(value) ? value.includes("true") : value === "true";
}

export async function getInviteForRecipientPage({
  previewMode,
  slug,
  store
}: {
  previewMode: boolean;
  slug: string;
  store: InviteStore;
}): Promise<Invite | null> {
  const invite = await store.getInviteBySlug(slug, { previewMode });

  if (!invite) {
    return null;
  }

  if (previewMode) {
    return invite;
  }

  return store.markOpened(slug, { previewMode: false });
}

export type InvitePageLoadResult =
  | {
      invite: Invite;
      state: "loaded";
    }
  | {
      invite: null;
      state: "not_found";
    }
  | {
      invite: null;
      state: "temporarily_unavailable";
    };

export async function getInvitePageLoadResult({
  previewMode,
  slug,
  store
}: {
  previewMode: boolean;
  slug: string;
  store: InviteStore;
}): Promise<InvitePageLoadResult> {
  try {
    const invite = await getInviteForRecipientPage({
      previewMode,
      slug,
      store
    });

    if (!invite) {
      return {
        invite: null,
        state: "not_found"
      };
    }

    return {
      invite,
      state: "loaded"
    };
  } catch (error) {
    if (isInvitePersistenceConfigurationError(error)) {
      return {
        invite: null,
        state: "temporarily_unavailable"
      };
    }

    throw error;
  }
}

export type RecipientPageState =
  | "respondable"
  | "accepted"
  | "raincheck"
  | "declined"
  | "flagged"
  | "expired"
  | "cancelled"
  | "unavailable";

export function getRecipientPageState(status: InviteStatus): RecipientPageState {
  switch (status) {
    case "pending":
    case "opened":
      return "respondable";
    case "accepted":
      return "accepted";
    case "raincheck":
      return "raincheck";
    case "declined":
      return "declined";
    case "flagged":
      return "flagged";
    case "expired":
      return "expired";
    case "cancelled":
      return "cancelled";
    case "draft":
    default:
      return "unavailable";
  }
}

export function shouldShowCompatibilityReport(
  state: RecipientPageState
): boolean {
  return state === "respondable";
}

export function shouldShowLawyerMode({
  mode,
  state
}: {
  mode: Invite["mode"];
  state: RecipientPageState;
}): boolean {
  return mode === "lawyer" && state === "respondable";
}

export function shouldShowUnbotheredMode({
  mode,
  state
}: {
  mode: Invite["mode"];
  state: RecipientPageState;
}): boolean {
  return mode === "unbothered" && state === "respondable";
}

export function shouldShowKindReplyAssistant(
  state: RecipientPageState
): boolean {
  return state === "declined";
}

export function shouldShowRaincheckPanel(state: RecipientPageState): boolean {
  return state === "respondable";
}

export function shouldShowInviteDetails(state: RecipientPageState): boolean {
  return (
    state === "respondable" ||
    state === "accepted" ||
    state === "raincheck" ||
    state === "declined"
  );
}

export const raincheckQuickOptions: Array<{
  label: string;
  value: RaincheckOption;
}> = [
  { label: "Different day", value: "different_day" },
  { label: "Different place", value: "different_place" },
  { label: "Keep it casual", value: "keep_it_casual" }
];

export const raincheckNoteMaxLength = 160;

export function isRaincheckOption(
  value: FormDataEntryValue | null
): value is RaincheckOption {
  return (
    value === "different_day" ||
    value === "different_place" ||
    value === "keep_it_casual"
  );
}

export function getRaincheckOptionLabel(
  option: RaincheckOption | undefined
): string | null {
  return (
    raincheckQuickOptions.find((quickOption) => quickOption.value === option)
      ?.label ?? null
  );
}

export function normalizeRaincheckNote(
  value: FormDataEntryValue | null
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed.slice(0, raincheckNoteMaxLength) : null;
}

export function normalizeSuggestedDate(
  value: FormDataEntryValue | null
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

export function buildRaincheckCounterOffer({
  note,
  selectedOption,
  suggestedDate
}: {
  note: string | null;
  selectedOption: RaincheckOption | null;
  suggestedDate: string | null;
}): CounterOffer | null {
  if (!note && !selectedOption && !suggestedDate) {
    return null;
  }

  return {
    ...(note ? { message: note } : {}),
    ...(selectedOption ? { selectedOption } : {}),
    ...(suggestedDate ? { proposedDateIso: suggestedDate } : {})
  };
}

export function getRaincheckStateDetails(invite: Invite): {
  note: string | null;
  selectedOptionLabel: string | null;
  suggestedDate: string | null;
} {
  return {
    note: invite.counterOffer?.message ?? null,
    selectedOptionLabel: getRaincheckOptionLabel(
      invite.counterOffer?.selectedOption
    ),
    suggestedDate: invite.counterOffer?.proposedDateIso ?? null
  };
}

export const kindReplyOptions = [
  "That's really sweet, but I don't see it that way.",
  "I appreciate it, but I'm not available for dating right now.",
  "I'd rather keep things friendly, but this was genuinely cute."
] as const;

export function getKindReplyIntro(invite: Invite): string {
  const sender = invite.senderName || "them";
  const dateType = formatInviteToken(invite.dateType).toLowerCase();

  return `If you want to reply to ${sender} about the ${dateType}, keep it simple and kind.`;
}

export function isMissingRequiredLawyerSignature({
  requiresSignature,
  response,
  signatureApproval
}: {
  requiresSignature: boolean;
  response: string | null;
  signatureApproval: string | null;
}): boolean {
  return (
    requiresSignature &&
    response === "yes" &&
    signatureApproval?.trim() !== "approved"
  );
}

export const unbotheredSlotSequence = ["No", "Maybe", "Maybe", "YES"] as const;

export const unbotheredSlotFinalResult =
  unbotheredSlotSequence[unbotheredSlotSequence.length - 1];

export const unbotheredSlotTimings = [0, 200, 450, 650] as const;

export const unbotheredSlotConfirmationLabel =
  "Fine, I accept the rigged verdict";

export function shouldSubmitUnbotheredSlotYes({
  confirmationClicked,
  previewMode,
  slotState
}: {
  confirmationClicked: boolean;
  previewMode: boolean;
  slotState: "idle" | "spinning" | "landed";
}): boolean {
  return slotState === "landed" && confirmationClicked && !previewMode;
}

export const unbotheredNoTapHints = [
  "...okay that's fine. I'm fine.",
  "Cool cool cool."
] as const;

export function getUnbotheredHeader(invite: Invite): string {
  return `${invite.senderName || "Someone"} is asking... sort of.`;
}

export function getUnbotheredMainCopy(invite: Invite): {
  line1: string;
  line2: string;
} {
  return {
    line1: `Yeah so... ${invite.recipientName}. ${formatInviteToken(
      invite.dateType
    )} or whatever. If you want. No pressure.`,
    line2: "I probably have other plans anyway, but like... it could be cool."
  };
}

export function getUnbotheredNoTapHint(
  noTapCount: number
): string | null {
  if (noTapCount === 1) {
    return unbotheredNoTapHints[0];
  }

  if (noTapCount >= 2) {
    return unbotheredNoTapHints[1];
  }

  return null;
}

export function getUnbotheredNoTapOutcome(noTapCount: number): {
  hint: string | null;
  nextNoTapCount: 0 | 1 | 2;
  shouldDecline: boolean;
  shiftRightPx: number;
} {
  if (noTapCount <= 0) {
    return {
      hint: unbotheredNoTapHints[0],
      nextNoTapCount: 1,
      shouldDecline: false,
      shiftRightPx: 4
    };
  }

  if (noTapCount === 1) {
    return {
      hint: unbotheredNoTapHints[1],
      nextNoTapCount: 2,
      shouldDecline: false,
      shiftRightPx: 4
    };
  }

  return {
    hint: null,
    nextNoTapCount: 2,
    shouldDecline: true,
    shiftRightPx: 4
  };
}

function formatInviteToken(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
