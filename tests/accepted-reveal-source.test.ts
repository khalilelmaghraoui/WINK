import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const acceptedRevealSource = readFileSync(
  "app/i/[slug]/accepted-reveal.tsx",
  "utf8"
);
const recipientPageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");

test("AcceptedReveal is read-only presentation UI", () => {
  assert.doesNotMatch(acceptedRevealSource, /@supabase|Supabase/);
  assert.doesNotMatch(acceptedRevealSource, /inviteStore|InviteStore/);
  assert.doesNotMatch(acceptedRevealSource, /respondToInviteAction|flagUnknownSenderAction|recordNoTapAction/);
  assert.doesNotMatch(acceptedRevealSource, /fetch\(/);
  assert.doesNotMatch(acceptedRevealSource, /<form|type="submit"|name="response"/);
  assert.doesNotMatch(acceptedRevealSource, /process\.env/);
});

test("recipient page wires AcceptedReveal only to accepted state", () => {
  assert.match(
    recipientPageSource,
    /pageState === "accepted" \? getAcceptedRevealViewModel\(invite\) : null/
  );
  assert.match(recipientPageSource, /<AcceptedReveal reveal={acceptedReveal} \/>/);
  assert.match(recipientPageSource, /pageState !== "accepted"/);
  assert.match(recipientPageSource, /pageState !== "accepted" \? \(/);
  assert.match(
    recipientPageSource,
    /showInviteDetails &&\s+pageState !== "accepted"/
  );
});

test("recipient page uses the shared invite date-time formatter", () => {
  assert.match(
    recipientPageSource,
    /import \{ formatInviteDateTime \} from "@\/lib\/invite-date-time"/
  );
  assert.match(
    recipientPageSource,
    /formatInviteDateTime\(invite\.dateDetails\.startsAt\)/
  );
  assert.doesNotMatch(recipientPageSource, /function formatStartsAt/);
  assert.doesNotMatch(recipientPageSource, /\.split\("T"\)/);
});

test("accepted state hides pre-response mode framing and response mechanics", () => {
  assert.match(recipientPageSource, /pageState !== "accepted" \? \(/);
  assert.match(recipientPageSource, /shouldShowCompatibilityReport\(pageState\)/);
  assert.match(recipientPageSource, /showLawyerMode \? \(/);
  assert.match(recipientPageSource, /showUnbotheredMode \? \(/);
  assert.match(
    recipientPageSource,
    /pageState === "respondable" &&\s+!showLawyerMode &&\s+!showUnbotheredMode/
  );
  assert.doesNotMatch(acceptedRevealSource, /CompatibilityReport|LawyerMode|UnbotheredMode/);
  assert.doesNotMatch(acceptedRevealSource, /RaincheckPanel|ResponseActions|KindReplyAssistant/);
  assert.doesNotMatch(acceptedRevealSource, /I do not know this person/);
});

test("recipient page keeps non-accepted states separate", () => {
  assert.match(recipientPageSource, /pageState === "raincheck"/);
  assert.match(recipientPageSource, /<RaincheckState invite={invite} \/>/);
  assert.match(recipientPageSource, /shouldShowKindReplyAssistant\(pageState\)/);
  assert.match(recipientPageSource, /<KindReplyAssistant invite={invite} \/>/);
  assert.match(recipientPageSource, /<StateMessage pageState={pageState} \/>/);
  assert.match(recipientPageSource, /StateMessage\(\{/);
});

test("AcceptedReveal owns accepted heading hierarchy", () => {
  assert.match(acceptedRevealSource, /Accepted/);
  assert.match(acceptedRevealSource, /<h1[\s\S]*accepted-reveal-heading/);
  assert.doesNotMatch(acceptedRevealSource, /<h1[\s\S]*Accepted/);
  assert.match(acceptedRevealSource, /Invitation message/);
  assert.match(acceptedRevealSource, /When/);
  assert.match(acceptedRevealSource, /Place/);
  assert.match(acceptedRevealSource, /Note/);
  assert.match(
    acceptedRevealSource,
    /Revisit this private link whenever you need the plan\./
  );
});
