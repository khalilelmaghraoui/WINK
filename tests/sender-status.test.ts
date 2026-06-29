import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { getSenderStatusViewModel } from "../src/lib/sender-status";
import type { Invite } from "../src/lib/invite-store";

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
  message: "A private message.",
  dateDetails: {
    startsAt: "2026-06-17T19:30"
  },
  placeDetails: {
    name: "The Corner Cafe",
    address: "12 Main Street"
  },
  response: null,
  counterOffer: null,
  noTapCount: 0,
  openedAt: null,
  respondedAt: null,
  unknownSenderFlaggedAt: null,
  canceledAt: null,
  expiresAt: null,
  expiredAt: null,
  recipientMessage: null,
  recipientMessageSentAt: null,
  hasSenderAccess: true,
  createdAt: "2026-06-10T12:00:00.000Z",
  updatedAt: "2026-06-10T12:00:00.000Z"
};

test("sender status presents pending and opened without exact openedAt", () => {
  assert.equal(
    getSenderStatusViewModel(baseInvite).heading,
    "Waiting for them to open the invitation."
  );

  const opened = getSenderStatusViewModel({
    ...baseInvite,
    status: "opened",
    phase: "opened",
    openedAt: "2026-06-10T12:34:56.000Z"
  });

  assert.equal(opened.heading, "The invitation has been opened.");
  assert.doesNotMatch(JSON.stringify(opened), /12:34:56|openedAt/);
});

test("sender status presents accepted plan and raincheck details", () => {
  const accepted = getSenderStatusViewModel({
    ...baseInvite,
    status: "accepted",
    phase: "responded",
    response: "yes"
  });
  const raincheck = getSenderStatusViewModel({
    ...baseInvite,
    status: "raincheck",
    phase: "responded",
    response: "raincheck",
    counterOffer: {
      message: "Maybe next week?",
      selectedOption: "different_day",
      proposedDateIso: "2026-06-25",
      proposedPlace: "Somewhere quieter"
    }
  });

  assert.equal(accepted.heading, "They said yes.");
  assert.equal(accepted.plan?.startsAtLabel, "Wednesday, June 17 · 7:30 PM");
  assert.equal(raincheck.heading, "They sent a raincheck.");
  assert.equal(raincheck.raincheck?.message, "Maybe next week?");
  assert.equal(raincheck.raincheck?.selectedOptionLabel, "Different day");
});

test("sender status presents declined recipient message or no-message copy", () => {
  const declined = getSenderStatusViewModel({
    ...baseInvite,
    status: "declined",
    phase: "responded",
    response: "no",
    recipientMessage: "Thank you, but no.",
    recipientMessageSentAt: "2026-06-10T12:05:00.000Z"
  });
  const declinedWithoutMessage = getSenderStatusViewModel({
    ...baseInvite,
    status: "declined",
    phase: "responded",
    response: "no"
  });

  assert.equal(declined.heading, "They said no.");
  assert.equal(declined.recipientMessage, "Thank you, but no.");
  assert.equal(declinedWithoutMessage.noMessageText, "No additional message was sent.");
});

test("sender status hides flagged state details", () => {
  const flagged = getSenderStatusViewModel({
    ...baseInvite,
    status: "flagged",
    phase: "closed",
    unknownSenderFlaggedAt: "2026-06-10T12:05:00.000Z"
  });
  const serialized = JSON.stringify(flagged);

  assert.equal(flagged.isUnavailable, true);
  assert.equal(flagged.heading, "This invitation is no longer available.");
  assert.doesNotMatch(serialized, /flagged|unknownSender/i);
});

test("sender status mapper is pure and storage-free", () => {
  const source = readFileSync("src/lib/sender-status.ts", "utf8");

  assert.doesNotMatch(source, /InviteStore|inviteStore|@supabase|Supabase/);
  assert.doesNotMatch(source, /process\.env|fetch\(|senderTokenHash/);
});
