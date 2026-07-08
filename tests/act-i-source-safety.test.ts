import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";
import { test } from "node:test";

const sourceRoots = ["app", "components", "src"];
const sourceFiles = readSourceFiles(sourceRoots);
const sourceText = sourceFiles.map((file) => file.text).join("\n");
const appFiles = sourceFiles.filter((file) => isUnderDirectory(file, "app"));
const appText = appFiles.map((file) => file.text).join("\n");
const pageShellSource = readFileSync("components/ui/page-shell.tsx", "utf8");
const primaryButtonSource = readFileSync(
  "components/ui/primary-button.tsx",
  "utf8"
);
const secondaryButtonSource = readFileSync(
  "components/ui/secondary-button.tsx",
  "utf8"
);
const dangerButtonSource = readFileSync(
  "components/ui/danger-button.tsx",
  "utf8"
);
const formFieldSource = readFileSync("components/ui/form-field.tsx", "utf8");
const modeBadgeSource = readFileSync("components/ui/mode-badge.tsx", "utf8");
const sectionDividerSource = readFileSync(
  "components/ui/section-divider.tsx",
  "utf8"
);
const stepIndicatorSource = readFileSync(
  "components/ui/step-indicator.tsx",
  "utf8"
);
const copyControlSource = readFileSync("components/ui/copy-control.tsx", "utf8");
const inviteCardSource = readFileSync("components/ui/invite-card.tsx", "utf8");
const privateLinkNoticeSource = readFileSync(
  "components/ui/private-link-notice.tsx",
  "utf8"
);
const statusCardSource = readFileSync("components/ui/status-card.tsx", "utf8");
const uiIndexSource = readFileSync("components/ui/index.ts", "utf8");
const recipientPageSource = readFileSync("app/i/[slug]/page.tsx", "utf8");
const createInviteFormSource = readFileSync(
  "app/create/create-invite-form.tsx",
  "utf8"
);
const createShareRecipientSource = readFileSync(
  "app/create/share-recipient-link-control.tsx",
  "utf8"
);
const createCopySenderSource = readFileSync(
  "app/create/copy-private-sender-link-control.tsx",
  "utf8"
);
const envExampleSource = readFileSync(".env.example", "utf8");
const lawyerSource = readFileSync("app/i/[slug]/lawyer-mode.tsx", "utf8");
const raincheckSource = readFileSync(
  "app/i/[slug]/raincheck-panel.tsx",
  "utf8"
);
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
  assert.deepEqual(serviceRoleFiles, [
    "src/lib/storage/invite-store-config.ts",
    "src/lib/supabase/server.ts"
  ]);
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

test("create share screen supports mobile copy fallback", () => {
  const shareSource = [
    createInviteFormSource,
    createShareRecipientSource,
    createCopySenderSource
  ].join("\n");

  assert.match(shareSource, /select-all break-all/);
  assert.match(shareSource, /aria-live="polite"/);
  assert.match(shareSource, /Could not copy\. Select/);
  assert.match(shareSource, /catch/);
});

test("Sprint 4.0 Pass A1 UI primitives exist and export correctly", () => {
  assert.equal(existsSync("components/ui/page-shell.tsx"), true);
  assert.equal(existsSync("components/ui/primary-button.tsx"), true);
  assert.equal(existsSync("components/ui/secondary-button.tsx"), true);
  assert.equal(existsSync("components/ui/danger-button.tsx"), true);
  assert.equal(existsSync("components/ui/section-divider.tsx"), true);
  assert.match(pageShellSource, /export function PageShell/);
  assert.match(primaryButtonSource, /export function PrimaryButton/);
  assert.match(secondaryButtonSource, /export function SecondaryButton/);
  assert.match(dangerButtonSource, /export function DangerButton/);
  assert.match(sectionDividerSource, /export function SectionDivider/);
  assert.match(uiIndexSource, /export \{ PageShell \}/);
  assert.match(uiIndexSource, /export \{ PrimaryButton \}/);
  assert.match(uiIndexSource, /export \{ SecondaryButton \}/);
  assert.match(uiIndexSource, /export \{ DangerButton \}/);
  assert.match(uiIndexSource, /export \{ SectionDivider \}/);
});

test("Sprint 4.0 Pass A1 button primitives include disabled semantics and focus styles", () => {
  const buttonSources = [
    primaryButtonSource,
    secondaryButtonSource,
    dangerButtonSource
  ];

  for (const buttonSource of buttonSources) {
    assert.match(buttonSource, /disabled=/);
    assert.match(buttonSource, /aria-disabled=/);
    assert.match(buttonSource, /disabled:cursor-not-allowed/);
    assert.match(buttonSource, /focus-visible:ring-2/);
    assert.match(buttonSource, /focus-visible:ring-wink-focus/);
    assert.match(buttonSource, /min-h-11/);
    assert.match(buttonSource, /rounded-md/);
  }
});

