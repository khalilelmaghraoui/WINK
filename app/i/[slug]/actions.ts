"use server";

import { revalidatePath } from "next/cache";

import { inviteStore } from "@/lib/invite-store";
import type { InviteResponse } from "@/lib/invite-store";

export async function respondToInviteAction(formData: FormData) {
  const slug = formData.get("slug");
  const response = formData.get("response");
  const previewMode = formData.get("previewMode") === "true";
  const counterOfferMessage = formData.get("counterOfferMessage");

  if (
    typeof slug !== "string" ||
    !slug ||
    !isInviteResponse(response)
  ) {
    return;
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

function isInviteResponse(value: FormDataEntryValue | null): value is InviteResponse {
  return value === "yes" || value === "raincheck" || value === "no";
}
