import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  getRecipientPageState,
  shouldShowCompatibilityReport,
  shouldShowKindReplyAssistant,
  shouldShowLawyerMode,
  shouldShowRaincheckPanel,
  shouldShowUnbotheredMode
} from "../src/lib/invite-page";
import { InMemoryInviteStore } from "../src/lib/invite-store";
import type { CreateInviteInput, InviteStatus } from "../src/lib/invite-store";
import { getSenderStatusViewModel } from "../src/lib/sender-status";

const senderPageSource = readFileSync("app/s/[token]/page.tsx", "utf8");
const senderControlsSource = readFileSync(
  "app/s/[token]/sender-controls.tsx",
  "utf8"
);
const senderActionsSource = readFileSync("app/s/[token]/actions.ts", "utf8");
const inviteStoreSource = readFileSync("src/lib/invite-store.ts", "utf8");
const supabaseStoreSource = readFileSync(
  "src/lib/storage/invite-store-supabase.ts",
  "utf8"
);

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

test("sender page wires copy recipient link control without exposing sender token", () => {
  assert.match(senderPageSource, /<SenderControls/);
  assert.match(senderPageSource, /recipientPath=\{`\/i\/\$\{invite\.slug\}`\}/);
  assert.match(senderControlsSource, /Copy recipient link/);
  assert.match(senderControlsSource, /navigator\.clipboard\.writeText/);
  assert.match(senderControlsSource, /Recipient link copied\./);
  assert.match(
    senderControlsSource,
    /Could not copy\. Select the link manually\./
  );
  assert.match(senderControlsSource, /select-all break-all/);
  assert.doesNotMatch(senderControlsSource, /\/s\/|senderTokenHash|tokenHash/);
  assert.doesNotMatch(senderControlsSource, /localStorage|document\.cookie/);
});

test("sender controls show cancel only for pending and opened sender states", () => {
  assert.match(
    senderPageSource,
    /viewModel\.kind === "pending" \|\| viewModel\.kind === "opened"/
  );
  assert.match(senderControlsSource, /Cancel invitation/);
  assert.match(senderControlsSource, /Cancel this invitation\?/);
  assert.match(senderControlsSource, /Yes, cancel invitation/);
  assert.match(senderControlsSource, /Keep invitation open/);

  const cancellableStatuses: InviteStatus[] = ["pending", "opened"];
  const nonCancellableStatuses: InviteStatus[] = [
    "accepted",
    "raincheck",
    "declined",
    "flagged",
    "expired",
    "cancelled"
  ];

  for (const status of cancellableStatuses) {
    assert.equal(
      ["pending", "opened"].includes(
        getSenderStatusViewModel({
          ...baseInvite(status),
          status
        }).kind
      ),
      true,
      status
    );
  }

  for (const status of nonCancellableStatuses) {
    const kind = getSenderStatusViewModel(baseInvite(status)).kind;

    assert.equal(kind === "pending" || kind === "opened", false, status);
  }
});

test("sender token cancellation mutates only cancellable invites", async () => {
  const store = new InMemoryInviteStore({
    now: () => "2026-06-10T12:00:00.000Z"
  });
  const { invite, senderAccessToken } = await store.createInvite(baseInput);

  const cancelled = await store.cancelInviteBySenderToken(senderAccessToken);
  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(cancelled?.status, "cancelled");
  assert.equal(cancelled?.response, null);
  assert.equal(cancelled?.recipientMessage, null);
  assert.equal(persistedInvite?.status, "cancelled");
  assert.equal(await store.cancelInviteBySenderToken("not-a-real-token"), null);
  assert.equal(await store.cancelInviteBySenderToken(invite.slug), null);
});

test("terminal sender states cannot be cancelled", async () => {
  const cases: Array<{
    label: string;
    setup: (store: InMemoryInviteStore, slug: string) => Promise<void>;
  }> = [
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
      label: "declined",
      setup: async (store, slug) => {
        await store.respond(slug, { response: "no" });
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
    }
  ];

  for (const { label, setup } of cases) {
    const store = new InMemoryInviteStore();
    const { invite, senderAccessToken } = await store.createInvite(baseInput);

    await setup(store, invite.slug);

    assert.equal(
      await store.cancelInviteBySenderToken(senderAccessToken),
      null,
      label
    );
  }
});

