import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getInviteForRecipientPage,
  getInvitePageMetadata,
  getRecipientPageState,
  getUnbotheredNoTapOutcome,
  invitePageGenericPreview,
  isMissingRequiredLawyerSignature,
  isPreviewModeParam,
  shouldShowCompatibilityReport,
  shouldShowLawyerMode,
  shouldShowUnbotheredMode,
  unbotheredNoTapHints,
  unbotheredSlotFinalResult,
  unbotheredSlotSequence
} from "../src/lib/invite-page";
import { InMemoryInviteStore } from "../src/lib/invite-store";
import type { InviteWriteOptions } from "../src/lib/invite-store";

class CountingInviteStore extends InMemoryInviteStore {
  markOpenedCalls = 0;

  async markOpened(slug: string, opts: InviteWriteOptions = {}) {
    this.markOpenedCalls += 1;

    return super.markOpened(slug, opts);
  }
}

const inviteInput = {
  senderName: "Sender",
  recipientName: "Recipient",
  message: "Join me for dinner?",
  mode: "lawyer" as const,
  tone: "funny" as const,
  dateType: "date" as const,
  dateDetails: {
    startsAt: "2026-06-10T19:30"
  },
  placeDetails: {
    name: "Somewhere nice",
    address: "1 Main Street"
  }
};

test("recipient page loader returns null for missing slug", async () => {
  const store = new CountingInviteStore();
  const invite = await getInviteForRecipientPage({
    previewMode: false,
    slug: "missing",
    store
  });

  assert.equal(invite, null);
  assert.equal(store.markOpenedCalls, 0);
});

test("recipient page loader marks opened only for non-preview loads", async () => {
  const store = new CountingInviteStore();
  const invite = await store.createInvite(inviteInput);

  const previewInvite = await getInviteForRecipientPage({
    previewMode: true,
    slug: invite.slug,
    store
  });
  const persistedAfterPreview = await store.getInviteBySlug(invite.slug);

  assert.equal(previewInvite?.openedAt, null);
  assert.equal(persistedAfterPreview?.openedAt, null);
  assert.equal(store.markOpenedCalls, 0);

  const openedInvite = await getInviteForRecipientPage({
    previewMode: false,
    slug: invite.slug,
    store
  });

  assert.notEqual(openedInvite?.openedAt, null);
  assert.equal(store.markOpenedCalls, 1);
});

test("isPreviewModeParam only treats explicit true as preview mode", () => {
  assert.equal(isPreviewModeParam("true"), true);
  assert.equal(isPreviewModeParam(["false", "true"]), true);
  assert.equal(isPreviewModeParam("false"), false);
  assert.equal(isPreviewModeParam(undefined), false);
});

test("invite page metadata is generic and noindex", () => {
  const metadata = getInvitePageMetadata();

  assert.equal(metadata.description, invitePageGenericPreview);
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false
  });
  assert.deepEqual(metadata.openGraph, {
    title: "WINK",
    description: invitePageGenericPreview,
    type: "website"
  });
});

test("same slug resolves to accepted state after yes response", async () => {
  const store = new CountingInviteStore();
  const invite = await store.createInvite(inviteInput);

  await store.respond(invite.slug, { response: "yes" });

  const updatedInvite = await getInviteForRecipientPage({
    previewMode: false,
    slug: invite.slug,
    store
  });

  assert.equal(updatedInvite?.status, "accepted");
  assert.equal(updatedInvite?.response, "yes");
  assert.equal(getRecipientPageState(updatedInvite?.status ?? "draft"), "accepted");
});

test("recipient page state maps statuses to living URL states", () => {
  assert.equal(getRecipientPageState("pending"), "respondable");
  assert.equal(getRecipientPageState("opened"), "respondable");
  assert.equal(getRecipientPageState("accepted"), "accepted");
  assert.equal(getRecipientPageState("raincheck"), "raincheck");
  assert.equal(getRecipientPageState("declined"), "declined");
  assert.equal(getRecipientPageState("flagged"), "flagged");
  assert.equal(getRecipientPageState("expired"), "expired");
  assert.equal(getRecipientPageState("cancelled"), "cancelled");
  assert.equal(getRecipientPageState("draft"), "unavailable");
});

