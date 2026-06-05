import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";
import { test } from "node:test";

const sourceRoots = ["app", "src"];
const sourceFiles = readSourceFiles(sourceRoots);
const sourceText = sourceFiles.map((file) => file.text).join("\n");
const appFiles = sourceFiles.filter((file) => isUnderDirectory(file, "app"));
const appText = appFiles.map((file) => file.text).join("\n");
const recipientPageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");
const envExampleSource = readFileSync(".env.example", "utf8");
const unbotheredSource = readFileSync(
  "app/i/[slug]/unbothered-mode.tsx",
  "utf8"
);
const kindReplySource = readFileSync(
  "app/i/[slug]/kind-reply-assistant.tsx",
  "utf8"
);

test("Act I does not add response-only routes", () => {
  assert.equal(existsSync("app/no"), false);
  assert.equal(existsSync("app/maybe"), false);
});

test("Act I source does not contain forbidden open or tracking fields", () => {
  assert.doesNotMatch(sourceText, /openCount/);
  assert.doesNotMatch(
    sourceText,
    /navigator\.geolocation|sendBeacon|analytics|trackEvent|mixpanel|amplitude/i
  );
  assert.doesNotMatch(sourceText, /cursorPath|dwellTime|deviceFingerprint/i);
});

test("feature UI does not import Supabase or future AI SDKs directly", () => {
  const supabaseImportFiles = sourceFiles
    .filter((file) => /@supabase/.test(file.text))
    .map((file) => file.normalizedPath);
  const appSupabaseImportFiles = appFiles
    .filter((file) => hasDisallowedSupabaseImport(file))
    .map((file) => file.normalizedPath);

  assert.deepEqual(supabaseImportFiles, ["src/lib/supabase/server.ts"]);
  assert.deepEqual(appSupabaseImportFiles, []);
  assert.doesNotMatch(appText, /@supabase|PrismaClient|Anthropic|Claude|AIProvider/);
  assert.doesNotMatch(sourceText, /PrismaClient|Anthropic|Claude|AIProvider/);
});

test("app route files do not import Supabase through package alias or relative paths", () => {
  const guardedAppFiles = appFiles.filter(
    (file) =>
      isUnderDirectory(file, "app/create") || isUnderDirectory(file, "app/i/[slug]")
  );
  const disallowedImports = guardedAppFiles.flatMap((file) =>
    getImportSpecifiers(file.text)
      .filter((specifier) => isDisallowedSupabaseSpecifier(file, specifier))
      .map((specifier) => `${file.normalizedPath}: ${specifier}`)
  );

  assert.deepEqual(disallowedImports, []);
});

