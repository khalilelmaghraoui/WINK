import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  getInvitePageMetadata,
  invitePageGenericPreview
} from "../src/lib/invite-page";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};
const envExample = readFileSync(".env.example", "utf8");
const gitignore = readFileSync(".gitignore", "utf8");
const vercelDoc = readFileSync("docs/VERCEL_PREVIEW_DEPLOYMENT.md", "utf8");

test("deployment scripts are available for Vercel readiness", () => {
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.lint, "next lint");
  assert.equal(packageJson.scripts.typecheck, "tsc --noEmit");
  assert.match(packageJson.scripts.test, /node --test/);
});

test("local env files are ignored and examples do not expose service role publicly", () => {
  assert.match(gitignore, /^\.env\*\.local$/m);
  assert.match(gitignore, /^\.env\.local$/m);
  assert.match(envExample, /^NEXT_PUBLIC_SUPABASE_URL=$/m);
  assert.match(envExample, /^NEXT_PUBLIC_SUPABASE_ANON_KEY=$/m);
  assert.match(envExample, /^SUPABASE_SERVICE_ROLE_KEY=$/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
});

test("Vercel deployment guide includes required preview safety checks", () => {
  assert.match(vercelDoc, /npm run build/);
  assert.match(vercelDoc, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(vercelDoc, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(vercelDoc, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(vercelDoc, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(vercelDoc, /noindex,nofollow/);
  assert.match(vercelDoc, /You have a surprise waiting\./);
  assert.match(vercelDoc, /service-role key/);
});

test("invite metadata remains generic and noindex for preview deployment", () => {
  const metadata = getInvitePageMetadata();
  const metadataJson = JSON.stringify(metadata);

  assert.equal(metadata.description, invitePageGenericPreview);
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false
  });
  assert.equal(metadataJson.includes("sender"), false);
  assert.equal(metadataJson.includes("recipient"), false);
  assert.equal(metadataJson.includes("address"), false);
});
