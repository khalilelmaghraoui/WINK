import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync("app/page.tsx", "utf8");
const layoutSource = readFileSync("app/layout.tsx", "utf8");
const prototypeSource = readFileSync(
  "components/prototype/nocturnal-postal-prototype.tsx",
  "utf8"
);
const pageExperienceSource = [pageSource, prototypeSource].join("\n");

test("root page renders the nocturnal postal prototype and primary create CTA", () => {
  assert.match(pageSource, /NocturnalPostalPrototype/);
  assert.match(pageExperienceSource, /Some questions deserve better than a text\./);
  assert.match(pageExperienceSource, /WINK turns/);
  assert.match(pageExperienceSource, /href="\/create"/);
  assert.match(pageExperienceSource, /Write yours/);
  assert.match(pageExperienceSource, /Prototype only/);
});

test("root prototype covers the recipient sender and response loop", () => {
  assert.match(pageExperienceSource, /Send one private recipient link/);
  assert.match(pageExperienceSource, /sender link stays copy-only/);
  assert.match(pageExperienceSource, /Yes, Raincheck, or No/);
  assert.match(pageExperienceSource, /KindReplySuggestions/);
  assert.match(pageExperienceSource, /Private post office receipt/);
});

test("root page keeps consent and refusal clear", () => {
  assert.match(pageExperienceSource, />No<\/SecondaryButton>/);
  assert.match(pageExperienceSource, /I don&apos;t know this person/);
  assert.match(pageExperienceSource, /No pressure/);
});

test("root page presents only the current MVP modes", () => {
  assert.match(pageExperienceSource, /Lawyer/);
  assert.match(pageExperienceSource, /Unbothered/);
  assert.doesNotMatch(pageExperienceSource, /CEO|Desperate|Scratch|Classic/);
});

test("root page does not add forbidden marketing or account concepts", () => {
  assert.doesNotMatch(pageExperienceSource, /login/i);
  assert.doesNotMatch(pageExperienceSource, /signup|sign up/i);
  assert.doesNotMatch(pageExperienceSource, /auth|authentication/i);
  assert.doesNotMatch(pageExperienceSource, /dashboard/i);
  assert.doesNotMatch(pageExperienceSource, /pricing/i);
  assert.doesNotMatch(pageExperienceSource, /testimonial|customer review|star rating/i);
  assert.doesNotMatch(pageExperienceSource, /waitlist|newsletter/i);
});

test("homepage files do not import storage providers or perform writes", () => {
  assert.doesNotMatch(pageExperienceSource, /@supabase|Supabase/i);
  assert.doesNotMatch(pageExperienceSource, /InviteStore|inviteStore/);
  assert.doesNotMatch(pageExperienceSource, /fetch\(|XMLHttpRequest|server action/i);
  assert.doesNotMatch(pageExperienceSource, /analytics|tracking|navigator\.sendBeacon/i);
});

test("static preview uses fictional data without bearer invite links", () => {
  assert.match(pageExperienceSource, /Maya/);
  assert.match(pageExperienceSource, /Alex/);
  assert.match(pageExperienceSource, /The Corner Cafe/);
  assert.match(pageExperienceSource, /wink\.example/);
  assert.match(pageExperienceSource, /Route \/i\/\[slug\]/);
  assert.match(pageExperienceSource, /Route \/s\/\[token\]/);
  assert.doesNotMatch(pageExperienceSource, /href="\/i\//);
  assert.doesNotMatch(pageExperienceSource, /href="\/s\//);
  assert.doesNotMatch(pageExperienceSource, /share_slug|redacted-production-alpha-slug/);
  assert.doesNotMatch(pageExperienceSource, /sender_token|senderToken|recipient_message/);
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