test("Sprint 4.0 Pass A1 primary button loading preserves readable label text", () => {
  assert.match(primaryButtonSource, /loading/);
  assert.match(primaryButtonSource, /aria-busy/);
  assert.match(primaryButtonSource, /disabled=\{isDisabled\}/);
  assert.match(primaryButtonSource, /<span>\{children\}<\/span>/);
});

test("Sprint 4.0 Pass A1 section divider supports default and accent variants", () => {
  assert.match(sectionDividerSource, /"default" \| "accent"/);
  assert.match(sectionDividerSource, /default: "border-wink-border"/);
  assert.match(sectionDividerSource, /accent: "border-wink-accent"/);
  assert.match(sectionDividerSource, /<hr/);
  assert.match(sectionDividerSource, /border-t/);
});

test("Sprint 4.0 Pass A1 page shell supports variants and documented widths", () => {
  assert.match(pageShellSource, /"default" \| "dim"/);
  assert.match(pageShellSource, /default: "bg-wink-background"/);
  assert.match(pageShellSource, /dim: "bg-wink-surface-muted"/);
  assert.match(pageShellSource, /"form" \| "invite" \| "landing"/);
  assert.match(pageShellSource, /form: "max-w-\[560px\]"/);
  assert.match(pageShellSource, /invite: "max-w-\[680px\]"/);
  assert.match(pageShellSource, /landing: "max-w-\[1120px\]"/);
  assert.match(pageShellSource, /<main/);
  assert.match(pageShellSource, /px-5/);
  assert.match(pageShellSource, /sm:px-8/);
  assert.match(pageShellSource, /lg:px-12/);
});

test("Sprint 4.0 Pass A2 FormField exists exports and supports required variants", () => {
  assert.equal(existsSync("components/ui/form-field.tsx"), true);
  assert.match(formFieldSource, /export function FormField/);
  assert.match(formFieldSource, /type FormFieldType = "text" \| "textarea" \| "select" \| "date" \| "time"/);
  assert.match(formFieldSource, /props\.type === "textarea"/);
  assert.match(formFieldSource, /props\.type === "select"/);
  assert.match(formFieldSource, /<input/);
  assert.match(formFieldSource, /type=\{type\}/);
});

test("Sprint 4.0 Pass A2 FormField wires labels helper errors and aria state", () => {
  assert.match(formFieldSource, /htmlFor=\{id\}/);
  assert.match(formFieldSource, /const helperId = helperText \? `\$\{id\}-helper`/);
  assert.match(formFieldSource, /const errorId = errorText \? `\$\{id\}-error`/);
  assert.match(formFieldSource, /aria-describedby=\{describedBy\}/);
  assert.match(formFieldSource, /aria-invalid=\{hasError \|\| undefined\}/);
  assert.match(formFieldSource, /aria-required=\{required \|\| undefined\}/);
  assert.match(formFieldSource, /id=\{helperId\}/);
  assert.match(formFieldSource, /id=\{errorId\}/);
  assert.match(formFieldSource, /Error: \{errorText\}/);
});

test("Sprint 4.0 Pass A2 FormField uses design tokens focus styles and required semantics", () => {
  assert.match(formFieldSource, /bg-wink-surface/);
  assert.match(formFieldSource, /text-wink-text/);
  assert.match(formFieldSource, /text-wink-text-secondary/);
  assert.match(formFieldSource, /border-wink-border/);
  assert.match(formFieldSource, /border-wink-danger/);
  assert.match(formFieldSource, /text-wink-danger/);
  assert.match(formFieldSource, /focus-visible:ring-2/);
  assert.match(formFieldSource, /focus-visible:ring-wink-focus/);
  assert.match(formFieldSource, /text-base/);
  assert.match(formFieldSource, /min-h-11/);
  assert.match(formFieldSource, /Required/);
  assert.match(formFieldSource, /required=\{required\}/);
});

