import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  formatInviteDateTime,
  parseInviteLocalDateTime
} from "../src/lib/invite-date-time";

const expectedSeparator = "\u00b7";

test("formatInviteDateTime formats standard local date and time values", () => {
  assert.equal(
    formatInviteDateTime("2026-06-17T03:19"),
    `Wednesday, June 17 ${expectedSeparator} 3:19 AM`
  );
  assert.equal(
    formatInviteDateTime("2026-06-17T19:30"),
    `Wednesday, June 17 ${expectedSeparator} 7:30 PM`
  );
  assert.equal(formatInviteDateTime("2026-06-17"), "Wednesday, June 17");
  assert.equal(
    formatInviteDateTime("  2026-06-17T03:19  "),
    `Wednesday, June 17 ${expectedSeparator} 3:19 AM`
  );
});

test("formatInviteDateTime formats time boundaries and minute values", () => {
  assert.equal(
    formatInviteDateTime("2026-06-17T00:00"),
    `Wednesday, June 17 ${expectedSeparator} 12:00 AM`
  );
  assert.equal(
    formatInviteDateTime("2026-06-17T12:00"),
    `Wednesday, June 17 ${expectedSeparator} 12:00 PM`
  );
  assert.equal(
    formatInviteDateTime("2026-06-17T09:05"),
    `Wednesday, June 17 ${expectedSeparator} 9:05 AM`
  );
  assert.equal(
    formatInviteDateTime("2026-06-17T23:00"),
    `Wednesday, June 17 ${expectedSeparator} 11:00 PM`
  );
  assert.equal(
    formatInviteDateTime("2026-06-17T20:45"),
    `Wednesday, June 17 ${expectedSeparator} 8:45 PM`
  );
});

test("formatInviteDateTime validates calendar dates without throwing", () => {
  assert.equal(formatInviteDateTime("2028-02-29"), "Tuesday, February 29");
  assert.equal(formatInviteDateTime("2026-02-29"), "2026-02-29");
  assert.equal(formatInviteDateTime("2026-13-17"), "2026-13-17");
  assert.equal(formatInviteDateTime("2026-06-32"), "2026-06-32");
  assert.equal(formatInviteDateTime("2026-02-30"), "2026-02-30");
});

test("formatInviteDateTime handles missing values", () => {
  assert.equal(formatInviteDateTime(undefined), null);
  assert.equal(formatInviteDateTime(null), null);
  assert.equal(formatInviteDateTime(""), null);
  assert.equal(formatInviteDateTime("   "), null);
});

test("formatInviteDateTime uses a safe malformed fallback", () => {
  assert.equal(formatInviteDateTime("not a date"), "not a date");
  assert.equal(formatInviteDateTime("2026-06-17T99:00"), "2026-06-17 at 99:00");
  assert.equal(formatInviteDateTime("2026-06-17T03:99"), "2026-06-17 at 03:99");
  assert.equal(formatInviteDateTime("2026/06/17T03:19"), "2026/06/17 at 03:19");
});

test("formatInviteDateTime preserves entered components without timezone shift", () => {
  for (let index = 0; index < 3; index += 1) {
    assert.equal(
      formatInviteDateTime("2026-06-17T03:19"),
      `Wednesday, June 17 ${expectedSeparator} 3:19 AM`
    );
  }

  assert.equal(
    formatInviteDateTime("2026-06-17T00:30"),
    `Wednesday, June 17 ${expectedSeparator} 12:30 AM`
  );
});

test("formatInviteDateTime output is deterministic", () => {
  assert.equal(
    formatInviteDateTime("2026-06-17T19:30"),
    formatInviteDateTime("2026-06-17T19:30")
  );
});

test("parseInviteLocalDateTime exposes validated local parts for calendar use", () => {
  assert.deepEqual(parseInviteLocalDateTime("2026-06-17T03:19"), {
    day: 17,
    hasTime: true,
    hour: 3,
    minute: 19,
    month: 6,
    year: 2026
  });
  assert.deepEqual(parseInviteLocalDateTime("2026-06-17"), {
    day: 17,
    hasTime: false,
    hour: null,
    minute: null,
    month: 6,
    year: 2026
  });
  assert.equal(parseInviteLocalDateTime("2026-02-30"), null);
  assert.equal(parseInviteLocalDateTime("not a date"), null);
  assert.equal(parseInviteLocalDateTime(undefined), null);
});

test("invite date-time formatter is pure and presentation-only", () => {
  const source = readFileSync("src/lib/invite-date-time.ts", "utf8");

  assert.doesNotMatch(source, /@supabase|Supabase/);
  assert.doesNotMatch(source, /inviteStore|InviteStore|InMemoryInviteStore/);
  assert.doesNotMatch(source, /from\s+["']react["']/);
  assert.doesNotMatch(source, /process\.env|getenv|fetch\(/);
  assert.doesNotMatch(source, /new Date\(rawValue\)|new Date\(value\)/);
});

test("invite date-time formatter is reused by invite presentation surfaces", () => {
  const lawyerSource = readFileSync("app/i/[slug]/lawyer-mode.tsx", "utf8");
  const recipientPageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");
  const revealEngineSource = readFileSync("src/lib/reveal-engine.ts", "utf8");

  assert.match(lawyerSource, /formatInviteDateTime\(invite\.dateDetails\.startsAt\)/);
  assert.match(
    recipientPageSource,
    /formatInviteDateTime\(invite\.dateDetails\.startsAt\)/
  );
  assert.match(
    revealEngineSource,
    /formatInviteDateTime\(invite\.dateDetails\.startsAt\)/
  );
  assert.doesNotMatch(lawyerSource, /function formatStartsAt/);
  assert.doesNotMatch(recipientPageSource, /function formatStartsAt/);
  assert.doesNotMatch(revealEngineSource, /function formatStartsAt/);
  assert.doesNotMatch(lawyerSource, /\.split\("T"\)/);
  assert.doesNotMatch(recipientPageSource, /\.split\("T"\)/);
  assert.doesNotMatch(revealEngineSource, /\.split\("T"\)/);
});
