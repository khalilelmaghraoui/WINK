import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const acceptedRevealSource = readFileSync(
  "app/i/[slug]/accepted-reveal.tsx",
  "utf8"
);
const acceptedPlanActionsSource = readFileSync(
  "app/i/[slug]/accepted-plan-actions.tsx",
  "utf8"
);
const addToCalendarSource = readFileSync(
  "app/i/[slug]/add-to-calendar.tsx",
  "utf8"
);
const openInMapsSource = readFileSync("app/i/[slug]/open-in-maps.tsx", "utf8");

test("accepted reveal uses natural place presentation without database labels", () => {
  assert.match(acceptedRevealSource, /<PlaceDetails/);
  assert.match(acceptedRevealSource, /name={reveal\.placeName}/);
  assert.match(acceptedRevealSource, /address={reveal\.placeAddress}/);
  assert.doesNotMatch(acceptedRevealSource, /label="Name"|label="Address"/);
  assert.doesNotMatch(acceptedRevealSource, />Name<\/dt>|>Address<\/dt>|Not provided/);
});

test("accepted reveal avoids nested cards for place note and action sections", () => {
  assert.match(acceptedRevealSource, /border-t border-wink-border pt-5/);
  assert.doesNotMatch(
    acceptedRevealSource,
    /accepted-reveal-place[\s\S]*rounded-md border border-wink-border bg-wink-background p-4/
  );
  assert.doesNotMatch(
    acceptedRevealSource,
    /accepted-reveal-note[\s\S]*rounded-md border border-wink-border bg-wink-background p-4/
  );
  assert.doesNotMatch(acceptedPlanActionsSource, /rounded-md border border-wink-border bg-wink-background p-4/);
});

test("plan actions compose existing calendar and maps actions only when present", () => {
  assert.match(acceptedPlanActionsSource, /Plan actions/);
  assert.match(acceptedPlanActionsSource, /if \(!calendar && !locationLink\)/);
  assert.match(acceptedPlanActionsSource, /return null/);
  assert.match(acceptedPlanActionsSource, /calendar \? <AddToCalendar calendar={calendar} \/> : null/);
  assert.match(acceptedPlanActionsSource, /locationLink \? <OpenInMaps locationLink={locationLink} \/> : null/);
  assert.match(acceptedPlanActionsSource, /md:grid-cols-2/);
});

test("plan actions preserve read-only presentation boundaries", () => {
  for (const source of [
    acceptedRevealSource,
    acceptedPlanActionsSource,
    addToCalendarSource,
    openInMapsSource
  ]) {
    assert.doesNotMatch(source, /@supabase|Supabase/);
    assert.doesNotMatch(source, /InviteStore|inviteStore/);
    assert.doesNotMatch(source, /respondToInviteAction|flagUnknownSenderAction|recordNoTapAction/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /sendBeacon|trackEvent|analytics|mixpanel|amplitude/i);
    assert.doesNotMatch(source, /slug|senderName|recipientName/);
  }
});

test("plan actions do not move provider or ICS generation into presentation grouping", () => {
  assert.doesNotMatch(acceptedPlanActionsSource, /serializeCalendarEventToIcs|BEGIN:VCALENDAR|createCalendarEventData/);
  assert.doesNotMatch(acceptedPlanActionsSource, /GoogleMapsLocationProvider|maps\/search|google\.com/);
  assert.doesNotMatch(acceptedRevealSource, /serializeCalendarEventToIcs|BEGIN:VCALENDAR|GoogleMapsLocationProvider|maps\/search|google\.com/);
});

test("consolidated action copy and accessibility stay explicit", () => {
  assert.match(addToCalendarSource, /Downloads a private \.ics file with the plan shown above\./);
  assert.match(addToCalendarSource, /role="status"/);
  assert.match(addToCalendarSource, /aria-live="polite"/);
  assert.match(openInMapsSource, /Open in \{locationLink\.providerLabel\}/);
  assert.match(openInMapsSource, /aria-hidden="true"/);
  assert.match(openInMapsSource, /Shares this place with/);
  assert.match(openInMapsSource, /target="_blank"/);
  assert.match(openInMapsSource, /rel="noopener noreferrer"/);
  assert.match(openInMapsSource, /referrerPolicy="no-referrer"/);
});
