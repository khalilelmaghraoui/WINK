import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const createActionSource = readFileSync("app/create/actions.ts", "utf8");
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
const senderPageSource = readFileSync("app/s/[token]/page.tsx", "utf8");
const kindReplySource = readFileSync(
  "app/i/[slug]/kind-reply-assistant.tsx",
  "utf8"
);
const recipientActionSource = readFileSync("app/i/[slug]/actions.ts", "utf8");
const inviteStoreSource = readFileSync("src/lib/invite-store.ts", "utf8");
const supabaseStoreSource = readFileSync(
  "src/lib/storage/invite-store-supabase.ts",
  "utf8"
);
const migrationSource = readFileSync(
  "supabase/migrations/20260610_private_sender_link_reply.sql",
  "utf8"
);

test("create flow returns distinct recipient and sender paths", () => {
  assert.match(createActionSource, /recipientPath: `\/i\/\$\{createdInvite\.invite\.slug\}`/);
  assert.match(createActionSource, /senderPath: `\/s\/\$\{createdInvite\.senderAccessToken\}`/);
  assert.match(createFormSource, /Share this with the recipient/);
  assert.match(createFormSource, /Keep this private link/);
  assert.match(recipientShareSource, /Copy recipient link/);
  assert.match(privateSenderCopySource, /Copy private sender link/);
  assert.match(createFormSource, /WINK cannot recover it later/);
  assert.doesNotMatch(
    [createFormSource, recipientShareSource, privateSenderCopySource].join("\n"),
    /localStorage|document\.cookie/
  );
});

test("sender route metadata is generic and noindex", () => {
  assert.match(senderPageSource, /Private WINK status/);
  assert.match(senderPageSource, /Open your private WINK link to view the invitation status/);
  assert.match(senderPageSource, /index: false/);
  assert.match(senderPageSource, /follow: false/);
  assert.match(senderPageSource, /referrer: "no-referrer"/);
  assert.doesNotMatch(senderPageSource, /senderName|recipientName|share_slug|openedAt/);
  assert.doesNotMatch(senderPageSource, /generateMetadata|params.*metadata/);
});

test("sender route and recipient UI do not import Supabase or expose token hash", () => {
  for (const source of [senderPageSource, kindReplySource, recipientActionSource, createFormSource]) {
    assert.doesNotMatch(source, /@supabase|Supabase/);
    assert.doesNotMatch(source, /senderTokenHash|hashSenderAccessToken/);
    assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
  }

  assert.match(inviteStoreSource, /senderTokenHash/);
  assert.match(supabaseStoreSource, /sender_token_hash/);
});

test("declined reply UI supports real send and legacy copy fallback", () => {
  assert.match(kindReplySource, /Want to leave a kind message/);
  assert.match(kindReplySource, /Send through WINK/);
  assert.match(kindReplySource, /Use this message/);
  assert.match(kindReplySource, /recipientMessageMaxLength/);
  assert.match(kindReplySource, /Optional message ideas/);
  assert.match(kindReplySource, /Copy message/);
  assert.match(kindReplySource, /This older invitation has no private sender link/);
  assert.match(recipientActionSource, /sendRecipientMessageAction/);
  assert.match(recipientActionSource, /sendRecipientMessage/);
});

test("private reply feature does not add external delivery or tracking", () => {
  const sourceText = [
    createActionSource,
    createFormSource,
    recipientShareSource,
    privateSenderCopySource,
    senderPageSource,
    kindReplySource,
    recipientActionSource,
    inviteStoreSource,
    supabaseStoreSource
  ].join("\n");

  assert.doesNotMatch(
    sourceText,
    /sendEmail|sendSms|WhatsApp|Instagram|webhook|pushNotification|notification provider/i
  );
  assert.doesNotMatch(
    sourceText,
    /sendBeacon|trackEvent|analytics|mixpanel|amplitude|readReceipt|messageRead/i
  );
  assert.doesNotMatch(sourceText, /openCount|senderPageOpenedAt|viewedAt/);
});

test("migration adds only intended private reply persistence fields", () => {
  assert.match(migrationSource, /sender_token_hash text/);
  assert.match(migrationSource, /recipient_message text/);
  assert.match(migrationSource, /recipient_message_sent_at timestamptz/);
  assert.match(migrationSource, /invites_sender_token_hash_idx/);
  assert.match(migrationSource, /char_length\(recipient_message\) <= 300/);
  assert.doesNotMatch(migrationSource, /sender_token text|sender_url|open_count|read_at|notification|analytics/i);
});

test("route inventory allows only the authorized sender route addition", () => {
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
  assert.equal(existsSync("app/dashboard"), false);
  assert.equal(existsSync("app/login"), false);
  assert.equal(existsSync("app/signup"), false);
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
