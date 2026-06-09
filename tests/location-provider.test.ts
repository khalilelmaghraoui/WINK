import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { getInviteLocationLink } from "../src/lib/invite-location";
import { GoogleMapsLocationProvider } from "../src/lib/providers/google-maps-location-provider";

const provider = new GoogleMapsLocationProvider();

test("Google Maps provider builds a query from place name and address", () => {
  const link = provider.createLocationLink({
    placeName: "The Corner Cafe",
    address: "12 Example Street"
  });

  assert.ok(link);
  assert.equal(
    decodeURIComponent(new URL(link.href).searchParams.get("query") ?? ""),
    "The Corner Cafe, 12 Example Street"
  );
  assert.equal(link.providerLabel, "Google Maps");
  assert.equal(link.accessibleLabel, "Open this place in Google Maps");
});

test("Google Maps provider supports name-only and address-only queries", () => {
  const nameOnly = provider.createLocationLink({
    placeName: "The Corner Cafe",
    address: null
  });
  const addressOnly = provider.createLocationLink({
    placeName: null,
    address: "12 Example Street"
  });

  assert.ok(nameOnly);
  assert.ok(addressOnly);
  assert.equal(
    decodeURIComponent(new URL(nameOnly.href).searchParams.get("query") ?? ""),
    "The Corner Cafe"
  );
  assert.equal(
    decodeURIComponent(
      new URL(addressOnly.href).searchParams.get("query") ?? ""
    ),
    "12 Example Street"
  );
});

test("Google Maps provider trims whitespace and omits empty values", () => {
  assert.deepEqual(
    provider.createLocationLink({
      placeName: "   ",
      address: "\n\t"
    }),
    null
  );

  const link = provider.createLocationLink({
    placeName: "  The   Corner\nCafe  ",
    address: "  12   Example\tStreet  "
  });

  assert.ok(link);
  assert.equal(
    decodeURIComponent(new URL(link.href).searchParams.get("query") ?? ""),
    "The Corner Cafe, 12 Example Street"
  );
});

test("Google Maps provider does not duplicate identical name and address", () => {
  const link = provider.createLocationLink({
    placeName: "The Corner Cafe",
    address: "the corner cafe"
  });

  assert.ok(link);
  assert.equal(
    decodeURIComponent(new URL(link.href).searchParams.get("query") ?? ""),
    "The Corner Cafe"
  );
});

test("Google Maps provider encodes special and international characters", () => {
  const link = provider.createLocationLink({
    placeName: "Cafe & Bar O'Clock",
    address: "Rue de l'Example, \u6771\u4eac"
  });

  assert.ok(link);
  assert.match(link.href, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.equal(
    decodeURIComponent(new URL(link.href).searchParams.get("query") ?? ""),
    "Cafe & Bar O'Clock, Rue de l'Example, \u6771\u4eac"
  );
});

test("Google Maps provider URL has no API key or tracking parameters", () => {
  const link = provider.createLocationLink({
    placeName: "The Corner Cafe",
    address: "12 Example Street"
  });

  assert.ok(link);

  const url = new URL(link.href);

  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "www.google.com");
  assert.equal(url.pathname, "/maps/search/");
  assert.equal(url.searchParams.get("api"), "1");
  assert.ok(url.searchParams.get("query"));
  assert.equal(url.searchParams.has("key"), false);
  assert.equal(url.searchParams.has("utm_source"), false);
  assert.equal(url.searchParams.has("utm_medium"), false);
  assert.equal(url.searchParams.has("utm_campaign"), false);
  assert.doesNotMatch(link.href, /\/i\/|abc123xy|invite|slug|Alex|Sam|small case/);
});

test("Google Maps provider output is deterministic", () => {
  const input = {
    placeName: "The Corner Cafe",
    address: "12 Example Street"
  };

  assert.deepEqual(
    provider.createLocationLink(input),
    provider.createLocationLink(input)
  );
});

test("invite location helper uses a supplied provider without storage or network logic", () => {
  const link = getInviteLocationLink(
    {
      name: "The Corner Cafe",
      address: "12 Example Street"
    },
    provider
  );

  assert.ok(link);
  assert.equal(
    decodeURIComponent(new URL(link.href).searchParams.get("query") ?? ""),
    "The Corner Cafe, 12 Example Street"
  );
});

test("location provider files preserve architecture boundaries", () => {
  for (const sourcePath of [
    "src/lib/providers/location-provider.ts",
    "src/lib/providers/google-maps-location-provider.ts",
    "src/lib/invite-location.ts"
  ]) {
    const source = readFileSync(sourcePath, "utf8");

    assert.doesNotMatch(source, /from\s+["']react["']/);
    assert.doesNotMatch(source, /@supabase|Supabase/);
    assert.doesNotMatch(source, /inviteStore|InviteStore|InMemoryInviteStore/);
    assert.doesNotMatch(source, /process\.env|getenv/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /geolocation|getCurrentPosition|watchPosition/);
    assert.doesNotMatch(source, /server action|respondToInviteAction/);
  }
});
