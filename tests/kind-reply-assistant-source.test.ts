import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync("app/i/[slug]/kind-reply-assistant.tsx", "utf8");

test("kind reply assistant has copy and manual fallback behavior", () => {
  assert.match(source, /navigator\.clipboard\?\.writeText/);
  assert.match(source, /Copied ✓/);
  assert.match(source, /setTimeout/);
  assert.match(source, /readOnly/);
  assert.match(source, /Hide suggestions/);
});

test("each static reply option has a copy button", () => {
  assert.match(source, /kindReplyOptions\.map/);
  assert.match(source, /Copy kind reply option/);
  assert.match(source, /Copy reply/);
});

test("kind reply assistant does not write to storage or notify sender", () => {
  assert.doesNotMatch(source, /InviteStore|inviteStore|respondToInviteAction/);
  assert.doesNotMatch(source, /notification|notify|sendEmail|sendSms/i);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|Anthropic|Claude|AIProvider/);
});
