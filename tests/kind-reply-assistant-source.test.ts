import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync("app/i/[slug]/kind-reply-assistant.tsx", "utf8");

test("kind reply assistant supports real send and legacy copy fallback", () => {
  assert.match(source, /sendRecipientMessageAction/);
  assert.match(source, /Want to leave a kind message/);
  assert.match(source, /Send through WINK/);
  assert.match(source, /Use this message/);
  assert.match(source, /You do not owe anyone an explanation/);
  assert.match(source, /WINK does not send a notification/);
  assert.match(source, /Optional message ideas/);
  assert.match(source, /navigator\.clipboard\?\.writeText/);
  assert.match(source, /Copied/);
  assert.match(source, /setTimeout/);
  assert.match(source, /readOnly/);
  assert.match(source, /Hide suggestions/);
});

test("each static reply option can populate the composer or legacy copy surface", () => {
  assert.match(source, /kindReplyOptions\.map/);
  assert.match(source, /Use kind message option/);
  assert.match(source, /Copy kind reply option/);
  assert.match(source, /Copy message/);
});

test("kind reply assistant does not import storage, fetch, or notify sender", () => {
  assert.doesNotMatch(source, /InviteStore|inviteStore|respondToInviteAction/);
  assert.doesNotMatch(
    source,
    /Notification\(|pushNotification|sendNotification|notifySender|sendEmail|sendSms/i
  );
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|Anthropic|Claude|AIProvider/);
  assert.doesNotMatch(source, /senderAccessToken|senderTokenHash/);
});