test("Sprint 4.0 Pass A2 StepIndicator exists exports and stays non-interactive", () => {
  assert.equal(existsSync("components/ui/step-indicator.tsx"), true);
  assert.match(stepIndicatorSource, /export function StepIndicator/);
  assert.match(stepIndicatorSource, /currentStep/);
  assert.match(stepIndicatorSource, /totalSteps/);
  assert.match(stepIndicatorSource, /label/);
  assert.match(stepIndicatorSource, /aria-label=\{`Step \$\{normalizedCurrent\} of \$\{normalizedTotal\}: \$\{label\}`\}/);
  assert.match(stepIndicatorSource, /aria-hidden="true"/);
  assert.match(stepIndicatorSource, /bg-wink-primary/);
  assert.match(stepIndicatorSource, /bg-wink-border/);
  assert.doesNotMatch(stepIndicatorSource, /<button|<a\s|href=/);
});

test("Sprint 4.0 Pass A2 ModeBadge exists exports and keeps MVP modes only", () => {
  assert.equal(existsSync("components/ui/mode-badge.tsx"), true);
  assert.match(modeBadgeSource, /export function ModeBadge/);
  assert.match(modeBadgeSource, /type ModeBadgeMode = "lawyer" \| "unbothered"/);
  assert.match(modeBadgeSource, /lawyer: "Lawyer"/);
  assert.match(modeBadgeSource, /unbothered: "Unbothered"/);
  assert.doesNotMatch(modeBadgeSource, /ceo|desperate|scratch|classic/i);
});

test("Sprint 4.0 Pass A2 selectable ModeBadge uses accessible real interaction", () => {
  assert.match(modeBadgeSource, /selectable/);
  assert.match(modeBadgeSource, /selected/);
  assert.match(modeBadgeSource, /disabled/);
  assert.match(modeBadgeSource, /<button/);
  assert.match(modeBadgeSource, /aria-pressed=\{selected\}/);
  assert.match(modeBadgeSource, /disabled=\{disabled\}/);
  assert.match(modeBadgeSource, /min-h-11/);
  assert.match(modeBadgeSource, /focus-visible:ring-2/);
  assert.match(modeBadgeSource, /focus-visible:ring-wink-focus/);
  assert.match(modeBadgeSource, /border-wink-primary bg-wink-surface text-wink-primary/);
  assert.match(modeBadgeSource, />\s*Selected\s*</);
});

test("Sprint 4.0 Pass A2 UI barrel exports form and choice primitives", () => {
  assert.match(uiIndexSource, /export \{ FormField \}/);
  assert.match(uiIndexSource, /export \{ StepIndicator \}/);
  assert.match(uiIndexSource, /export \{ ModeBadge \}/);
});

test("Sprint 4.0 Pass A3 CopyControl exists exports and keeps local copy behavior", () => {
  assert.equal(existsSync("components/ui/copy-control.tsx"), true);
  assert.match(copyControlSource, /export function CopyControl/);
  assert.match(copyControlSource, /navigator\.clipboard/);
  assert.match(copyControlSource, /writeText/);
  assert.match(copyControlSource, /catch/);
  assert.match(copyControlSource, /failedFeedbackLabel/);
  assert.match(uiIndexSource, /export \{ CopyControl \}/);
});

test("Sprint 4.0 Pass A3 CopyControl presents selectable wrapping value and polite feedback", () => {
  assert.match(copyControlSource, /<output/);
  assert.match(copyControlSource, /select-all/);
  assert.match(copyControlSource, /whitespace-pre-wrap/);
  assert.match(copyControlSource, /break-all/);
  assert.match(copyControlSource, /aria-live="polite"/);
  assert.match(copyControlSource, /focus-visible:ring-2/);
  assert.match(copyControlSource, /focus-visible:ring-wink-focus/);
  assert.match(copyControlSource, /disabled=\{disabled\}/);
});

