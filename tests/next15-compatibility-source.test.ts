import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const createFormSource = readFileSync(
  "app/create/create-invite-form.tsx",
  "utf8"
);
const invitePageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");

test("create invite form uses React useActionState instead of ReactDOM useFormState", () => {
  assert.match(createFormSource, /useActionState/);
  assert.doesNotMatch(createFormSource, /useFormState/);
  assert.doesNotMatch(
    createFormSource,
    /import\s*{\s*useFormState[\s\S]*}\s*from\s*"react-dom"/
  );
});

test("invite page awaits Next.js 15 params and searchParams", () => {
  assert.match(invitePageSource, /params: Promise<{\s*slug: string;\s*}>/);
  assert.match(invitePageSource, /const resolvedParams = await params;/);
  assert.match(
    invitePageSource,
    /const resolvedSearchParams = await searchParams;/
  );
  assert.match(invitePageSource, /slug: resolvedParams\.slug/);
  assert.match(
    invitePageSource,
    /resolvedSearchParams\?\.previewMode/
  );
  assert.match(
    invitePageSource,
    /resolvedSearchParams\?\.signatureError/
  );
});

test("invite page no longer accesses dynamic route props synchronously", () => {
  assert.doesNotMatch(invitePageSource, /params\.slug/);
  assert.doesNotMatch(invitePageSource, /searchParams\?\.previewMode/);
  assert.doesNotMatch(invitePageSource, /searchParams\?\.signatureError/);
});
