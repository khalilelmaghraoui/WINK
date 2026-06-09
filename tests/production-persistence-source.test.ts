import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";
import { test } from "node:test";

const createActionSource = readFileSync("app/create/actions.ts", "utf8");
const createFormSource = readFileSync(
  "app/create/create-invite-form.tsx",
  "utf8"
);
const recipientPageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");
const inviteStoreSource = readFileSync("src/lib/invite-store.ts", "utf8");
const configSource = readFileSync(
  "src/lib/storage/invite-store-config.ts",
  "utf8"
);
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};
const envExample = readFileSync(".env.example", "utf8");
const appFiles = readSourceTree("app");

test("create action handles persistence configuration failure without a share link", () => {
  assert.match(createActionSource, /isInvitePersistenceConfigurationError/);
  assert.match(
    createActionSource,
    /Invitation service is temporarily unavailable\. Please try again later\./
  );
  assert.match(createActionSource, /serviceError/);
  assert.match(createActionSource, /catch \(error\)/);

  const catchIndex = createActionSource.indexOf(
    "if (isInvitePersistenceConfigurationError(error))"
  );
  const rethrowIndex = createActionSource.indexOf("throw error;", catchIndex);
  const persistenceErrorBlock = createActionSource.slice(catchIndex, rethrowIndex);

  assert.ok(catchIndex > 0);
  assert.doesNotMatch(persistenceErrorBlock, /invitePath:/);
});

test("create form shows persistence unavailable separately from validation errors", () => {
  assert.match(createFormSource, /state\.serviceError/);
  assert.match(createFormSource, /role="status"/);
  assert.match(createFormSource, /Fix the highlighted fields/);
});

test("recipient page distinguishes storage unavailable from invite not found", () => {
  assert.match(recipientPageSource, /getInvitePageLoadResult/);
  assert.match(recipientPageSource, /TemporaryUnavailableState/);
  assert.match(recipientPageSource, /InviteNotFoundState/);
  assert.match(recipientPageSource, /Temporarily unavailable/);
  assert.match(
    recipientPageSource,
    /This invitation could not be loaded right now\./
  );
  assert.match(recipientPageSource, /Please try again in a moment\./);
  assert.match(recipientPageSource, /Invite not found/);
  assert.match(recipientPageSource, /Check the link and try again\./);
  assert.doesNotMatch(recipientPageSource, /setInterval|setTimeout|retry/i);
});

test("InviteStore default selection is lazy and deployed mode cannot silently choose memory", () => {
  assert.match(inviteStoreSource, /createLazyInviteStore/);
  assert.match(inviteStoreSource, /getGlobalInviteStore/);
  assert.match(inviteStoreSource, /resolveInvitePersistenceMode/);
  assert.doesNotMatch(
    inviteStoreSource,
    /globalInviteStore\.__winkInviteStore \?\? createDefaultInviteStore\(\)/
  );
});

test("configuration error messages contain variable names but no values", () => {
  assert.match(configSource, /INVITE_PERSISTENCE_NOT_CONFIGURED/);
  assert.match(configSource, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(configSource, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(configSource, /serviceRoleKey\}/);
  assert.doesNotMatch(configSource, /supabaseUrl\}/);
});

test("client and app UI do not read deployment variables or storage config", () => {
  const browserOrUiFiles = appFiles.filter(
    (file) => file.normalizedPath !== "app/create/actions.ts"
  );
  const disallowedAppImports = browserOrUiFiles.flatMap((file) =>
    getImportSpecifiers(file.text)
      .filter((specifier) => isDisallowedSpecifier(file, specifier))
      .map((specifier) => `${file.normalizedPath}: ${specifier}`)
  );

  assert.deepEqual(disallowedAppImports, []);
  assert.doesNotMatch(
    browserOrUiFiles.map((file) => file.text).join("\n"),
    /process\.env|SUPABASE_SERVICE_ROLE_KEY|VERCEL_ENV|VERCEL/
  );
});

test("production persistence safety does not introduce routes or public secrets", () => {
  assert.equal(existsSync("app/health"), false);
  assert.equal(existsSync("app/api/health"), false);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(packageJson.scripts.test, /production-persistence-source\.test\.js/);
});

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

function getImportSpecifiers(source: string): string[] {
  const fromImports = Array.from(
    source.matchAll(/import(?:\s+type)?[\s\S]*?\sfrom\s+["']([^"']+)["']/g)
  ).map((match) => match[1]);
  const sideEffectImports = Array.from(
    source.matchAll(/import\s+["']([^"']+)["']/g)
  ).map((match) => match[1]);

  return [...fromImports, ...sideEffectImports];
}

function isDisallowedSpecifier(file: SourceFile, specifier: string): boolean {
  if (
    specifier === "@supabase/supabase-js" ||
    specifier.startsWith("@/lib/supabase") ||
    specifier.startsWith("@/lib/storage/invite-store-config")
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
  const configFile = normalizeSourcePath(
    resolve("src/lib/storage/invite-store-config")
  );

  return (
    resolvedSpecifier === supabaseDirectory ||
    resolvedSpecifier.startsWith(`${supabaseDirectory}/`) ||
    resolvedSpecifier === configFile
  );
}
