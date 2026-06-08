import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync("app/page.tsx", "utf8");
const layoutSource = readFileSync("app/layout.tsx", "utf8");

test("root page includes WINK value proposition and primary create CTA", () => {
  assert.match(pageSource, /Make the ask memorable\./);
  assert.match(pageSource, /Turn an awkward message into a playful private invitation/);
  assert.match(pageSource, /href="\/create"/);
  assert.match(pageSource, /Create an invitation/);
  assert.match(pageSource, /Create your invitation/);
});

test("root page presents only the current MVP modes", () => {
  assert.match(pageSource, /Lawyer/);
  assert.match(pageSource, /Unbothered/);
  assert.doesNotMatch(pageSource, /CEO|Desperate|Scratch|Classic/);
});

test("root page does not add forbidden marketing or account concepts", () => {
  assert.doesNotMatch(pageSource, /login/i);
  assert.doesNotMatch(pageSource, /signup|sign up/i);
  assert.doesNotMatch(pageSource, /dashboard/i);
  assert.doesNotMatch(pageSource, /pricing/i);
  assert.doesNotMatch(pageSource, /testimonial|customer review|star rating/i);
  assert.doesNotMatch(pageSource, /waitlist|newsletter/i);
});

test("homepage files do not import storage providers or perform writes", () => {
  assert.doesNotMatch(pageSource, /@supabase|Supabase/i);
  assert.doesNotMatch(pageSource, /InviteStore|inviteStore/);
  assert.doesNotMatch(pageSource, /fetch\(|XMLHttpRequest|server action/i);
});

test("static preview uses fictional data without bearer invite links", () => {
  assert.match(pageSource, /Sample invitation/);
  assert.match(pageSource, /Alex/);
  assert.match(pageSource, /Sam/);
  assert.match(pageSource, /The Corner Cafe/);
  assert.match(pageSource, /Friday - 7:00 PM/);
  assert.doesNotMatch(pageSource, /\/i\//);
  assert.doesNotMatch(pageSource, /share_slug|redacted-production-alpha-slug/);
});

test("root page does not introduce new product routes", () => {
  assert.equal(existsSync("app/no"), false);
  assert.equal(existsSync("app/maybe"), false);
  assert.equal(existsSync("app/dashboard"), false);
  assert.equal(existsSync("app/login"), false);
  assert.equal(existsSync("app/signup"), false);
});

test("home metadata is public while invite metadata remains separately owned", () => {
  assert.match(layoutSource, /WINK - Make the ask memorable/);
  assert.match(
    layoutSource,
    /Create a playful private invitation link for a date, apology, surprise, or romantic moment\./
  );
  assert.doesNotMatch(layoutSource, /senderName|recipientName|share_slug/);
});