test("recipient cancelled state hides response and reveal mechanics", () => {
  const pageState = getRecipientPageState("cancelled");

  assert.equal(pageState, "cancelled");
  assert.equal(shouldShowCompatibilityReport(pageState), false);
  assert.equal(shouldShowRaincheckPanel(pageState), false);
  assert.equal(shouldShowKindReplyAssistant(pageState), false);
  assert.equal(shouldShowLawyerMode({ mode: "lawyer", state: pageState }), false);
  assert.equal(
    shouldShowUnbotheredMode({ mode: "unbothered", state: pageState }),
    false
  );
});

test("sender controls source preserves privacy and route guardrails", () => {
  const sourceText = [
    senderPageSource,
    senderControlsSource,
    senderActionsSource
  ].join("\n");

  assert.doesNotMatch(sourceText, /@supabase|Supabase/);
  assert.doesNotMatch(sourceText, /senderTokenHash|hashSenderAccessToken/);
  assert.doesNotMatch(sourceText, /console\.(log|info|warn|error)/);
  assert.doesNotMatch(
    sourceText,
    /sendBeacon|trackEvent|analytics|mixpanel|amplitude|openCount|viewedAt/
  );
  assert.doesNotMatch(sourceText, /localStorage|document\.cookie/);
  assert.match(senderActionsSource, /cancelInviteBySenderToken/);
  assert.match(inviteStoreSource, /cancelInviteBySenderToken/);
  assert.match(supabaseStoreSource, /\.eq\("sender_token_hash", senderTokenHash\)/);
  assert.equal(existsSync("app/s/[token]/route.ts"), false);
  assert.equal(existsSync("app/s/[token]/route.tsx"), false);
});

test("sender controls do not add new product routes", () => {
  const routeFiles = listFiles("app").filter((file) =>
    /[/\\](page|route)\.tsx?$/.test(file)
  );

  assert.deepEqual(
    routeFiles
      .map((file) => file.replaceAll("\\", "/"))
      .sort(),
    [
      "app/create/page.tsx",
      "app/i/[slug]/page.tsx",
      "app/page.tsx",
      "app/s/[token]/page.tsx"
    ].sort()
  );
});

function baseInvite(status: InviteStatus) {
  return {
    id: `invite-${status}`,
    slug: `slug-${status}`,
    mode: "lawyer" as const,
    tone: "romantic" as const,
    dateType: "date" as const,
    status,
    phase:
      status === "pending"
        ? ("sent" as const)
        : status === "opened"
          ? ("opened" as const)
          : ("closed" as const),
    senderName: "Sender",
    recipientName: "Recipient",
    message: "A small invitation.",
    dateDetails: {},
    placeDetails: {},
    response:
      status === "accepted"
        ? ("yes" as const)
        : status === "raincheck"
          ? ("raincheck" as const)
          : status === "declined"
            ? ("no" as const)
            : null,
    counterOffer: null,
    noTapCount: 0 as const,
    openedAt: status === "opened" ? "2026-06-10T12:00:00.000Z" : null,
    respondedAt:
      status === "accepted" || status === "raincheck" || status === "declined"
        ? "2026-06-10T12:00:00.000Z"
        : null,
    unknownSenderFlaggedAt:
      status === "flagged" ? "2026-06-10T12:00:00.000Z" : null,
    canceledAt: status === "cancelled" ? "2026-06-10T12:00:00.000Z" : null,
    expiresAt: null,
    expiredAt: status === "expired" ? "2026-06-10T12:00:00.000Z" : null,
    recipientMessage: null,
    recipientMessageSentAt: null,
    hasSenderAccess: true,
    createdAt: "2026-06-10T12:00:00.000Z",
    updatedAt: "2026-06-10T12:00:00.000Z"
  };
}

function listFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);

    if (statSync(fullPath).isDirectory()) {
      return listFiles(fullPath);
    }

    return fullPath;
  });
}
