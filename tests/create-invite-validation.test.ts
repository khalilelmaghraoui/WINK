import assert from "node:assert/strict";
import { test } from "node:test";

import {
  validateCreateInviteFormValues,
  type CreateInviteFormValues
} from "../src/lib/create-invite-validation";

const validValues: CreateInviteFormValues = {
  senderName: "Sender",
  recipientName: "Recipient",
  message: "A small invitation.",
  tone: "cute",
  mode: "lawyer",
  dateType: "date",
  date: "2026-06-10",
  time: "19:30",
  placeName: "Somewhere nice",
  placeAddress: "1 Main Street"
};

test("create invite validation accepts MVP tones", () => {
  for (const tone of ["cute", "funny", "romantic", "bold"]) {
    const errors = validateCreateInviteFormValues({
      ...validValues,
      tone
    });

    assert.equal(errors.tone, undefined);
  }
});

test("create invite validation rejects unsupported tones", () => {
  const errors = validateCreateInviteFormValues({
    ...validValues,
    tone: "playful"
  });

  assert.equal(errors.tone, "Choose a supported tone.");
});
