"use server";

import { inviteStore } from "@/lib/invite-store";
import {
  validateCreateInviteFormValues,
  type CreateInviteField,
  type CreateInviteFormValues
} from "@/lib/create-invite-validation";
import type {
  CreateInviteInput,
  DateType,
  InviteMode,
  InviteTone
} from "@/lib/invite-store";

export interface CreateInviteActionState {
  invitePath?: string;
  errors: Partial<Record<CreateInviteField, string>>;
}

export async function createInviteAction(
  _previousState: CreateInviteActionState,
  formData: FormData
): Promise<CreateInviteActionState> {
  const values = readFormValues(formData);
  const errors = validateCreateInviteFormValues(values);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const input: CreateInviteInput = {
    senderName: values.senderName,
    recipientName: values.recipientName,
    message: values.message,
    tone: values.tone as InviteTone,
    mode: values.mode as InviteMode,
    dateType: values.dateType as DateType,
    dateDetails: {
      startsAt: `${values.date}T${values.time}`,
      notes: values.dateType
    },
    placeDetails: {
      name: values.placeName,
      address: values.placeAddress
    }
  };

  const invite = await inviteStore.createInvite(input);

  return {
    invitePath: `/i/${invite.slug}`,
    errors: {}
  };
}

function readFormValues(formData: FormData): CreateInviteFormValues {
  return {
    senderName: readField(formData, "senderName"),
    recipientName: readField(formData, "recipientName"),
    message: readField(formData, "message"),
    tone: readField(formData, "tone"),
    mode: readField(formData, "mode"),
    dateType: readField(formData, "dateType"),
    date: readField(formData, "date"),
    time: readField(formData, "time"),
    placeName: readField(formData, "placeName"),
    placeAddress: readField(formData, "placeAddress")
  };
}

function readField(formData: FormData, field: CreateInviteField): string {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}
