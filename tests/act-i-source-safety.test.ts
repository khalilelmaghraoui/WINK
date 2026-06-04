import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const sourceRoots = ["app", "src"];
const sourceText = readSourceFiles(sourceRoots).join("\n");
const recipientPageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");
const unbotheredSource = readFileSync(
  "app/i/[slug]/unbothered-mode.tsx",
  "utf8"
);
const kindReplySource = readFileSync(
  "app/i/[slug]/kind-reply-assistant.tsx",
  "utf8"
);

test("Act I does not add response-only routes", () => {
  assert.equal(existsSync("app/no"), false);
  assert.equal(existsSync("app/maybe"), false);
});

test("Act I source does not contain forbidden open or tracking fields", () => {
  assert.doesNotMatch(sourceText, /openCount/);
  assert.doesNotMatch(
    sourceText,
    /navigator\.geolocation|sendBeacon|analytics|trackEvent|mixpanel|amplitude/i
  );
  assert.doesNotMatch(sourceText, /cursorPath|dwellTime|deviceFingerprint/i);
});

test("feature UI does not import future persistence or AI SDKs directly", () => {
  assert.doesNotMatch(
    sourceText,
    /@supabase|PrismaClient|Anthropic|Claude|AIProvider/
  );
});

test("recipient page gates mode and helper UI through state helpers", () => {
  assert.match(recipientPageSource, /shouldShowCompatibilityReport/);
  assert.match(recipientPageSource, /shouldShowLawyerMode/);
  assert.match(recipientPageSource, /shouldShowUnbotheredMode/);
  assert.match(recipientPageSource, /shouldShowRaincheckPanel/);
  assert.match(recipientPageSource, /shouldShowKindReplyAssistant/);
  assert.match(recipientPageSource, /shouldShowInviteDetails/);
});

test("Unbothered slot has explicit consent after the rigged result", () => {
  const confirmationIndex = unbotheredSource.indexOf(
    "unbotheredSlotConfirmationLabel"
  );
  const yesInputIndex = unbotheredSource.indexOf(
    '<input name="response" type="hidden" value="yes" />',
    confirmationIndex
  );

  assert.match(unbotheredSource, /Let fate decide 🎰/);
  assert.match(unbotheredSource, /The totally unbiased machine has spoken: YES/);
  assert.ok(confirmationIndex > 0);
  assert.ok(yesInputIndex > confirmationIndex);
});

test("Unbothered keeps Raincheck and No outside the slot panel", () => {
  const slotPanelIndex = unbotheredSource.indexOf("function SlotPanel");
  const raincheckIndex = unbotheredSource.indexOf(
    'triggerLabel="Maybe another day"'
  );
  const noIndex = unbotheredSource.indexOf(
    'aria-label="Answer no to this invitation"'
  );

  assert.ok(slotPanelIndex > 0);
  assert.ok(raincheckIndex > 0 && raincheckIndex < slotPanelIndex);
  assert.ok(noIndex > 0 && noIndex < slotPanelIndex);
  assert.equal(unbotheredSource.includes("disabled={"), false);
});

test("Kind Reply Assistant remains local-only and non-notifying", () => {
  assert.match(kindReplySource, /navigator\.clipboard\?\.writeText/);
  assert.match(kindReplySource, /Copied ✓/);
  assert.doesNotMatch(kindReplySource, /inviteStore|InviteStore/);
  assert.doesNotMatch(kindReplySource, /respondToInviteAction/);
  assert.doesNotMatch(kindReplySource, /fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(kindReplySource, /notification|notify|sendEmail|sendSms/i);
});

function readSourceFiles(roots: string[]): string[] {
  return roots.flatMap((root) => readSourceTree(root));
}

function readSourceTree(path: string): string[] {
  const stat = statSync(path);

  if (stat.isFile()) {
    return isSourceFile(path) ? [readFileSync(path, "utf8")] : [];
  }

  return readdirSync(path).flatMap((entry) => readSourceTree(join(path, entry)));
}

function isSourceFile(path: string): boolean {
  return /\.(ts|tsx)$/.test(path);
}