test("service-role secret is server-only and not public-prefixed", () => {
  const serviceRoleFiles = sourceFiles
    .filter((file) => /SUPABASE_SERVICE_ROLE_KEY/.test(file.text))
    .map((file) => file.normalizedPath);
  const appServiceRoleFiles = appFiles
    .filter((file) => /SUPABASE_SERVICE_ROLE_KEY/.test(file.text))
    .map((file) => file.normalizedPath);

  assert.match(envExampleSource, /^SUPABASE_SERVICE_ROLE_KEY=/m);
  assert.doesNotMatch(envExampleSource, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  assert.deepEqual(serviceRoleFiles, ["src/lib/supabase/server.ts"]);
  assert.deepEqual(appServiceRoleFiles, []);
  assert.doesNotMatch(appText, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("public service-role env var is absent from source and env examples", () => {
  const publicServiceRoleFiles = sourceFiles
    .filter((file) => /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/.test(file.text))
    .map((file) => file.normalizedPath);

  assert.deepEqual(publicServiceRoleFiles, []);
  assert.doesNotMatch(envExampleSource, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
});

test("recipient page gates mode and helper UI through state helpers", () => {
  assert.match(recipientPageSource, /shouldShowCompatibilityReport/);
  assert.match(recipientPageSource, /shouldShowLawyerMode/);
  assert.match(recipientPageSource, /shouldShowUnbotheredMode/);
  assert.match(recipientPageSource, /shouldShowRaincheckPanel/);
  assert.match(recipientPageSource, /shouldShowKindReplyAssistant/);
  assert.match(recipientPageSource, /shouldShowInviteDetails/);
});

test("Unbothered slot has explicit consent after the rigged result", () => {
  const confirmationIndex = unbotheredSource.indexOf(
    "unbotheredSlotConfirmationLabel"
  );
  const yesInputIndex = unbotheredSource.indexOf(
    '<input name="response" type="hidden" value="yes" />',
    confirmationIndex
  );

  assert.match(unbotheredSource, /Let fate decide 🎰/);
  assert.match(unbotheredSource, /The totally unbiased machine has spoken: YES/);
  assert.ok(confirmationIndex > 0);
  assert.ok(yesInputIndex > confirmationIndex);
});

test("Unbothered keeps Raincheck and No outside the slot panel", () => {
  const slotPanelIndex = unbotheredSource.indexOf("function SlotPanel");
  const raincheckIndex = unbotheredSource.indexOf(
    'triggerLabel="Maybe another day"'
  );
  const noIndex = unbotheredSource.indexOf(
    'aria-label="Answer no to this invitation"'
  );

  assert.ok(slotPanelIndex > 0);
  assert.ok(raincheckIndex > 0 && raincheckIndex < slotPanelIndex);
  assert.ok(noIndex > 0 && noIndex < slotPanelIndex);
  assert.equal(unbotheredSource.includes("disabled={"), false);
});

test("Kind Reply Assistant remains local-only and non-notifying", () => {
  assert.match(kindReplySource, /navigator\.clipboard\?\.writeText/);
  assert.match(kindReplySource, /Copied ✓/);
  assert.doesNotMatch(kindReplySource, /inviteStore|InviteStore/);
  assert.doesNotMatch(kindReplySource, /respondToInviteAction/);
  assert.doesNotMatch(kindReplySource, /fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(kindReplySource, /notification|notify|sendEmail|sendSms/i);
});

function readSourceFiles(roots: string[]): SourceFile[] {
  return roots.flatMap((root) => readSourceTree(root));
}

function readSourceTree(path: string): SourceFile[] {
  const stat = statSync(path);

  if (stat.isFile()) {
    return isSourceFile(path)
      ? [
          {
            normalizedPath: normalizeSourcePath(path),
            path,
            text: readFileSync(path, "utf8")
          }
        ]
      : [];
  }

  return readdirSync(path).flatMap((entry) => readSourceTree(join(path, entry)));
}

interface SourceFile {
  normalizedPath: string;
  path: string;
  text: string;
}

function isSourceFile(path: string): boolean {
  return /\.(ts|tsx)$/.test(path);
}

function normalizeSourcePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function isUnderDirectory(file: SourceFile, directory: string): boolean {
  const normalizedDirectory = normalizeSourcePath(directory);

  return (
    file.normalizedPath === normalizedDirectory ||
    file.normalizedPath.startsWith(`${normalizedDirectory}/`)
  );
}

function getImportSpecifiers(source: string): string[] {
  const fromImports = Array.from(
    source.matchAll(/import(?:\s+type)?[\s\S]*?\sfrom\s+["']([^"']+)["']/g)
  ).map((match) => match[1]);
  const sideEffectImports = Array.from(
    source.matchAll(/import\s+["']([^"']+)["']/g)
  ).map((match) => match[1]);

  return [...fromImports, ...sideEffectImports];
}

function hasDisallowedSupabaseImport(file: SourceFile): boolean {
  return getImportSpecifiers(file.text).some((specifier) =>
    isDisallowedSupabaseSpecifier(file, specifier)
  );
}

function isDisallowedSupabaseSpecifier(
  file: SourceFile,
  specifier: string
): boolean {
  if (specifier === "@supabase/supabase-js") {
    return true;
  }

  if (
    specifier.startsWith("@/lib/supabase") ||
    specifier.startsWith("src/lib/supabase")
  ) {
    return true;
  }

  if (!specifier.startsWith(".")) {
    return false;
  }

  const importerDirectory = dirname(resolve(file.normalizedPath));
  const resolvedSpecifier = normalizeSourcePath(
    normalize(resolve(importerDirectory, specifier))
  );
  const supabaseDirectory = normalizeSourcePath(resolve("src/lib/supabase"));

  return (
    resolvedSpecifier === supabaseDirectory ||
    resolvedSpecifier.startsWith(`${supabaseDirectory}/`)
  );
}