test("Sprint 4.0 Pass A3 CopyControl source stays private and non-messaging", () => {
  assert.doesNotMatch(copyControlSource, /fetch\(/);
  assert.doesNotMatch(copyControlSource, /XMLHttpRequest/);
  assert.doesNotMatch(copyControlSource, /sendBeacon/);
  assert.doesNotMatch(copyControlSource, /localStorage/);
  assert.doesNotMatch(copyControlSource, /document\.cookie/);
  assert.doesNotMatch(copyControlSource, /mailto:/);
  assert.doesNotMatch(copyControlSource, /tel:/);
  assert.doesNotMatch(copyControlSource, /SMS/);
  assert.doesNotMatch(copyControlSource, /WhatsApp/);
  assert.doesNotMatch(copyControlSource, /Instagram/);
  assert.doesNotMatch(copyControlSource, /analytics/);
  assert.doesNotMatch(copyControlSource, /openCount/);
  assert.doesNotMatch(copyControlSource, /readReceipt/);
});

test("Sprint 4.0 Pass A3 InviteCard exists exports and supports variants", () => {
  assert.equal(existsSync("components/ui/invite-card.tsx"), true);
  assert.match(inviteCardSource, /export function InviteCard/);
  assert.match(inviteCardSource, /type InviteCardVariant = "preview" \| "live" \| "accepted" \| "declined"/);
  assert.match(inviteCardSource, /preview: "border-wink-border"/);
  assert.match(inviteCardSource, /live: "border-wink-accent"/);
  assert.match(inviteCardSource, /accepted: "border-wink-success"/);
  assert.match(inviteCardSource, /declined: "border-wink-border"/);
  assert.match(uiIndexSource, /export \{ InviteCard \}/);
});

test("Sprint 4.0 Pass A3 InviteCard uses article labeling and polite state region", () => {
  assert.match(inviteCardSource, /<article/);
  assert.match(inviteCardSource, /aria-labelledby=\{titleId\}/);
  assert.match(inviteCardSource, /id=\{titleId\}/);
  assert.match(inviteCardSource, /aria-live="polite"/);
  assert.match(inviteCardSource, /overflow-hidden/);
  assert.match(inviteCardSource, /break-words/);
});

test("Sprint 4.0 Pass A3 StatusCard exists exports and supports sender statuses", () => {
  assert.equal(existsSync("components/ui/status-card.tsx"), true);
  assert.match(statusCardSource, /export function StatusCard/);
  assert.match(statusCardSource, /"pending"/);
  assert.match(statusCardSource, /"opened"/);
  assert.match(statusCardSource, /"accepted"/);
  assert.match(statusCardSource, /"rainchecked"/);
  assert.match(statusCardSource, /"declined"/);
  assert.match(statusCardSource, /"cancelled"/);
  assert.match(statusCardSource, /"expired"/);
  assert.match(statusCardSource, /"flagged"/);
  assert.match(uiIndexSource, /export \{ StatusCard \}/);
});

test("Sprint 4.0 Pass A3 StatusCard quotes messages without urgent alert semantics", () => {
  assert.match(statusCardSource, /<h1/);
  assert.match(statusCardSource, /<blockquote/);
  assert.match(statusCardSource, /<figcaption/);
  assert.doesNotMatch(statusCardSource, /role="alert"/);
});

test("Sprint 4.0 Pass A3 PrivateLinkNotice exists exports and is not an alert", () => {
  assert.equal(existsSync("components/ui/private-link-notice.tsx"), true);
  assert.match(privateLinkNoticeSource, /export function PrivateLinkNotice/);
  assert.match(privateLinkNoticeSource, /border-y border-wink-accent/);
  assert.match(privateLinkNoticeSource, /uppercase/);
  assert.doesNotMatch(privateLinkNoticeSource, /role="alert"/);
  assert.match(uiIndexSource, /export \{ PrivateLinkNotice \}/);
});

test("required create fields expose native required semantics", () => {
  assert.match(createInviteFormSource, /required={required}/);
  assert.match(createInviteFormSource, /required\s+type="date"/);
  assert.match(createInviteFormSource, /required\s+type="time"/);
});

test("Lawyer signature copy does not gate Raincheck or No", () => {
  assert.match(lawyerSource, /Raincheck and No do not require this approval\./);
  assert.match(lawyerSource, /Request continuance/);
  assert.match(lawyerSource, /Answer no to this invitation/);
});

test("Raincheck panel opens with focus target and noncommittal copy", () => {
  assert.match(raincheckSource, /panelHeadingRef/);
  assert.match(raincheckSource, /tabIndex={-1}/);
  assert.match(raincheckSource, /This does not commit you to anything\./);
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
  assert.match(unbotheredSource, /It cannot answer for you\./);
  assert.match(unbotheredSource, /Raincheck and No stay available below\./);
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

test("Kind Reply Assistant remains private and non-notifying", () => {
  assert.match(kindReplySource, /sendRecipientMessageAction/);
  assert.match(kindReplySource, /Send through WINK/);
  assert.match(kindReplySource, /Use this message/);
  assert.match(kindReplySource, /Optional message ideas/);
  assert.match(kindReplySource, /navigator\.clipboard\?\.writeText/);
  assert.match(kindReplySource, /Copied/);
  assert.doesNotMatch(kindReplySource, /inviteStore|InviteStore/);
  assert.doesNotMatch(kindReplySource, /respondToInviteAction/);
  assert.doesNotMatch(kindReplySource, /fetch\(|XMLHttpRequest/);
  assert.doesNotMatch(
    kindReplySource,
    /Notification\(|pushNotification|sendNotification|notifySender|sendEmail|sendSms/i
  );
  assert.doesNotMatch(kindReplySource, /senderAccessToken|senderTokenHash/);
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
