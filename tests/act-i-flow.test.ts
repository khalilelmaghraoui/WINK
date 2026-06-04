import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getInviteForRecipientPage,
  getInvitePageMetadata,
  getRaincheckStateDetails,
  getRecipientPageState,
  invitePageGenericPreview,
  shouldShowCompatibilityReport,
  shouldShowInviteDetails,
  shouldShowKindReplyAssistant,
  shouldShowLawyerMode,
  shouldShowRaincheckPanel,
  shouldShowUnbotheredMode
} from "../src/lib/invite-page";
import { InMemoryInviteStore } from "../src/lib/invite-store";
import type {
  CreateInviteInput,
  InviteMode,
  InviteStatus
} from "../src/lib/invite-store";

const baseInput: CreateInviteInput = {
  senderName: "Private Sender",
  recipientName: "Private Recipient",
  message: "Private dinner message",
  mode: "lawyer",
  tone: "romantic",
  dateType: "date",
  dateDetails: {
    startsAt: "2026-06-10T19:30"
  },
  placeDetails: {
    name: "Private Place",
    address: "123 Secret Street"
  }
};

test("Act I flow creates an invite and opens it exactly once", async () => {
  const times = [
    "2026-06-04T10:00:00.000Z",
    "2026-06-04T10:01:00.000Z",
    "2026-06-04T10:02:00.000Z"
  ];
  const store = new InMemoryInviteStore({
    now: () => times.shift() ?? "2026-06-04T10:03:00.000Z"
  });
  const invite = await store.createInvite(baseInput);

  const firstOpen = await getInviteForRecipientPage({
    previewMode: false,
    slug: invite.slug,
    store
  });
  const secondOpen = await getInviteForRecipientPage({
    previewMode: false,
    slug: invite.slug,
    store
  });

  assert.equal(firstOpen?.status, "opened");
  assert.equal(firstOpen?.openedAt, "2026-06-04T10:01:00.000Z");
  assert.equal(secondOpen?.openedAt, "2026-06-04T10:01:00.000Z");
});

test("preview mode blocks every Act I write path", async () => {
  const store = new InMemoryInviteStore();
  const invite = await store.createInvite({
    ...baseInput,
    expiresAt: "2026-06-01T10:00:00.000Z"
  });

  await store.markOpened(invite.slug, { previewMode: true });
  await store.recordNoTap(invite.slug, { previewMode: true });
  await store.respond(invite.slug, {
    previewMode: true,
    response: "yes"
  });
  await store.flagUnknownSender(invite.slug, { previewMode: true });
  await store.cancelInvite(invite.slug, { previewMode: true });
  await store.expireInvites("2026-06-04T10:00:00.000Z", {
    previewMode: true
  });

  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(persistedInvite?.status, "pending");
  assert.equal(persistedInvite?.response, null);
  assert.equal(persistedInvite?.openedAt, null);
  assert.equal(persistedInvite?.noTapCount, 0);
  assert.equal(persistedInvite?.unknownSenderFlaggedAt, null);
  assert.equal(persistedInvite?.canceledAt, null);
  assert.equal(persistedInvite?.expiredAt, null);
});

