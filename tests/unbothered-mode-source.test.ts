import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync("app/i/[slug]/unbothered-mode.tsx", "utf8");

test("slot trigger is not a submit control", () => {
  assert.match(source, /Let fate decide 🎰/);
  assert.match(source, /onClick={handleFateClick}/);
  assert.match(source, /type="button"/);
});

test("final slot confirmation is the yes submit path", () => {
  assert.match(source, /unbotheredSlotConfirmationLabel/);
  assert.match(source, /aria-label="Accept the rigged verdict and answer yes"/);
  assert.match(source, /<input name="response" type="hidden" value="yes" \/>/);
});

test("raincheck and no remain outside the slot panel path", () => {
  const slotPanelIndex = source.indexOf("function SlotPanel");
  const raincheckIndex = source.indexOf('label="Maybe another day"');
  const noIndex = source.indexOf('aria-label="Answer no to this invitation"');

  assert.ok(slotPanelIndex > 0);
  assert.ok(raincheckIndex > 0 && raincheckIndex < slotPanelIndex);
  assert.ok(noIndex > 0 && noIndex < slotPanelIndex);
  assert.equal(source.includes('disabled={'), false);
});
