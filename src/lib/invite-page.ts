import type { Metadata } from "next";

import type { Invite, InviteStore } from "./invite-store";
import type { InviteStatus } from "./invite-store";

export const invitePageGenericPreview = "You have a surprise waiting.";

export function getInvitePageMetadata(): Metadata {
  return {
    title: "Frisson",
    description: invitePageGenericPreview,
    robots: {
      index: false,
      follow: false
    },
    openGraph: {
      title: "Frisson",
      description: invitePageGenericPreview,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: "Frisson",
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
