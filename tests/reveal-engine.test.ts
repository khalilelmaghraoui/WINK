import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { getAcceptedRevealViewModel } from "../src/lib/reveal-engine";
import type { Invite } from "../src/lib/invite-store";

const completeInvite: Invite = {
  id: "invite-1",
  slug: "abc123xy",
  mode: "lawyer",
  tone: "funny",
  dateType: "romantic_moment",
  status: "accepted",
  phase: "responded",
  senderName: "Alex",
  recipientName: "Sam",
  message: "I have a small case to make for coffee this Friday.",
  dateDetails: {
    startsAt: "2026-06-12T19:00",
    notes: "A calm backup note"
  },
  placeDetails: {
    name: "The Corner Cafe",
    address: "123 Fictional Street",
    notes: "Something comfortable"
  },
  response: "yes",
  counterOffer: null,
  noTapCount: 0,
  openedAt: "2026-06-08T10:00:00.000Z",
  respondedAt: "2026-06-08T10:05:00.000Z",
  unknownSenderFlaggedAt: null,
  canceledAt: null,
  expiresAt: null,
  expiredAt: null,
  createdAt: "2026-06-08T09:55:00.000Z",
  updatedAt: "2026-06-08T10:05:00.000Z"
};

test("accepted reveal view model formats complete invite data", () => {
  const reveal = getAcceptedRevealViewModel(completeInvite);

  assert.deepEqual(reveal, {
    heading: "It's a yes.",
    summary: "The plan is here whenever you need it.",
    dateTypeLabel: "Romantic Moment",
    startsAtLabel: "2026-06-12 at 19:00",
    placeName: "The Corner Cafe",
    placeAddress: "123 Fictional Street",
    dressHint: "Something comfortable",
    message: "I have a small case to make for coffee this Friday.",
    hasDateDetails: true,
    hasPlaceDetails: true
  });
});

test("accepted reveal omits missing date details without throwing", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {}
  });

  assert.equal(reveal.startsAtLabel, null);
  assert.equal(reveal.hasDateDetails, false);
  assert.equal(reveal.dateTypeLabel, "Romantic Moment");
});

test("accepted reveal omits missing place details without placeholders", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    placeDetails: {}
  });

  assert.equal(reveal.placeName, null);
  assert.equal(reveal.placeAddress, null);
  assert.equal(reveal.hasPlaceDetails, false);
});

test("accepted reveal omits optional notes and dress hint when absent", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-12T19:00"
    },
    placeDetails: {
      name: "The Corner Cafe"
    }
  });

  assert.equal(reveal.dressHint, null);
});

test("accepted reveal prefers explicit dress hint when present", () => {
  const inviteWithDressHint = {
    ...completeInvite,
    dressHint: "Jacket optional"
  } as Invite & { dressHint: string };

  const reveal = getAcceptedRevealViewModel(inviteWithDressHint);

  assert.equal(reveal.dressHint, "Jacket optional");
});

test("accepted reveal safely formats date types", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateType: "apology"
  });

  assert.equal(reveal.dateTypeLabel, "Apology");
});

test("accepted reveal does not mutate the original invite", () => {
  const before = JSON.parse(JSON.stringify(completeInvite));

  getAcceptedRevealViewModel(completeInvite);

  assert.deepEqual(completeInvite, before);
});

test("accepted reveal output is deterministic", () => {
  assert.deepEqual(
    getAcceptedRevealViewModel(completeInvite),
    getAcceptedRevealViewModel(completeInvite)
  );
});

test("RevealEngine has no storage or Supabase dependency", () => {
  const source = readFileSync("src/lib/reveal-engine.ts", "utf8");

  assert.doesNotMatch(source, /@supabase|Supabase/);
  assert.doesNotMatch(source, /inviteStore|InviteStore|InMemoryInviteStore/);
  assert.doesNotMatch(source, /process\.env|getenv|fetch\(/);
});
