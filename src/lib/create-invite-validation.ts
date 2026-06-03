import type { DateType, InviteMode, InviteTone } from "./invite-store";

export type CreateInviteField =
  | "senderName"
  | "recipientName"
  | "message"
  | "tone"
  | "mode"
  | "dateType"
  | "date"
  | "time"
  | "placeName"
  | "placeAddress";

export type CreateInviteFormValues = Record<CreateInviteField, string>;

const allowedModes = new Set<InviteMode>(["lawyer", "unbothered"]);
const allowedTones = new Set<InviteTone>([
  "cute",
  "funny",
  "romantic",
  "bold"
]);
const allowedDateTypes = new Set<DateType>([
  "date",
  "apology",
  "surprise",
  "romantic_moment"
]);

export function validateCreateInviteFormValues(
  values: CreateInviteFormValues
): Partial<Record<CreateInviteField, string>> {
  const errors: Partial<Record<CreateInviteField, string>> = {};

  if (!values.senderName) {
    errors.senderName = "Enter your name.";
  }

  if (!values.recipientName) {
    errors.recipientName = "Enter the recipient name.";
  }

  if (!values.message) {
    errors.message = "Write the invitation message.";
  }

  if (!values.tone) {
    errors.tone = "Choose a tone.";
  } else if (!allowedTones.has(values.tone as InviteTone)) {
    errors.tone = "Choose a supported tone.";
  }

  if (!values.mode) {
    errors.mode = "Choose an invitation mode.";
  } else if (!allowedModes.has(values.mode as InviteMode)) {
    errors.mode = "Choose a supported mode.";
  }

  if (!values.dateType) {
    errors.dateType = "Choose a date type.";
  } else if (!allowedDateTypes.has(values.dateType as DateType)) {
    errors.dateType = "Choose a supported date type.";
  }

  if (!values.date) {
    errors.date = "Choose a date.";
  }

  if (!values.time) {
    errors.time = "Choose a time.";
  }

  if (!values.placeName) {
    errors.placeName = "Enter a place name.";
  }

  if (!values.placeAddress) {
    errors.placeAddress = "Enter a place address.";
  }

  return errors;
}
