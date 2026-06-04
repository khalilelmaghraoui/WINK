import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getInviteForRecipientPage,
  getInvitePageMetadata,
  getKindReplyIntro,
  getRaincheckOptionLabel,
  getRaincheckStateDetails,
  getRecipientPageState,
  getUnbotheredHeader,
  getUnbotheredMainCopy,
  getUnbotheredNoTapHint,
  getUnbotheredNoTapOutcome,
  invitePageGenericPreview,
  isRaincheckOption,
  isMissingRequiredLawyerSignature,
  isPreviewModeParam,
  kindReplyOptions,
  normalizeRaincheckNote,
  normalizeSuggestedDate,
  raincheckNoteMaxLength,
  raincheckQuickOptions,
  buildRaincheckCounterOffer,
  shouldShowCompatibilityReport,
  shouldShowKindReplyAssistant,
  shouldShowLawyerMode,
  shouldShowRaincheckPanel,
  shouldShowUnbotheredMode,
  shouldSubmitUnbotheredSlotYes,
  unbotheredNoTapHints,
  unbotheredSlotConfirmationLabel,
  unbotheredSlotFinalResult,
  unbotheredSlotSequence,
  unbotheredSlotTimings
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

test("raincheck panel appears only for respondable states", () => {
  assert.equal(shouldShowRaincheckPanel("respondable"), true);
  assert.equal(shouldShowRaincheckPanel("accepted"), false);
  assert.equal(shouldShowRaincheckPanel("raincheck"), false);
  assert.equal(shouldShowRaincheckPanel("declined"), false);
  assert.equal(shouldShowRaincheckPanel("flagged"), false);
  assert.equal(shouldShowRaincheckPanel("expired"), false);
  assert.equal(shouldShowRaincheckPanel("cancelled"), false);
  assert.equal(shouldShowRaincheckPanel("unavailable"), false);
});

test("raincheck quick options and note cap are fixed", () => {
  assert.deepEqual(raincheckQuickOptions, [
    { label: "Different day", value: "different_day" },
    { label: "Different place", value: "different_place" },
    { label: "Keep it casual", value: "keep_it_casual" }
  ]);
  assert.equal(raincheckNoteMaxLength, 160);
  assert.equal(isRaincheckOption("different_day"), true);
  assert.equal(isRaincheckOption("different_place"), true);
  assert.equal(isRaincheckOption("keep_it_casual"), true);
  assert.equal(isRaincheckOption("something_else"), false);
});

test("raincheck note and suggested date values are normalized", () => {
  const longNote = "x".repeat(200);

  assert.equal(normalizeRaincheckNote("  Maybe next week?  "), "Maybe next week?");
  assert.equal(normalizeRaincheckNote(longNote), "x".repeat(160));
  assert.equal(normalizeRaincheckNote("   "), null);
  assert.equal(normalizeSuggestedDate(" 2026-06-20 "), "2026-06-20");
  assert.equal(normalizeSuggestedDate(" "), null);
});

test("raincheck counter offer stores option note and suggested date", () => {
  assert.deepEqual(
    buildRaincheckCounterOffer({
      note: "Maybe next week?",
      selectedOption: "different_day",
      suggestedDate: "2026-06-20"
    }),
    {
      message: "Maybe next week?",
      selectedOption: "different_day",
      proposedDateIso: "2026-06-20"
    }
  );
  assert.equal(
    buildRaincheckCounterOffer({
      note: null,
      selectedOption: null,
      suggestedDate: null
    }),
    null
  );
});

test("raincheck state details render selected option note and date", async () => {
  const store = new CountingInviteStore();
  const invite = await store.createInvite(inviteInput);
  const updatedInvite = await store.respond(invite.slug, {
    response: "raincheck",
    counterOffer: {
      message: "Maybe next week?",
      selectedOption: "different_day",
      proposedDateIso: "2026-06-20"
    }
  });

  assert.equal(getRaincheckOptionLabel("different_day"), "Different day");
  assert.deepEqual(getRaincheckStateDetails(updatedInvite!), {
    note: "Maybe next week?",
    selectedOptionLabel: "Different day",
    suggestedDate: "2026-06-20"
  });
});

test("kind reply assistant appears only for declined state", () => {
  assert.equal(shouldShowKindReplyAssistant("declined"), true);
  assert.equal(shouldShowKindReplyAssistant("respondable"), false);
  assert.equal(shouldShowKindReplyAssistant("accepted"), false);
  assert.equal(shouldShowKindReplyAssistant("raincheck"), false);
  assert.equal(shouldShowKindReplyAssistant("flagged"), false);
  assert.equal(shouldShowKindReplyAssistant("expired"), false);
  assert.equal(shouldShowKindReplyAssistant("cancelled"), false);
  assert.equal(shouldShowKindReplyAssistant("unavailable"), false);
});

test("kind reply assistant has exactly three static reply options", () => {
  assert.deepEqual(Array.from(kindReplyOptions), [
    "That's really sweet, but I don't see it that way.",
    "I appreciate it, but I'm not available for dating right now.",
    "I'd rather keep things friendly, but this was genuinely cute."
  ]);
});

test("kind reply intro can use safe invite context", async () => {
  const store = new CountingInviteStore();
  const invite = await store.createInvite({
    ...inviteInput,
    senderName: "Riley",
    dateType: "romantic_moment"
  });

  assert.equal(
    getKindReplyIntro(invite),
    "If you want to reply to Riley about the romantic moment, keep it simple and kind."
  );
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
  assert.deepEqual(Array.from(unbotheredSlotTimings), [0, 200, 450, 650]);
  assert.equal(unbotheredSlotFinalResult, "YES");
});

test("unbothered slot landing does not submit yes without confirmation", () => {
  assert.equal(
    shouldSubmitUnbotheredSlotYes({
      confirmationClicked: false,
      previewMode: false,
      slotState: "landed"
    }),
    false
  );
  assert.equal(
    shouldSubmitUnbotheredSlotYes({
      confirmationClicked: true,
      previewMode: false,
      slotState: "spinning"
    }),
    false
  );
});

test("unbothered slot final confirmation is the only yes consent path", () => {
  assert.equal(
    shouldSubmitUnbotheredSlotYes({
      confirmationClicked: true,
      previewMode: false,
      slotState: "landed"
    }),
    true
  );
  assert.equal(
    shouldSubmitUnbotheredSlotYes({
      confirmationClicked: true,
      previewMode: true,
      slotState: "landed"
    }),
    false
  );
  assert.equal(
    unbotheredSlotConfirmationLabel,
    "Fine, I accept the rigged verdict"
  );
});

test("unbothered copy uses invite sender recipient and date type", async () => {
  const store = new CountingInviteStore();
  const invite = await store.createInvite({
    ...inviteInput,
    senderName: "Riley",
    recipientName: "Avery",
    dateType: "romantic_moment",
    mode: "unbothered"
  });

  assert.equal(getUnbotheredHeader(invite), "Riley is asking... sort of.");
  assert.deepEqual(getUnbotheredMainCopy(invite), {
    line1:
      "Yeah so... Avery. Romantic Moment or whatever. If you want. No pressure.",
    line2:
      "I probably have other plans anyway, but like... it could be cool."
  });
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

test("unbothered no tap hint is derived from capped count", () => {
  assert.equal(getUnbotheredNoTapHint(0), null);
  assert.equal(getUnbotheredNoTapHint(1), unbotheredNoTapHints[0]);
  assert.equal(getUnbotheredNoTapHint(2), unbotheredNoTapHints[1]);
  assert.equal(getUnbotheredNoTapHint(3), unbotheredNoTapHints[1]);
});
