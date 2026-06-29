import assert from "node:assert/strict";
import { test } from "node:test";

import {
  compatibilityScore,
  getModePresentation
} from "../src/lib/mode-engine";
import type { CreateInviteInput } from "../src/lib/invite-store";
import { InMemoryInviteStore } from "../src/lib/invite-store";

const baseInput: CreateInviteInput = {
  senderName: "Sender",
  recipientName: "Recipient",
  message: "A small invitation.",
  mode: "lawyer",
  tone: "cute",
  dateType: "date",
  dateDetails: {
    startsAt: "2026-06-10T19:30"
  },
  placeDetails: {
    name: "Somewhere nice",
    address: "1 Main Street"
  }
};

test("ModeEngine returns a config for lawyer mode", async () => {
  const store = new InMemoryInviteStore();
  const { invite: invite } = await store.createInvite({
    ...baseInput,
    mode: "lawyer"
  });
  const presentation = getModePresentation(invite);

  assert.equal(presentation.mode, "lawyer");
  assert.equal(presentation.modeLabel, "Lawyer");
  assert.equal(presentation.compatibilityReport.score, compatibilityScore);
});

test("ModeEngine returns a config for unbothered mode", async () => {
  const store = new InMemoryInviteStore();
  const { invite: invite } = await store.createInvite({
    ...baseInput,
    mode: "unbothered"
  });
  const presentation = getModePresentation(invite);

  assert.equal(presentation.mode, "unbothered");
  assert.equal(presentation.modeLabel, "Unbothered");
  assert.equal(presentation.compatibilityReport.score, compatibilityScore);
});

test("compatibility score is fixed and not derived from names", async () => {
  const store = new InMemoryInviteStore();
  const { invite: firstInvite } = await store.createInvite({
    ...baseInput,
    senderName: "Ada",
    recipientName: "Grace"
  });
  const { invite: secondInvite } = await store.createInvite({
    ...baseInput,
    senderName: "Different Sender",
    recipientName: "Different Recipient"
  });

  assert.equal(compatibilityScore, "94.7%");
  assert.equal(
    getModePresentation(firstInvite).compatibilityReport.score,
    "94.7%"
  );
  assert.equal(
    getModePresentation(secondInvite).compatibilityReport.score,
    "94.7%"
  );
});
