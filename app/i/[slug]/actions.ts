"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { inviteStore } from "@/lib/invite-store";
import type { InviteResponse } from "@/lib/invite-store";
import { isMissingRequiredLawyerSignature } from "@/lib/invite-page";

export async function respondToInviteAction(formData: FormData) {
  const slug = formData.get("slug");
  const response = formData.get("response");
  const previewMode = formData.get("previewMode") === "true";
  const counterOfferMessage = formData.get("counterOfferMessage");
  const requiresSignature = formData.get("requiresSignature") === "true";
  const signatureApproval = formData.get("signatureApproval");

  if (
    typeof slug !== "string" ||
    !slug ||
    !isInviteResponse(response)
  ) {
    return;
  }

  if (
    isMissingRequiredLawyerSignature({
      requiresSignature,
      response,
      signatureApproval:
        typeof signatureApproval === "string" ? signatureApproval : null
    })
  ) {
    redirect(`/i/${slug}?signatureError=true`);
  }

  await inviteStore.respond(slug, {
    response,
    previewMode,
    counterOffer:
      response === "raincheck" &&
      typeof counterOfferMessage === "string" &&
      counterOfferMessage.trim()
        ? { message: counterOfferMessage.trim() }
        : null
  });

  revalidatePath(`/i/${slug}`);
}

export async function flagUnknownSenderAction(formData: FormData) {
  const slug = formData.get("slug");
  const previewMode = formData.get("previewMode") === "true";

  if (typeof slug !== "string" || !slug) {
    return;
  }

  await inviteStore.flagUnknownSender(slug, { previewMode });
  revalidatePath(`/i/${slug}`);
}

export async function recordNoTapAction(formData: FormData) {
  const slug = formData.get("slug");
  const previewMode = formData.get("previewMode") === "true";

  if (typeof slug !== "string" || !slug) {
    return null;
  }

  const invite = await inviteStore.recordNoTap(slug, { previewMode });
  revalidatePath(`/i/${slug}`);

  return invite?.noTapCount ?? null;
}

function isInviteResponse(value: FormDataEntryValue | null): value is InviteResponse {
  return value === "yes" || value === "raincheck" || value === "no";
}
