import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const createFormSource = readFileSync(
  "app/create/create-invite-form.tsx",
  "utf8"
);
const recipientShareSource = readFileSync(
  "app/create/share-recipient-link-control.tsx",
  "utf8"
);
const privateSenderCopySource = readFileSync(
  "app/create/copy-private-sender-link-control.tsx",
  "utf8"
);

test("create success UI separates recipient and private sender links", () => {
  assert.match(createFormSource, /Share this with the recipient/);
  assert.match(createFormSource, /This opens the invitation and lets them respond/);
  assert.match(createFormSource, /Keep this private link/);
  assert.match(createFormSource, /Anyone with this link can view the sender page/);
  assert.match(createFormSource, /WINK cannot recover it later/);
  assert.match(createFormSource, /Send only the recipient link/);
  assert.match(createFormSource, /ShareRecipientLinkControl/);
  assert.match(createFormSource, /CopyPrivateSenderLinkControl/);
});

test("native share is recipient-only and never uses the private sender link", () => {
  assert.match(recipientShareSource, /navigator\.share/);
  assert.match(recipientShareSource, /Share recipient link/);
  assert.match(recipientShareSource, /title: "WINK invitation"/);
  assert.match(recipientShareSource, /text: "I made you a WINK invitation\."/);
  assert.match(recipientShareSource, /url: recipientUrl/);
  assert.match(recipientShareSource, /new URL\(recipientPath, origin\)/);
  assert.doesNotMatch(recipientShareSource, /senderPath|senderUrl|\/s\//);
  assert.doesNotMatch(privateSenderCopySource, /navigator\.share|Share private/);
});

test("recipient and sender copy actions have distinct labels and fallbacks", () => {
  assert.match(recipientShareSource, /Copy recipient link/);
  assert.match(recipientShareSource, /Recipient link copied\./);
  assert.match(recipientShareSource, /Could not share\. Copy the link instead\./);
  assert.match(recipientShareSource, /Could not copy\. Select the link manually\./);
  assert.match(privateSenderCopySource, /Copy private sender link/);
  assert.match(privateSenderCopySource, /Private sender link copied\./);
  assert.match(
    privateSenderCopySource,
    /Could not copy\. Select the private sender link manually\./
  );
});

test("share and copy controls are browser-only and source-safe", () => {
  const sourceText = [
    recipientShareSource,
    privateSenderCopySource,
    createFormSource
  ].join("\n");

  assert.match(sourceText, /aria-live="polite"/);
  assert.match(sourceText, /role="status"/);
  assert.match(sourceText, /select-all break-all/);
  assert.doesNotMatch(sourceText, /@supabase|Supabase|InviteStore|inviteStore/);
  assert.doesNotMatch(sourceText, /fetch\(|XMLHttpRequest|sendBeacon/);
  assert.doesNotMatch(sourceText, /localStorage|document\.cookie/);
  assert.doesNotMatch(
    sourceText,
    /analytics|trackEvent|mixpanel|amplitude|openCount|readReceipt/i
  );
  assert.doesNotMatch(sourceText, /WhatsApp|SMS|Instagram|mailto:|tel:/i);
});

test("share UX does not introduce new product routes", () => {
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
