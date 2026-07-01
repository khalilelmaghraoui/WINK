"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  inviteStore,
  isInviteStoreConfigurationError
} from "@/lib/invite-store";

export interface SenderCancelActionState {
  status:
    | "idle"
    | "success"
    | "unavailable"
    | "storage_unavailable";
}

export async function cancelSenderInviteAction(
  token: string,
  _previousState: SenderCancelActionState,
  _formData: FormData
): Promise<SenderCancelActionState> {
  return cancelSenderInvite(token);
}

export async function cancelSenderInviteFormAction(
  token: string,
  _formData: FormData
): Promise<never> {
  const result = await cancelSenderInvite(token);
  const cancelStatus =
    result.status === "success" ? "success" : "unavailable";

  redirect(`/s/${token}?cancel=${cancelStatus}`);
}

async function cancelSenderInvite(
  token: string
): Promise<SenderCancelActionState> {
  try {
    const invite = await inviteStore.cancelInviteBySenderToken(token);

    if (!invite || invite.status !== "cancelled") {
      return {
        status: "unavailable"
      };
    }

    revalidatePath(`/i/${invite.slug}`);
    revalidatePath(`/s/${token}`);

    return {
      status: "success"
    };
  } catch (error) {
    if (isInviteStoreConfigurationError(error)) {
      return {
        status: "storage_unavailable"
      };
    }

    throw error;
  }
}