test("Act I responses and safety actions resolve to expected living URL states", async () => {
  const cases: Array<{
    action: (store: InMemoryInviteStore, slug: string) => Promise<unknown>;
    expectedStatus: InviteStatus;
    expectedState: ReturnType<typeof getRecipientPageState>;
  }> = [
    {
      action: (store, slug) => store.respond(slug, { response: "yes" }),
      expectedStatus: "accepted",
      expectedState: "accepted"
    },
    {
      action: (store, slug) => store.respond(slug, { response: "raincheck" }),
      expectedStatus: "raincheck",
      expectedState: "raincheck"
    },
    {
      action: (store, slug) => store.respond(slug, { response: "no" }),
      expectedStatus: "declined",
      expectedState: "declined"
    },
    {
      action: (store, slug) => store.flagUnknownSender(slug),
      expectedStatus: "flagged",
      expectedState: "flagged"
    },
    {
      action: (store, slug) => store.cancelInvite(slug),
      expectedStatus: "cancelled",
      expectedState: "cancelled"
    }
  ];

  for (const { action, expectedState, expectedStatus } of cases) {
    const store = new InMemoryInviteStore();
    const invite = await store.createInvite(baseInput);

    await action(store, invite.slug);

    const updatedInvite = await getInviteForRecipientPage({
      previewMode: false,
      slug: invite.slug,
      store
    });

    assert.equal(updatedInvite?.status, expectedStatus);
    assert.equal(getRecipientPageState(updatedInvite?.status ?? "draft"), expectedState);
  }

  const store = new InMemoryInviteStore();
  const expiringInvite = await store.createInvite({
    ...baseInput,
    expiresAt: "2026-06-01T10:00:00.000Z"
  });
  await store.expireInvites("2026-06-04T10:00:00.000Z");

  const expiredInvite = await getInviteForRecipientPage({
    previewMode: false,
    slug: expiringInvite.slug,
    store
  });

  assert.equal(expiredInvite?.status, "expired");
  assert.equal(getRecipientPageState(expiredInvite?.status ?? "draft"), "expired");
});

test("terminal and unavailable states hide mode UI and response helpers", () => {
  const hiddenStates: Array<ReturnType<typeof getRecipientPageState>> = [
    "accepted",
    "raincheck",
    "declined",
    "flagged",
    "expired",
    "cancelled",
    "unavailable"
  ];

  for (const state of hiddenStates) {
    for (const mode of ["lawyer", "unbothered"] satisfies InviteMode[]) {
      assert.equal(shouldShowLawyerMode({ mode, state }), false);
      assert.equal(shouldShowUnbotheredMode({ mode, state }), false);
    }

    assert.equal(shouldShowCompatibilityReport(state), false);
    assert.equal(shouldShowRaincheckPanel(state), false);
  }

  assert.equal(shouldShowCompatibilityReport("respondable"), true);
  assert.equal(shouldShowKindReplyAssistant("declined"), true);
  assert.equal(shouldShowKindReplyAssistant("raincheck"), false);
});

test("unsafe availability states do not render full invite details", () => {
  assert.equal(shouldShowInviteDetails("respondable"), true);
  assert.equal(shouldShowInviteDetails("accepted"), true);
  assert.equal(shouldShowInviteDetails("raincheck"), true);
  assert.equal(shouldShowInviteDetails("declined"), true);
  assert.equal(shouldShowInviteDetails("flagged"), false);
  assert.equal(shouldShowInviteDetails("expired"), false);
  assert.equal(shouldShowInviteDetails("cancelled"), false);
  assert.equal(shouldShowInviteDetails("unavailable"), false);
});

test("metadata stays generic and excludes private invite data", () => {
  const metadata = getInvitePageMetadata();
  const metadataJson = JSON.stringify(metadata);

  assert.equal(metadata.description, invitePageGenericPreview);
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false
  });

  for (const privateValue of [
    "Private Sender",
    "Private Recipient",
    "Private dinner message",
    "Private Place",
    "123 Secret Street",
    "2026-06-10",
    "19:30"
  ]) {
    assert.equal(metadataJson.includes(privateValue), false);
  }
});

test("raincheck counter-offer details persist for the raincheck state", async () => {
  const store = new InMemoryInviteStore();
  const invite = await store.createInvite(baseInput);
  const updatedInvite = await store.respond(invite.slug, {
    response: "raincheck",
    counterOffer: {
      message: "Maybe next week?",
      selectedOption: "different_day",
      proposedDateIso: "2026-06-20"
    }
  });

  assert.deepEqual(getRaincheckStateDetails(updatedInvite!), {
    note: "Maybe next week?",
    selectedOptionLabel: "Different day",
    suggestedDate: "2026-06-20"
  });
});
