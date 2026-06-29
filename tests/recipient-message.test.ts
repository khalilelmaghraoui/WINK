import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { InMemoryInviteStore } from "../src/lib/invite-store";
import type { CreateInviteInput } from "../src/lib/invite-store";
import {
  recipientMessageMaxLength,
  validateRecipientMessage
} from "../src/lib/recipient-message";

const baseInput: CreateInviteInput = {
  senderName: "Sender",
  recipientName: "Recipient",
  message: "A small invitation.",
  mode: "lawyer",
  tone: "romantic",
  dateType: "date",
  dateDetails: {
    startsAt: "2026-06-17T19:30"
  },
  placeDetails: {
    name: "Somewhere nice"
  }
};

test("recipient message validation trims and limits plain text", () => {
  assert.deepEqual(validateRecipientMessage("  hello\r\nthere  "), {
    message: "hello\nthere",
    ok: true
  });
  assert.deepEqual(validateRecipientMessage("   "), {
    error: "Write a message before sending.",
    ok: false
  });
  assert.deepEqual(validateRecipientMessage("x".repeat(301)), {
    error: `Keep it to ${recipientMessageMaxLength} characters or fewer.`,
    ok: false
  });
  assert.equal(validateRecipientMessage("x".repeat(300)).ok, true);
  assert.equal(validateRecipientMessage("<strong>no markup</strong>").ok, true);
});

test("declined invite with sender access can store one recipient message", async () => {
  const times = [
    "2026-06-10T12:00:00.000Z",
    "2026-06-10T12:01:00.000Z",
    "2026-06-10T12:02:00.000Z"
  ];
  const store = new InMemoryInviteStore({
    now: () => times.shift() ?? "2026-06-10T12:03:00.000Z"
  });
  const { invite } = await store.createInvite(baseInput);
  const declinedInvite = await store.respond(invite.slug, { response: "no" });

  const withMessage = await store.sendRecipientMessage(
    invite.slug,
    "  That's kind, but no thank you.  "
  );
  const secondAttempt = await store.sendRecipientMessage(
    invite.slug,
    "Trying to replace it."
  );

  assert.equal(withMessage?.status, "declined");
  assert.equal(withMessage?.response, "no");
  assert.equal(withMessage?.respondedAt, declinedInvite?.respondedAt);
  assert.equal(withMessage?.recipientMessage, "That's kind, but no thank you.");
  assert.equal(
    withMessage?.recipientMessageSentAt,
    "2026-06-10T12:02:00.000Z"
  );
  assert.equal(secondAttempt?.recipientMessage, withMessage?.recipientMessage);
  assert.equal(
    secondAttempt?.recipientMessageSentAt,
    withMessage?.recipientMessageSentAt
  );
});

test("recipient message is blocked for non-declined states", async () => {
  const cases: Array<{
    setup: (store: InMemoryInviteStore, slug: string) => Promise<void>;
    label: string;
  }> = [
    { label: "pending", setup: async () => {} },
    {
      label: "opened",
      setup: async (store, slug) => {
        await store.markOpened(slug);
      }
    },
    {
      label: "accepted",
      setup: async (store, slug) => {
        await store.respond(slug, { response: "yes" });
      }
    },
    {
      label: "raincheck",
      setup: async (store, slug) => {
        await store.respond(slug, { response: "raincheck" });
      }
    },
    {
      label: "flagged",
      setup: async (store, slug) => {
        await store.flagUnknownSender(slug);
      }
    },
    {
      label: "cancelled",
      setup: async (store, slug) => {
        await store.cancelInvite(slug);
      }
    },
    {
      label: "expired",
      setup: async (store, slug) => {
        await store.expireInvites("2026-06-10T12:01:00.000Z");
        assert.ok(slug);
      }
    }
  ];

  for (const { label, setup } of cases) {
    const store = new InMemoryInviteStore({
      now: () => "2026-06-10T12:00:00.000Z"
    });
    const { invite } = await store.createInvite({
      ...baseInput,
      expiresAt:
        label === "expired" ? "2026-06-10T12:00:00.000Z" : undefined
    });

    await setup(store, invite.slug);

    assert.equal(
      await store.sendRecipientMessage(invite.slug, "No thank you."),
      null,
      label
    );
  }
});

test("recipient message blocks preview mode and legacy invites", async () => {
  const store = new InMemoryInviteStore();
  const { invite } = await store.createInvite(baseInput);
  const legacyInvite = await store.createLegacyInviteForTest(baseInput);

  await store.respond(invite.slug, { response: "no" });
  await store.respond(legacyInvite.slug, { response: "no" });

  const previewResult = await store.sendRecipientMessage(
    invite.slug,
    "No thank you.",
    { previewMode: true }
  );
  const legacyResult = await store.sendRecipientMessage(
    legacyInvite.slug,
    "No thank you."
  );
  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(previewResult?.recipientMessage, null);
  assert.equal(persistedInvite?.recipientMessage, null);
  assert.equal(legacyResult, null);
});

test("recipient message source does not add notification behavior", () => {
  const actionSource = readFileSync("app/i/[slug]/actions.ts", "utf8");
  const validatorSource = readFileSync("src/lib/recipient-message.ts", "utf8");

  assert.doesNotMatch(actionSource, /sendEmail|sendSms|notification|notify/i);
  assert.doesNotMatch(actionSource, /senderAccessToken|senderTokenHash/);
  assert.doesNotMatch(validatorSource, /fetch\(|@supabase|localStorage/);
});
