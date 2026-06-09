import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const openInMapsSource = readFileSync("app/i/[slug]/open-in-maps.tsx", "utf8");
const acceptedRevealSource = readFileSync(
  "app/i/[slug]/accepted-reveal.tsx",
  "utf8"
);
const acceptedPlanActionsSource = readFileSync(
  "app/i/[slug]/accepted-plan-actions.tsx",
  "utf8"
);
const recipientPageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");
const providerSource = readFileSync(
  "src/lib/providers/google-maps-location-provider.ts",
  "utf8"
);

test("OpenInMaps is rendered only through AcceptedReveal", () => {
  assert.match(
    acceptedRevealSource,
    /<AcceptedPlanActions[\s\S]*locationLink={locationLink}/
  );
  assert.match(
    acceptedPlanActionsSource,
    /<OpenInMaps locationLink={locationLink} \/>/
  );
  assert.match(acceptedPlanActionsSource, /locationLink \?/);

  for (const filePath of [
    "app/i/[slug]/lawyer-mode.tsx",
    "app/i/[slug]/unbothered-mode.tsx",
    "app/i/[slug]/raincheck-state.tsx",
    "app/i/[slug]/kind-reply-assistant.tsx",
    "app/i/[slug]/compatibility-report.tsx",
    "app/i/[slug]/add-to-calendar.tsx"
  ]) {
    assert.doesNotMatch(readFileSync(filePath, "utf8"), /OpenInMaps/);
  }
});

test("accepted page composition supplies a provider-neutral location link", () => {
  assert.match(
    recipientPageSource,
    /getInviteLocationLink\(\s*invite\.placeDetails,\s*createGoogleMapsLocationProvider\(\)\s*\)/
  );
  assert.match(
    recipientPageSource,
    /<AcceptedReveal locationLink={locationLink} reveal={acceptedReveal} \/>/
  );
  assert.doesNotMatch(openInMapsSource, /GoogleMapsLocationProvider|maps\/search/);
});

test("OpenInMaps uses safe external-link attributes", () => {
  assert.match(openInMapsSource, /target="_blank"/);
  assert.match(openInMapsSource, /rel="noopener noreferrer"/);
  assert.match(openInMapsSource, /referrerPolicy="no-referrer"/);
  assert.match(openInMapsSource, /Open in \{locationLink\.providerLabel\}/);
  assert.match(openInMapsSource, /opens in a new tab/);
  assert.match(openInMapsSource, /aria-hidden="true"/);
});

test("OpenInMaps has no trackers, SDKs, geolocation, or network calls", () => {
  for (const source of [openInMapsSource, acceptedRevealSource, acceptedPlanActionsSource]) {
    assert.doesNotMatch(source, /onClick|sendBeacon|trackEvent|analytics|mixpanel|amplitude/i);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /geolocation|getCurrentPosition|watchPosition/);
    assert.doesNotMatch(source, /localStorage|document\.cookie/);
    assert.doesNotMatch(source, /Mapbox|GoogleMaps|maps SDK|Apple Maps API|apiKey|API_KEY/);
    assert.doesNotMatch(source, /@supabase|Supabase|InviteStore|inviteStore/);
    assert.doesNotMatch(source, /respondToInviteAction|flagUnknownSenderAction|recordNoTapAction/);
  }
});

test("raw Google Maps URL appears only inside the provider implementation", () => {
  assert.match(providerSource, /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);

  const sourceFiles = listFiles("app")
    .concat(listFiles("src/lib"))
    .filter((file) => file.replaceAll("\\", "/") !== "src/lib/providers/google-maps-location-provider.ts");

  for (const file of sourceFiles) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /https:\/\/www\.google\.com\/maps\/search|maps\/search\/\?api=1/
    );
  }
});

test("OpenInMaps receives no slug, identity, private message, or full Invite", () => {
  assert.doesNotMatch(openInMapsSource, /slug|senderName|recipientName|message|Invite\b/);
  assert.doesNotMatch(
    acceptedRevealSource,
    /<OpenInMaps[\s\S]*(slug|senderName|recipientName|message|invite=)/
  );
});

test("maps action does not introduce a new product route", () => {
  const routeFiles = listFiles("app").filter((file) =>
    /[/\\](page|route)\.tsx?$/.test(file)
  );

  assert.deepEqual(
    routeFiles
      .map((file) => file.replaceAll("\\", "/"))
      .sort(),
    [
      "app/create/page.tsx",
      "app/i/[slug]/page.tsx",
      "app/page.tsx"
    ].sort()
  );
});

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