test("compatibility report appears only for respondable states", () => {
  assert.equal(shouldShowCompatibilityReport("respondable"), true);
  assert.equal(shouldShowCompatibilityReport("accepted"), false);
  assert.equal(shouldShowCompatibilityReport("raincheck"), false);
  assert.equal(shouldShowCompatibilityReport("declined"), false);
  assert.equal(shouldShowCompatibilityReport("flagged"), false);
  assert.equal(shouldShowCompatibilityReport("expired"), false);
  assert.equal(shouldShowCompatibilityReport("cancelled"), false);
  assert.equal(shouldShowCompatibilityReport("unavailable"), false);
});

test("lawyer mode renders only for lawyer respondable invites", () => {
  assert.equal(
    shouldShowLawyerMode({ mode: "lawyer", state: "respondable" }),
    true
  );
  assert.equal(
    shouldShowLawyerMode({ mode: "unbothered", state: "respondable" }),
    false
  );
  assert.equal(
    shouldShowLawyerMode({ mode: "lawyer", state: "accepted" }),
    false
  );
});

test("unbothered mode renders only for unbothered respondable invites", () => {
  assert.equal(
    shouldShowUnbotheredMode({ mode: "unbothered", state: "respondable" }),
    true
  );
  assert.equal(
    shouldShowUnbotheredMode({ mode: "lawyer", state: "respondable" }),
    false
  );
  assert.equal(
    shouldShowUnbotheredMode({ mode: "unbothered", state: "accepted" }),
    false
  );
  assert.equal(
    shouldShowUnbotheredMode({ mode: "unbothered", state: "raincheck" }),
    false
  );
  assert.equal(
    shouldShowUnbotheredMode({ mode: "unbothered", state: "declined" }),
    false
  );
});

test("lawyer signature validation applies only to yes", () => {
  assert.equal(
    isMissingRequiredLawyerSignature({
      requiresSignature: true,
      response: "yes",
      signatureApproval: ""
    }),
    true
  );
  assert.equal(
    isMissingRequiredLawyerSignature({
      requiresSignature: true,
      response: "yes",
      signatureApproval: "approved"
    }),
    false
  );
  assert.equal(
    isMissingRequiredLawyerSignature({
      requiresSignature: true,
      response: "raincheck",
      signatureApproval: ""
    }),
    false
  );
  assert.equal(
    isMissingRequiredLawyerSignature({
      requiresSignature: true,
      response: "no",
      signatureApproval: ""
    }),
    false
  );
});

test("unbothered slot sequence is deterministic and lands on YES", () => {
  assert.deepEqual(Array.from(unbotheredSlotSequence), [
    "No",
    "Maybe",
    "Maybe",
    "YES"
  ]);
  assert.equal(unbotheredSlotFinalResult, "YES");
});

test("unbothered no tap outcome delays decline until the third tap", () => {
  assert.deepEqual(getUnbotheredNoTapOutcome(0), {
    hint: unbotheredNoTapHints[0],
    nextNoTapCount: 1,
    shouldDecline: false,
    shiftRightPx: 4
  });
  assert.deepEqual(getUnbotheredNoTapOutcome(1), {
    hint: unbotheredNoTapHints[1],
    nextNoTapCount: 2,
    shouldDecline: false,
    shiftRightPx: 4
  });
  assert.deepEqual(getUnbotheredNoTapOutcome(2), {
    hint: null,
    nextNoTapCount: 2,
    shouldDecline: true,
    shiftRightPx: 4
  });
  assert.deepEqual(getUnbotheredNoTapOutcome(3), {
    hint: null,
    nextNoTapCount: 2,
    shouldDecline: true,
    shiftRightPx: 4
  });
});
