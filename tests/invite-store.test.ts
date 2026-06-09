import assert from "node:assert/strict";
import { test } from "node:test";

import { InMemoryInviteStore } from "../src/lib/invite-store";
import type {
  CreateInviteInput,
  InviteTone,
  InviteResponse
} from "../src/lib/invite-store";

const baseInput: CreateInviteInput = {
  recipientName: "Recipient",
  message: "A small invitation.",
  mode: "lawyer",
  tone: "romantic",
  dateType: "date",
  dateDetails: {
    title: "Dinner"
  },
  placeDetails: {
    name: "Somewhere nice"
  }
};

test("createInvite stores each supported tone", async () => {
  const tones: InviteTone[] = ["cute", "funny", "romantic", "bold"];

  for (const tone of tones) {
    const store = new InMemoryInviteStore();
    const invite = await store.createInvite({
      ...baseInput,
      tone
    });

    assert.equal(invite.tone, tone);
  }
});

test("createInvite initializes noTapCount to zero", async () => {
  const store = new InMemoryInviteStore();
  const invite = await store.createInvite(baseInput);

  assert.equal(invite.noTapCount, 0);
});

test("getInviteBySlug returns null for a missing slug", async () => {
  const store = new InMemoryInviteStore();

  await assert.doesNotReject(async () => {
    const invite = await store.getInviteBySlug("missing");
    assert.equal(invite, null);
  });
});

test("markOpened writes openedAt once only", async () => {
  const times = [
    "2026-06-03T10:00:00.000Z",
    "2026-06-03T10:01:00.000Z",
    "2026-06-03T10:02:00.000Z"
  ];
  const store = new InMemoryInviteStore({
    now: () => times.shift() ?? "2026-06-03T10:03:00.000Z"
  });
  const invite = await store.createInvite(baseInput);

  const firstOpen = await store.markOpened(invite.slug);
  const secondOpen = await store.markOpened(invite.slug);

  assert.equal(firstOpen?.openedAt, "2026-06-03T10:01:00.000Z");
  assert.equal(secondOpen?.openedAt, "2026-06-03T10:01:00.000Z");
  assert.equal(secondOpen?.status, "opened");
});

test("preview mode blocks openedAt and response writes", async () => {
  const store = new InMemoryInviteStore();
  const invite = await store.createInvite(baseInput);

  await store.markOpened(invite.slug, { previewMode: true });
  await store.respond(invite.slug, {
    response: "yes",
    previewMode: true
  });

  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(persistedInvite?.openedAt, null);
  assert.equal(persistedInvite?.response, null);
  assert.equal(persistedInvite?.status, "pending");
});

test("recordNoTap stores only a capped integer", async () => {
  const store = new InMemoryInviteStore();
  const invite = await store.createInvite(baseInput);

  const firstTap = await store.recordNoTap(invite.slug);
  const secondTap = await store.recordNoTap(invite.slug);
  const thirdTap = await store.recordNoTap(invite.slug);

  assert.equal(firstTap?.noTapCount, 1);
  assert.equal(secondTap?.noTapCount, 2);
  assert.equal(thirdTap?.noTapCount, 2);
});

test("preview mode blocks noTapCount writes", async () => {
  const store = new InMemoryInviteStore();
  const invite = await store.createInvite(baseInput);

  const previewTap = await store.recordNoTap(invite.slug, {
    previewMode: true
  });
  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(previewTap?.noTapCount, 0);
  assert.equal(persistedInvite?.noTapCount, 0);
});

test("respond applies status transitions", async () => {
  const responses: Array<[InviteResponse, string]> = [
    ["yes", "accepted"],
    ["raincheck", "raincheck"],
    ["no", "declined"]
  ];

  for (const [response, expectedStatus] of responses) {
    const store = new InMemoryInviteStore();
    const invite = await store.createInvite(baseInput);
    const updatedInvite = await store.respond(invite.slug, { response });

    assert.equal(updatedInvite?.status, expectedStatus);
    assert.equal(updatedInvite?.response, response);
    assert.equal(updatedInvite?.phase, "responded");
    assert.notEqual(updatedInvite?.respondedAt, null);
  }
});

