"use server";

import { inviteStore } from "@/lib/invite-store";
import {
  validateCreateInviteFormValues,
  type CreateInviteField,
  type CreateInviteFormValues
} from "@/lib/create-invite-validation";
import type {
  CreatedInviteAccess,
  CreateInviteInput,
  DateType,
  InviteMode,
  InviteTone
} from "@/lib/invite-store";
import { isInvitePersistenceConfigurationError } from "@/lib/storage/invite-store-config";

export interface CreateInviteActionState {
  invitePath?: string;
  recipientPath?: string;
  senderPath?: string;
  errors: Partial<Record<CreateInviteField, string>>;
  serviceError?: string;
}

const createInviteServiceUnavailableMessage =
  "Invitation service is temporarily unavailable. Please try again later.";

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

  let createdInvite: CreatedInviteAccess;

  try {
    createdInvite = await inviteStore.createInvite(input);
  } catch (error) {
    if (isInvitePersistenceConfigurationError(error)) {
      return {
        errors: {},
        serviceError: createInviteServiceUnavailableMessage
      };
    }

    throw error;
  }

  return {
    invitePath: `/i/${createdInvite.invite.slug}`,
    recipientPath: `/i/${createdInvite.invite.slug}`,
    senderPath: `/s/${createdInvite.senderAccessToken}`,
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
