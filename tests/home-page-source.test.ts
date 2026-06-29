import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync("app/page.tsx", "utf8");
const layoutSource = readFileSync("app/layout.tsx", "utf8");

test("root page includes WINK value proposition and primary create CTA", () => {
  assert.match(pageSource, /Make the ask unforgettable\./);
  assert.match(pageSource, /Create a playful invite link/);
  assert.match(pageSource, /private status link/);
  assert.match(pageSource, /href="\/create"/);
  assert.match(pageSource, /Create an invite/);
  assert.match(pageSource, /No account required/);
});

test("root page explains recipient link sender link and response loop", () => {
  assert.match(pageSource, /Send the recipient link/);
  assert.match(pageSource, /keep your private sender link/);
  assert.match(pageSource, /Yes, Raincheck, or No/);
  assert.match(pageSource, /one optional message/);
  assert.match(pageSource, /It does not send notifications yet/);
  assert.match(pageSource, /Alpha-stage, not user-validated yet/);
});

test("root page keeps consent and refusal clear", () => {
  assert.match(pageSource, /No stays easy\./);
  assert.match(pageSource, /Declining remains clear, simple, and complete/);
});

test("root page presents only the current MVP modes", () => {
  assert.match(pageSource, /Lawyer/);
  assert.match(pageSource, /Unbothered/);
  assert.doesNotMatch(pageSource, /CEO|Desperate|Scratch|Classic/);
});

test("root page does not add forbidden marketing or account concepts", () => {
  assert.doesNotMatch(pageSource, /login/i);
  assert.doesNotMatch(pageSource, /signup|sign up/i);
  assert.doesNotMatch(pageSource, /auth|authentication/i);
  assert.doesNotMatch(pageSource, /dashboard/i);
  assert.doesNotMatch(pageSource, /pricing/i);
  assert.doesNotMatch(pageSource, /testimonial|customer review|star rating/i);
  assert.doesNotMatch(pageSource, /waitlist|newsletter/i);
});

test("homepage files do not import storage providers or perform writes", () => {
  assert.doesNotMatch(pageSource, /@supabase|Supabase/i);
  assert.doesNotMatch(pageSource, /InviteStore|inviteStore/);
  assert.doesNotMatch(pageSource, /fetch\(|XMLHttpRequest|server action/i);
  assert.doesNotMatch(pageSource, /analytics|tracking|navigator\.sendBeacon/i);
});

test("static preview uses fictional data without bearer invite links", () => {
  assert.match(pageSource, /Sample invitation/);
  assert.match(pageSource, /Alex/);
  assert.match(pageSource, /Sam/);
  assert.match(pageSource, /A quiet coffee spot/);
  assert.match(pageSource, /Friday evening/);
  assert.match(pageSource, /Demo-only response choices/);
  assert.match(pageSource, /These are not live buttons/);
  assert.doesNotMatch(pageSource, /\/i\//);
  assert.doesNotMatch(pageSource, /\/s\//);
  assert.doesNotMatch(pageSource, /share_slug|redacted-production-alpha-slug/);
  assert.doesNotMatch(pageSource, /sender_token|senderToken|recipient_message/);
});

test("root page does not introduce new product routes", () => {
  assert.equal(existsSync("app/no"), false);
  assert.equal(existsSync("app/maybe"), false);
  assert.equal(existsSync("app/dashboard"), false);
  assert.equal(existsSync("app/login"), false);
  assert.equal(existsSync("app/signup"), false);
});

test("home metadata is public while invite metadata remains separately owned", () => {
  assert.match(layoutSource, /WINK - Make the ask unforgettable/);
  assert.match(
    layoutSource,
    /Create a playful private invite link, share it privately, and keep your own private status link\./
  );
  assert.doesNotMatch(
    layoutSource,
    /senderName|recipientName|share_slug|sender_token|recipient_message/
  );
});
