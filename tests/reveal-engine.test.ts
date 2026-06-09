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
    startsAtLabel: "Friday, June 12 · 7:00 PM",
    placeName: "The Corner Cafe",
    placeAddress: "123 Fictional Street",
    dressHint: "Something comfortable",
    message: "I have a small case to make for coffee this Friday.",
    hasDateDetails: true,
    hasPlaceDetails: true,
    calendar: {
      dateTypeLabel: "Romantic Moment",
      startsAt: "2026-06-12T19:00",
      placeName: "The Corner Cafe",
      placeAddress: "123 Fictional Street"
    }
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
  assert.equal(reveal.calendar, null);
});

test("accepted reveal formats complete local date and time humanly", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-19T19:30"
    }
  });

  assert.equal(reveal.startsAtLabel, "Friday, June 19 · 7:30 PM");
});

test("accepted reveal formats noon and midnight correctly", () => {
  const noonReveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-19T12:00"
    }
  });
  const midnightReveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-19T00:00"
    }
  });

  assert.equal(noonReveal.startsAtLabel, "Friday, June 19 · 12:00 PM");
  assert.equal(midnightReveal.startsAtLabel, "Friday, June 19 · 12:00 AM");
});

test("accepted reveal preserves leading-zero local times", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-19T09:05"
    }
  });

  assert.equal(reveal.startsAtLabel, "Friday, June 19 · 9:05 AM");
});

test("accepted reveal formats date-only values without inventing time", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-19"
    }
  });

  assert.equal(reveal.startsAtLabel, "Friday, June 19");
});

test("accepted reveal returns a safe fallback for malformed date values", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "not a date"
    }
  });

  assert.equal(reveal.startsAtLabel, "not a date");
  assert.equal(reveal.hasDateDetails, true);
  assert.equal(reveal.calendar, null);
});

test("accepted reveal date output is deterministic and has no timezone shift", () => {
  const input = {
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-19T00:30"
    }
  };

  assert.equal(
    getAcceptedRevealViewModel(input).startsAtLabel,
    "Friday, June 19 · 12:30 AM"
  );
  assert.equal(
    getAcceptedRevealViewModel(input).startsAtLabel,
    getAcceptedRevealViewModel(input).startsAtLabel
  );
});

test("accepted reveal omits missing place details without placeholders", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    placeDetails: {}
  });

  assert.equal(reveal.placeName, null);
  assert.equal(reveal.placeAddress, null);
  assert.equal(reveal.hasPlaceDetails, false);
  assert.deepEqual(reveal.calendar, {
    dateTypeLabel: "Romantic Moment",
    startsAt: "2026-06-12T19:00",
    placeName: null,
    placeAddress: null
  });
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

test("accepted reveal uses place details notes as the note when present", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    placeDetails: {
      name: "The Corner Cafe",
      notes: "Smart casual"
    }
  });

  assert.equal(reveal.dressHint, "Smart casual");
});

test("accepted reveal never uses date details notes as dress guidance", () => {
  const reveal = getAcceptedRevealViewModel({
    ...completeInvite,
    dateDetails: {
      startsAt: "2026-06-19T19:30",
      notes: "romantic_moment"
    },
    placeDetails: {
      name: "The Corner Cafe"
    }
  });

  assert.equal(reveal.dressHint, null);
});

test("accepted reveal does not render date-type values as dress guidance", () => {
  for (const dateTypeValue of [
    "date",
    "apology",
    "surprise",
    "romantic_moment"
  ]) {
    const reveal = getAcceptedRevealViewModel({
      ...completeInvite,
      dateDetails: {
        notes: dateTypeValue
      },
      placeDetails: {}
    });

    assert.equal(reveal.dressHint, null);
  }
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

test("accepted reveal exposes only calendar-safe values for calendar download", () => {
  const reveal = getAcceptedRevealViewModel(completeInvite);

  assert.deepEqual(reveal.calendar, {
    dateTypeLabel: "Romantic Moment",
    startsAt: "2026-06-12T19:00",
    placeName: "The Corner Cafe",
    placeAddress: "123 Fictional Street"
  });
  assert.notDeepEqual(reveal.calendar, {
    slug: completeInvite.slug,
    senderName: completeInvite.senderName,
    recipientName: completeInvite.recipientName,
    message: completeInvite.message
  });
});

test("RevealEngine has no storage or Supabase dependency", () => {
  const source = readFileSync("src/lib/reveal-engine.ts", "utf8");

  assert.doesNotMatch(source, /@supabase|Supabase/);
  assert.doesNotMatch(source, /inviteStore|InviteStore|InMemoryInviteStore/);
  assert.doesNotMatch(source, /process\.env|getenv|fetch\(/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /from\s+["'][^"']*accepted-reveal/);
  assert.doesNotMatch(source, /\.tsx/);
  assert.doesNotMatch(source, /dateDetails\.notes/);
  assert.doesNotMatch(source, /serializeCalendarEventToIcs|BEGIN:VCALENDAR/);
});
