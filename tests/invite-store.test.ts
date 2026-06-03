import assert from "node:assert/strict";
import { test } from "node:test";

import { InMemoryInviteStore } from "../src/lib/invite-store";
import type {
  CreateInviteInput,
  InviteResponse
} from "../src/lib/invite-store";

const baseInput: CreateInviteInput = {
  recipientName: "Recipient",
  message: "A small invitation.",
  mode: "lawyer",
  tone: "playful",
  dateType: "date",
  dateDetails: {
    title: "Dinner"
  },
  placeDetails: {
    name: "Somewhere nice"
  }
};

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
  }
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
