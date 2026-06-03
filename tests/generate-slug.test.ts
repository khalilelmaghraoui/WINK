import assert from "node:assert/strict";
import { test } from "node:test";

import { generateSlug } from "../src/lib/generate-slug";

test("generateSlug creates an 8 to 10 character URL-safe slug", () => {
  const slug = generateSlug(8);

  assert.equal(slug.length, 8);
  assert.match(slug, /^[A-Za-z2-9]+$/);
});

test("generateSlug excludes ambiguous characters", () => {
  for (let index = 0; index < 200; index += 1) {
    const slug = generateSlug(10);

    assert.doesNotMatch(slug, /[0O1l]/);
  }
});

test("generateSlug rejects unsupported lengths", () => {
  assert.throws(() => generateSlug(7));
  assert.throws(() => generateSlug(11));
});
