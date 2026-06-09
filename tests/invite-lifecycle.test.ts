import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  getEffectiveInvite,
  getEffectiveInviteStatus,
  isInviteExpired,
  shouldPersistInviteExpiry
} from "../src/lib/invite-lifecycle";
import type { Invite, InviteStatus } from "../src/lib/invite-store";

const baseInvite: Invite = {
  id: "invite-1",
  slug: "ABC123XYZ",
  mode: "lawyer",
  tone: "romantic",
  dateType: "date",
  status: "pending",
  phase: "sent",
  senderName: "Sender",
  recipientName: "Recipient",
  message: "A small invitation.",
  dateDetails: {},
  placeDetails: {},
  response: null,
  counterOffer: null,
  noTapCount: 0,
  openedAt: null,
  respondedAt: null,
  unknownSenderFlaggedAt: null,
  canceledAt: null,
  expiresAt: "2026-06-10T12:00:00.000Z",
  expiredAt: null,
  createdAt: "2026-06-01T12:00:00.000Z",
  updatedAt: "2026-06-01T12:00:00.000Z"
};

test("pending invite is not expired before expiresAt", () => {
  const now = new Date("2026-06-10T11:59:59.999Z");

  assert.equal(isInviteExpired(baseInvite, now), false);
  assert.equal(getEffectiveInviteStatus(baseInvite, now), "pending");
});

test("pending invite is expired exactly at expiresAt", () => {
  const now = new Date("2026-06-10T12:00:00.000Z");

  assert.equal(isInviteExpired(baseInvite, now), true);
  assert.equal(getEffectiveInviteStatus(baseInvite, now), "expired");
});

test("pending invite is expired after expiresAt", () => {
  const now = new Date("2026-06-10T12:00:00.001Z");

  assert.equal(isInviteExpired(baseInvite, now), true);
  assert.equal(getEffectiveInviteStatus(baseInvite, now), "expired");
});

test("opened invite is expired after expiresAt", () => {
  const invite = {
    ...baseInvite,
    status: "opened" as const,
    phase: "opened" as const,
    openedAt: "2026-06-09T12:00:00.000Z"
  };

  assert.equal(
    getEffectiveInviteStatus(invite, new Date("2026-06-10T12:01:00.000Z")),
    "expired"
  );
});

test("missing expiry preserves existing status", () => {
  const invite = {
    ...baseInvite,
    expiresAt: null
  };

  assert.equal(
    getEffectiveInviteStatus(invite, new Date("2026-06-10T12:01:00.000Z")),
    "pending"
  );
});

test("malformed expiry does not crash or expire the invite", () => {
  const malformedValues = [
    "not-a-date",
    "2026-02-30T12:00:00.000Z",
    "2026-13-10T12:00:00.000Z"
  ];

  for (const expiresAt of malformedValues) {
    const invite = {
      ...baseInvite,
      expiresAt
    };

    assert.doesNotThrow(() =>
      getEffectiveInviteStatus(invite, new Date("2026-06-10T12:01:00.000Z"))
    );
    assert.equal(
      getEffectiveInviteStatus(invite, new Date("2026-06-10T12:01:00.000Z")),
      "pending"
    );
  }
});

test("terminal states are not replaced after expiresAt", () => {
  const terminalStates: InviteStatus[] = [
    "accepted",
    "raincheck",
    "declined",
    "flagged",
    "cancelled"
  ];

  for (const status of terminalStates) {
    const invite = {
      ...baseInvite,
      status,
      phase: status === "accepted" || status === "raincheck" || status === "declined"
        ? ("responded" as const)
        : ("closed" as const),
      response:
        status === "accepted"
          ? ("yes" as const)
          : status === "raincheck"
            ? ("raincheck" as const)
            : status === "declined"
              ? ("no" as const)
              : null
    };

    assert.equal(
      getEffectiveInviteStatus(invite, new Date("2026-06-10T12:01:00.000Z")),
      status
    );
  }
});

test("effective expired invite snapshot is derived without mutating original", () => {
  const original = structuredClone(baseInvite);
  const effectiveInvite = getEffectiveInvite(
    baseInvite,
    new Date("2026-06-10T12:01:00.000Z")
  );

  assert.equal(effectiveInvite.status, "expired");
  assert.equal(effectiveInvite.phase, "closed");
  assert.equal(effectiveInvite.expiredAt, "2026-06-10T12:01:00.000Z");
  assert.deepEqual(baseInvite, original);
});

test("expiry persistence decision is deterministic", () => {
  const nowIso = "2026-06-10T12:01:00.000Z";

  assert.equal(shouldPersistInviteExpiry(baseInvite, nowIso), true);
  assert.equal(shouldPersistInviteExpiry(baseInvite, nowIso), true);
  assert.equal(
    shouldPersistInviteExpiry(
      { ...baseInvite, expiredAt: "2026-06-10T12:00:00.000Z" },
      nowIso
    ),
    false
  );
});

test("lifecycle helper stays pure and provider-free", () => {
  const source = readFileSync("src/lib/invite-lifecycle.ts", "utf8");

  assert.doesNotMatch(source, /InviteStore/);
  assert.doesNotMatch(source, /Supabase|supabase/);
  assert.doesNotMatch(source, /React|tsx/);
  assert.doesNotMatch(source, /process\.env/);
  assert.doesNotMatch(source, /fetch\(/);
});
