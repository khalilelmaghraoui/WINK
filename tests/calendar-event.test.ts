import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  createCalendarEventData,
  serializeCalendarEventToIcs
} from "../src/lib/calendar-event";

const generatedAt = new Date("2026-06-09T12:34:56.000Z");

test("calendar utility serializes a floating timed event", () => {
  const event = createCalendarEventData({
    dateTypeLabel: "Date",
    placeAddress: "12 Example Street",
    placeName: "The Corner Cafe",
    startsAt: "2026-06-17T03:19"
  });

  assert.ok(event);

  const ics = serializeCalendarEventToIcs(event, {
    generatedAt,
    uid: "wink-test-uid"
  });

  assert.match(ics, /DTSTART:20260617T031900\r\n/);
  assert.doesNotMatch(ics, /DTSTART:20260617T031900Z/);
  assert.doesNotMatch(ics, /TZID/);
  assert.doesNotMatch(ics, /20260616|20260618|T021900|T041900/);
});

test("calendar utility serializes a date-only event as all day", () => {
  const event = createCalendarEventData({
    dateTypeLabel: "Apology",
    placeAddress: null,
    placeName: null,
    startsAt: "2026-06-17"
  });

  assert.ok(event);

  const ics = serializeCalendarEventToIcs(event, {
    generatedAt,
    uid: "wink-test-uid"
  });

  assert.match(ics, /DTSTART;VALUE=DATE:20260617\r\n/);
  assert.doesNotMatch(ics, /DTEND|DURATION|VALARM|TZID/);
});

test("calendar utility emits required ICS structure", () => {
  const event = createCalendarEventData({
    dateTypeLabel: "Romantic moment",
    placeAddress: "12 Example Street",
    placeName: "The Corner Cafe",
    startsAt: "2026-06-17T19:30"
  });

  assert.ok(event);

  const ics = serializeCalendarEventToIcs(event, {
    generatedAt,
    uid: "wink-test-uid"
  });

  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.match(ics, /VERSION:2\.0\r\n/);
  assert.match(ics, /PRODID:-\/\/WINK\/\/Private Invitation\/\/EN\r\n/);
  assert.match(ics, /CALSCALE:GREGORIAN\r\n/);
  assert.match(ics, /BEGIN:VEVENT\r\n/);
  assert.match(ics, /UID:wink-test-uid\r\n/);
  assert.match(ics, /DTSTAMP:20260609T123456Z\r\n/);
  assert.match(ics, /DTSTART:20260617T193000\r\n/);
  assert.match(ics, /SUMMARY:WINK — Romantic moment\r\n/);
  assert.match(ics, /END:VEVENT\r\n/);
});

test("calendar utility includes optional location and description only when present", () => {
  const eventWithLocation = createCalendarEventData({
    dateTypeLabel: "Date",
    placeAddress: "12 Example Street",
    placeName: "The Corner Cafe",
    startsAt: "2026-06-17T03:19"
  });
  const eventWithoutLocation = createCalendarEventData({
    dateTypeLabel: "Date",
    placeAddress: null,
    placeName: null,
    startsAt: "2026-06-17T03:19"
  });

  assert.ok(eventWithLocation);
  assert.ok(eventWithoutLocation);

  const withLocation = serializeCalendarEventToIcs(eventWithLocation, {
    generatedAt,
    uid: "wink-test-uid"
  });
  const withoutLocation = serializeCalendarEventToIcs(eventWithoutLocation, {
    generatedAt,
    uid: "wink-test-uid"
  });

  assert.match(withLocation, /LOCATION:The Corner Cafe\\, 12 Example Street\r\n/);
  assert.match(
    withLocation,
    /DESCRIPTION:Saved from a private WINK invitation\.\r\n/
  );
  assert.doesNotMatch(withoutLocation, /LOCATION:/);
  assert.match(
    withoutLocation,
    /DESCRIPTION:Saved from a private WINK invitation\.\r\n/
  );
});

test("calendar utility escapes ICS text fields", () => {
  const ics = serializeCalendarEventToIcs(
    {
      description: "Line one\nLine two",
      location: "Cafe, Hall; Back\\Room",
      startsAt: {
        day: 17,
        hasTime: true,
        hour: 3,
        minute: 19,
        month: 6,
        year: 2026
      },
      title: "WINK — Coffee, tea; maybe\\yes"
    },
    {
      generatedAt,
      uid: "uid,with;chars\\"
    }
  );

  assert.match(ics, /UID:uid\\,with\\;chars\\\\\r\n/);
  assert.match(ics, /SUMMARY:WINK — Coffee\\, tea\\; maybe\\\\yes\r\n/);
  assert.match(ics, /LOCATION:Cafe\\, Hall\\; Back\\\\Room\r\n/);
  assert.match(ics, /DESCRIPTION:Line one\\nLine two\r\n/);
});

test("calendar utility rejects unsafe invalid starts without crashing", () => {
  for (const startsAt of [
    "2026-13-17",
    "2026-06-32",
    "2026-02-29",
    "not a date",
    "",
    "   ",
    null,
    undefined
  ]) {
    assert.equal(
      createCalendarEventData({
        dateTypeLabel: "Date",
        placeAddress: null,
        placeName: null,
        startsAt
      }),
      null
    );
  }
});

test("calendar utility keeps private invite data out of generated ICS", () => {
  const event = createCalendarEventData({
    dateTypeLabel: "Surprise",
    placeAddress: "12 Example Street",
    placeName: "The Corner Cafe",
    startsAt: "2026-06-17T03:19"
  });

  assert.ok(event);

  const ics = serializeCalendarEventToIcs(event, {
    generatedAt,
    uid: "calendar-uid-without-slug"
  });

  assert.doesNotMatch(ics, /abc123xy|\/i\/|https?:\/\//);
  assert.doesNotMatch(ics, /Alex|Sam/);
  assert.doesNotMatch(ics, /small case|coffee this Friday/);
  assert.doesNotMatch(ics, /SUPABASE_SERVICE_ROLE_KEY|supabase\.co/);
});

test("calendar utility is deterministic with fixed uid and timestamp", () => {
  const event = createCalendarEventData({
    dateTypeLabel: "Date",
    placeAddress: "12 Example Street",
    placeName: "The Corner Cafe",
    startsAt: "2026-06-17T03:19"
  });

  assert.ok(event);

  assert.equal(
    serializeCalendarEventToIcs(event, {
      generatedAt,
      uid: "wink-test-uid"
    }),
    serializeCalendarEventToIcs(event, {
      generatedAt,
      uid: "wink-test-uid"
    })
  );
});

test("calendar utility is pure and provider independent", () => {
  const source = readFileSync("src/lib/calendar-event.ts", "utf8");

  assert.doesNotMatch(source, /@supabase|Supabase/);
  assert.doesNotMatch(source, /inviteStore|InviteStore|InMemoryInviteStore/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /process\.env|getenv|fetch\(/);
  assert.doesNotMatch(source, /Google|Apple|Outlook|Microsoft|Graph|OAuth/);
});
