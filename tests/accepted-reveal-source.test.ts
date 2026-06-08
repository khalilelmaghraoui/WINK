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
  assert.match(
    recipientPageSource,
    /showInviteDetails &&\s+pageState !== "accepted"/
  );
});

test("recipient page keeps non-accepted states separate", () => {
  assert.match(recipientPageSource, /pageState === "raincheck"/);
  assert.match(recipientPageSource, /<RaincheckState invite={invite} \/>/);
  assert.match(recipientPageSource, /shouldShowKindReplyAssistant\(pageState\)/);
  assert.match(recipientPageSource, /<KindReplyAssistant invite={invite} \/>/);
  assert.match(recipientPageSource, /<StateMessage pageState={pageState} \/>/);
});
