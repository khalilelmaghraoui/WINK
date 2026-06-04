import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const panelSource = readFileSync("app/i/[slug]/raincheck-panel.tsx", "utf8");
const pageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");
const lawyerSource = readFileSync("app/i/[slug]/lawyer-mode.tsx", "utf8");
const unbotheredSource = readFileSync(
  "app/i/[slug]/unbothered-mode.tsx",
  "utf8"
);

test("raincheck panel contains required copy and controls", () => {
  assert.match(panelSource, /Bad timing\?/);
  assert.match(
    panelSource,
    /No pressure\. Want to suggest something that works better\?/
  );
  assert.match(panelSource, /raincheckQuickOptions\.map/);
  assert.match(panelSource, /Want to add a note\?/);
  assert.match(panelSource, /Maybe next week\? Or somewhere more chill\?/);
  assert.match(panelSource, /characters remaining/);
  assert.match(panelSource, /Suggested day/);
});

test("raincheck panel submits through existing response flow", () => {
  assert.match(panelSource, /respondToInviteAction/);
  assert.match(panelSource, /name="response" type="hidden" value="raincheck"/);
  assert.match(panelSource, /name="raincheckOption"/);
  assert.match(panelSource, /name="counterOfferMessage"/);
  assert.match(panelSource, /name="suggestedDate"/);
  assert.match(panelSource, /Preview mode blocked saving that raincheck/);
});

test("raincheck panel is used by generic lawyer and unbothered paths", () => {
  assert.match(pageSource, /<RaincheckPanel/);
  assert.match(lawyerSource, /<RaincheckPanel/);
  assert.match(unbotheredSource, /<RaincheckPanel/);
});

test("raincheck state is isolated from declined helper UI", () => {
  assert.match(pageSource, /<RaincheckState invite={invite} \/>/);
  assert.match(pageSource, /pageState === "raincheck"/);
  assert.match(pageSource, /shouldShowKindReplyAssistant\(pageState\)/);
});
