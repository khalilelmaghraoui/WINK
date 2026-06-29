import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const addToCalendarSource = readFileSync(
  "app/i/[slug]/add-to-calendar.tsx",
  "utf8"
);
const acceptedRevealSource = readFileSync(
  "app/i/[slug]/accepted-reveal.tsx",
  "utf8"
);
const acceptedPlanActionsSource = readFileSync(
  "app/i/[slug]/accepted-plan-actions.tsx",
  "utf8"
);
const revealEngineSource = readFileSync("src/lib/reveal-engine.ts", "utf8");
const calendarSource = readFileSync("src/lib/calendar-event.ts", "utf8");

test("calendar action is wired only through AcceptedReveal", () => {
  assert.match(acceptedRevealSource, /<AcceptedPlanActions/);
  assert.match(
    acceptedPlanActionsSource,
    /<AddToCalendar calendar={calendar} \/>/
  );
  assert.match(acceptedPlanActionsSource, /calendar \?/);
  assert.doesNotMatch(readFileSync("app/i/[slug]/lawyer-mode.tsx", "utf8"), /AddToCalendar/);
  assert.doesNotMatch(readFileSync("app/i/[slug]/unbothered-mode.tsx", "utf8"), /AddToCalendar/);
  assert.doesNotMatch(readFileSync("app/i/[slug]/raincheck-state.tsx", "utf8"), /AddToCalendar/);
  assert.doesNotMatch(readFileSync("app/i/[slug]/kind-reply-assistant.tsx", "utf8"), /AddToCalendar/);
});

test("calendar action receives only calendar-safe reveal props", () => {
  const calendarInterface = getRequiredMatch(
    revealEngineSource,
    /export interface AcceptedRevealCalendarData \{[\s\S]*?\n\}/
  );
  const calendarReturn = getRequiredMatch(
    revealEngineSource,
    /return \{\s+dateTypeLabel,[\s\S]*?startsAt: cleanedStartsAt[\s\S]*?\};/
  );

  assert.match(revealEngineSource, /calendar: AcceptedRevealCalendarData \| null/);
  assert.match(calendarInterface, /dateTypeLabel/);
  assert.match(calendarInterface, /startsAt/);
  assert.match(calendarInterface, /placeName/);
  assert.match(calendarInterface, /placeAddress/);
  assert.doesNotMatch(calendarInterface, /slug|id|senderName|recipientName|message/);
  assert.doesNotMatch(calendarReturn, /slug|id|senderName|recipientName|message/);
  assert.doesNotMatch(addToCalendarSource, /slug|senderName|recipientName|InviteStore|inviteStore/);
});

test("calendar action and utility do not import providers or perform network writes", () => {
  for (const source of [addToCalendarSource, calendarSource, acceptedPlanActionsSource]) {
    assert.doesNotMatch(source, /@supabase|Supabase/);
    assert.doesNotMatch(source, /InviteStore|inviteStore/);
    assert.doesNotMatch(source, /respondToInviteAction|flagUnknownSenderAction|recordNoTapAction/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /localStorage|document\.cookie|navigator\.sendBeacon/);
    assert.doesNotMatch(source, /google\.com\/calendar|Google Calendar|Apple Calendar|Outlook|Microsoft Graph/);
    assert.doesNotMatch(source, /process\.env|getenv/);
  }
  assert.doesNotMatch(calendarSource, /from\s+["']react["']/);
});

test("calendar action uses browser download primitives without provider popups", () => {
  assert.match(addToCalendarSource, /new Blob/);
  assert.match(addToCalendarSource, /text\/calendar;charset=utf-8/);
  assert.match(addToCalendarSource, /URL\.createObjectURL/);
  assert.match(addToCalendarSource, /wink-invitation\.ics/);
  assert.match(addToCalendarSource, /role="status"/);
  assert.match(addToCalendarSource, /aria-live="polite"/);
  assert.doesNotMatch(addToCalendarSource, /window\.open|iframe|clipboard/);
});

test("calendar action does not introduce a new product route", () => {
  const appFiles = listFiles("app");
  const routeFiles = appFiles.filter((file) => /[/\\](page|route)\.tsx?$/.test(file));

  assert.deepEqual(
    routeFiles
      .map((file) => file.replaceAll("\\", "/"))
      .sort(),
    [
      "app/create/page.tsx",
      "app/i/[slug]/page.tsx",
      "app/page.tsx",
      "app/s/[token]/page.tsx"
    ].sort()
  );
});

function getRequiredMatch(source: string, pattern: RegExp): string {
  const match = pattern.exec(source);

  assert.ok(match);

  return match[0];
}

function listFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);

    if (statSync(fullPath).isDirectory()) {
      return listFiles(fullPath);
    }

    return fullPath;
  });
}