test("raincheck response stores a minimal counter-offer message", async () => {
  const store = new InMemoryInviteStore();
  const invite = await store.createInvite(baseInput);
  const updatedInvite = await store.respond(invite.slug, {
    response: "raincheck",
    counterOffer: {
      message: "Could we try Saturday?"
    }
  });

  assert.equal(updatedInvite?.status, "raincheck");
  assert.equal(updatedInvite?.counterOffer?.message, "Could we try Saturday?");
});

test("raincheck response stores option note and suggested date", async () => {
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

  assert.equal(updatedInvite?.status, "raincheck");
  assert.deepEqual(updatedInvite?.counterOffer, {
    message: "Maybe next week?",
    selectedOption: "different_day",
    proposedDateIso: "2026-06-20"
  });
});

test("expired invites block response transitions without mutating stored data", async () => {
  const responses: InviteResponse[] = ["yes", "raincheck", "no"];

  for (const response of responses) {
    const store = new InMemoryInviteStore({
      now: () => "2026-06-10T12:00:00.000Z"
    });
    const invite = await store.createInvite({
      ...baseInput,
      expiresAt: "2026-06-10T12:00:00.000Z"
    });
    const result = await store.respond(invite.slug, {
      response,
      counterOffer:
        response === "raincheck"
          ? {
              message: "Maybe Saturday?"
            }
          : null
    });
    const persistedInvite = await store.getInviteBySlug(invite.slug);

    assert.equal(result?.status, "expired");
    assert.equal(result?.response, null);
    assert.equal(result?.respondedAt, null);
    assert.equal(persistedInvite?.status, "pending");
    assert.equal(persistedInvite?.response, null);
    assert.equal(persistedInvite?.counterOffer, null);
    assert.equal(persistedInvite?.respondedAt, null);
  }
});

test("expired invites block unknown-sender and no-tap mutations", async () => {
  const store = new InMemoryInviteStore({
    now: () => "2026-06-10T12:00:00.000Z"
  });
  const invite = await store.createInvite({
    ...baseInput,
    expiresAt: "2026-06-10T12:00:00.000Z"
  });

  const tapResult = await store.recordNoTap(invite.slug);
  const flagResult = await store.flagUnknownSender(invite.slug);
  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(tapResult?.status, "expired");
  assert.equal(flagResult?.status, "expired");
  assert.equal(persistedInvite?.status, "pending");
  assert.equal(persistedInvite?.noTapCount, 0);
  assert.equal(persistedInvite?.unknownSenderFlaggedAt, null);
});

test("persisted expired status blocks later response mutation", async () => {
  const store = new InMemoryInviteStore({
    now: () => "2026-06-10T12:01:00.000Z"
  });
  const invite = await store.createInvite({
    ...baseInput,
    expiresAt: "2026-06-10T12:00:00.000Z"
  });

  await store.expireInvites("2026-06-10T12:01:00.000Z");

  const result = await store.respond(invite.slug, { response: "yes" });
  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(result?.status, "expired");
  assert.equal(result?.response, null);
  assert.equal(persistedInvite?.status, "expired");
  assert.equal(persistedInvite?.response, null);
  assert.equal(persistedInvite?.respondedAt, null);
});

test("safety and availability actions update status", async () => {
  const store = new InMemoryInviteStore();
  const flaggedInvite = await store.createInvite(baseInput);
  const cancelledInvite = await store.createInvite(baseInput);
  const expiringInvite = await store.createInvite({
    ...baseInput,
    expiresAt: "2026-06-03T10:00:00.000Z"
  });

  const flagged = await store.flagUnknownSender(flaggedInvite.slug);
  const cancelled = await store.cancelInvite(cancelledInvite.slug);
  const expired = await store.expireInvites("2026-06-03T10:01:00.000Z");

  assert.equal(flagged?.status, "flagged");
  assert.equal(cancelled?.status, "cancelled");
  assert.equal(expired.find((invite) => invite.slug === expiringInvite.slug)?.status, "expired");
});

test("createInvite retries slug generation on collision", async () => {
  const slugs = ["ABCDEFGH", "ABCDEFGH", "JKLMNPQR"];
  const store = new InMemoryInviteStore({
    slugLength: 8,
    slugGenerator: () => slugs.shift() ?? "STUVWXYZ"
  });

  const firstInvite = await store.createInvite(baseInput);
  const secondInvite = await store.createInvite(baseInput);

  assert.equal(firstInvite.slug, "ABCDEFGH");
  assert.equal(secondInvite.slug, "JKLMNPQR");
});
