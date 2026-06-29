# WINK Product And Technical Context

This document preserves local project context for Codex runs. External uploaded
strategy or architecture documents may not be available inside the repository,
so this file summarizes the working product and architecture rules.

## Product Summary

WINK / DateCard is a romantic invitation microsite builder, not a dating app.
It lets someone create a cinematic private invitation link for a date, apology,
surprise, or romantic moment. The recipient opens the link in a browser and
answers Yes, Raincheck, or No.

The first product goal is to validate invite sharing and recipient response
before expanding.

Core loop:

1. Ask.
2. Reveal.
3. Date.
4. Memory.
5. Next invite.

Build Act I first.

## MVP Product Principles

- The app may be playful, but must never make refusal difficult.
- No must always remain possible and clear.
- The recipient experience must include an "I do not know this person" escape
  action.
- Flagging unknown sender sends no notification to the sender.
- Romantic and cinematic does not mean manipulative.
- Privacy rules are product requirements, not post-launch cleanup.

## Current MVP Modes

Allowed now:

- `lawyer`
- `unbothered`

Future modes, not now:

- `ceo`
- `desperate`
- `scratch`
- `classic`
- any invented mode

## Architecture Summary

The MVP is web-first:

- Next.js 15.
- TypeScript.
- Tailwind CSS.
- App Router.
- Supabase persistence behind the existing `InviteStore` interface.
- In-memory storage fallback when Supabase env vars are absent.

Everything revolves around the Invite primitive. Feature modules should depend
on InviteCore and provider interfaces. No feature code should import
third-party SDKs directly. Provider interfaces protect against vendor lock-in
and make later persistence or AI integrations replaceable.

## InviteCore Direction

The Invite primitive owns the core domain state:

- invite identity and slug
- private sender access token hash for new invites
- mode and tone
- date type
- status and phase
- recipient-facing invitation content
- date and place details
- response state
- counter-offer state
- write-once `openedAt`
- safety flags
- cancellation and expiration state
- optional one-time declined recipient message

The `InviteStore` interface is the boundary for persistence. The current
production-preview adapter is Supabase through server-mediated provider code
when env vars are configured. Local development and tests fall back to the
in-memory adapter when Supabase env vars are absent. Browser/UI files must not
import Supabase directly, and `SUPABASE_SERVICE_ROLE_KEY` must never be exposed
as `NEXT_PUBLIC`.

## Privacy Baseline

Non-negotiable rules:

- `/i/[slug]` must be `noindex,nofollow`.
- Open Graph/social preview must be generic.
- Do not expose sender name, recipient name, message, place, date, time, or
  address in metadata.
- Generic preview text: "You have a surprise waiting."
- `openedAt` is set once only.
- Never implement `openCount`.
- Do not track device, location, hover, cursor path, repeated opens, or dwell
  time.
- `previewMode=true` blocks all writes.

## Sprint Status

Sprint 0 - Foundation is implemented:

- App foundation.
- Invite primitive.
- In-memory `InviteStore`.
- Slug generator.
- Route skeletons.
- Privacy metadata baseline.
- Tests.

Sprint 0.1 - Documentation alignment:

- Root `AGENTS.md`.
- Non-empty `docs/BACKLOG_MVP.md`.
- Local `docs/WINK_CONTEXT.md`.
- No product features.

Sprint 1 - Core Ask:

- 3-step creation flow.
- Preview/share screen.
- Recipient invite page.
- Lawyer and Unbothered modes only.
- Compatibility report.
- Yes / Raincheck / No response flow.
- Same URL becomes confirmation page after Yes.
- "I do not know this person" escape action.
- Noindex/nofollow and generic Open Graph metadata.

Sprint 2 - Ethics and Polish:

- Kind Reply Assistant.
- Better Raincheck / counter-offer UX.
- Reduced-motion fallback.
- Accessibility hardening.
- Mobile polish.
- No dark patterns.

Sprint 2.0 - Supabase Persistence:

- Supabase adapter behind the existing `InviteStore` interface.
- No direct Supabase imports in feature UI.
- Environment variables.
- Real shareable links.
- Data persistence tests.

Sprint 2.0.2 - Supabase Security Hardening:

- Supabase writes use server-only provider code with the service-role key.
- The app falls back to in-memory storage when Supabase env vars are absent.
- Browser/UI files do not import Supabase directly.
- Preview guidance avoids broad anon insert/update/delete policies.

Sprint 2.1 - Vercel Preview Readiness:

- Vercel Preview deployment docs and smoke checklist.
- Source-safety tests for service-role exposure, direct Supabase imports,
  metadata privacy, and tracking/open-count guardrails.

Sprint 2.1.1 - Preview Guardrail Hardening:

- Cross-platform source-safety path handling.
- Stronger Supabase import and service-role exposure guardrails.
- Node 20 runtime declared for Vercel-style environments.

Sprint 2.1.2 - Vercel Preview deployment evidence:

- `docs/VERCEL_PREVIEW_SMOKE_REPORT.md` captures the preview deployment URL,
  branch, commit, configured env var names, Supabase table checks, smoke
  results, known issues, and readiness verdict.
- This sprint is documentation/evidence only. It does not change product flow,
  UI, routes, persistence behavior, metadata, or invite modes.

Sprint 2.2 - Act I QA polish and consent/mobile hardening:

- Small, targeted polish keeps the existing `/create` and `/i/[slug]` flow
  intact while improving mobile copy fallback, required-field semantics,
  Raincheck focus behavior, long-text wrapping, and non-coercive helper copy.
- No product features, routes, invite modes, authentication, analytics,
  notifications, payments, AI, or persistence behavior are added.

Sprint 2.2.1 - Post-polish preview regression and real-device QA evidence:

- `docs/ACT_I_REAL_DEVICE_QA.md` captures manual checks for iPhone, Android,
  desktop Chrome, `/create`, `/i/[slug]`, response paths, metadata, service-role
  exposure, and no-overflow/tap-target behavior.
- `docs/VERCEL_PREVIEW_SMOKE_REPORT.md` includes a Sprint 2.2 post-polish
  regression section for preview URL, branch, commit, devices, pass/fail
  checklist, known issues, and readiness verdict.
- This checkpoint is QA evidence only and does not change product behavior.

Sprint 2.2.2 - Evidence cleanup and repo consistency:

- Documentation now reflects the current Next.js 15 stack, implemented
  Supabase persistence, Vercel Preview smoke pass, and real-device QA pass.
- Current status: Act I MVP is implemented, Supabase-backed preview
  persistence works, Vercel Preview smoke passed, real-device QA passed, and
  WINK is ready for closed alpha preparation.
- This is not a public launch or production-readiness claim.

Sprint 2.3 - Closed alpha feedback pack:

- `docs/CLOSED_ALPHA_TEST_PLAN.md` defines the 3-5 tester closed alpha scope,
  privacy rules, success criteria, stop conditions, and post-test triage flow.
- `docs/CLOSED_ALPHA_FEEDBACK_TEMPLATE.md` gives testers a structured way to
  separate sender feedback, recipient feedback, bugs, trust concerns, and
  deferred feature requests.
- No product behavior changed. The next step after Sprint 2.3 is real feedback
  collection and triage in Sprint 2.4.

Sprint 2.3.1 - Alpha candidate release hygiene:

- `docs/ALPHA_RELEASE_NOTES.md` documents the Act I alpha candidate status,
  included flows, safety and privacy guarantees, known limitations, and manual
  release checklist.
- Sprint 2.4 remains deferred until real closed alpha tester feedback exists.
- No product behavior changed.

Sprint 2.3.2 - Production smoke closure:

- A final alpha smoke found the Production deployment needed Supabase
  environment variables configured separately from the earlier Preview phase.
- Vercel Production env vars were corrected and Production invite persistence
  was manually verified.
- `docs/PRODUCTION_ALPHA_SMOKE_REPORT.md` records the Production evidence while
  redacting the live bearer invite slug and private invite content.
- No product code or behavior changed.
- Sprint 2.4 remains deferred until real closed alpha tester feedback exists.

Sprint 2.4 - Closed alpha feedback triage:

- Skipped by product decision.
- No closed-alpha tester feedback had been collected, so there was nothing real
  to triage.
- This is not a validation claim.

Sprint 2.5 - Feedback-driven fixes:

- Skipped because Sprint 2.4 did not produce real tester feedback.
- No feedback-driven product fixes were implemented.
- This keeps WINK aligned with the Act I-first strategy instead of inventing
  internal polish without user evidence.

Sprint 2.6 - Minimal alpha entry page:

- Adds a compact root `/` entry page that explains only the already-implemented
  Act I loop and links directly to `/create`.
- The page demonstrates Lawyer and Unbothered with a static fictional preview.
- Production invite behavior, `/create`, `/i/[slug]`, Supabase persistence,
  invite metadata, and response behavior are unchanged.
- Current status is technically verified, Production persistence verified, and
  public entry page added. User validation is not completed.
- WINK remains an alpha, not a public-production claim.

Sprint 2.6.1 - Home page Production smoke and Alpha 0.2 evidence:

- `docs/HOME_PAGE_PRODUCTION_SMOKE_REPORT.md` records Production homepage,
  responsive, typography, accessibility, metadata, privacy, and fresh invite
  create/open regression evidence.
- The Production homepage rendered the Sprint 2.6 content, and `origin/main`
  points to `894ea42485c548a6cc19596b4f24137299614759`.
- Exact Vercel Production deployment commit confirmation remains pending
  because the public deployment did not expose a commit SHA and CLI inspection
  timed out.
- Verdict is `ready with caveats`; do not create `alpha-act-i-0.2` until the
  Production deployment commit is confirmed in Vercel.
- No product code or behavior changed.

Sprint 3.0 - Act II accepted reveal foundation:

- Begins a narrowly scoped Act II foundation without claiming user validation.
- Adds a pure read-only RevealEngine that receives an `Invite` and returns an
  accepted reveal view model from existing invite data.
- The accepted `/i/[slug]` state now renders a more useful private
  confirmation artifact with message, date type, human-readable date/time when
  present, place details when present, and valid place notes when present.
- A pre-preview amendment corrected reveal data semantics so
  `dateDetails.notes` is never treated as dress guidance; only existing
  `placeDetails.notes` or a real existing dress-hint field may appear as the
  accepted-state note.
- Accepted date/time formatting parses local `YYYY-MM-DDTHH:mm` components
  directly and does not shift through UTC.
- A follow-up Sprint 3.0 amendment moved invite date/time presentation into one
  shared pure formatter used by Lawyer Evidence, the recipient Details card,
  and AcceptedReveal. Stored values and persistence behavior are unchanged.
- The accepted reveal owns its page heading hierarchy after acceptance, so
  pre-response Lawyer or Unbothered headlines are hidden in the accepted state.
- Acceptance state remains owned by the existing recipient page state logic;
  RevealEngine does not decide status, write data, call `InviteStore`, import
  Supabase, or mutate the invite.
- No schema, persistence, response behavior, metadata behavior, homepage,
  Lawyer mode, Unbothered mode, Raincheck, No, Kind Reply Assistant, or
  Compatibility Report behavior changed.
- Calendar export, maps, music, countdowns, reveal drip, notifications, camera,
  scrapbook, partners, sender controls, and dashboard features remain deferred.
- User validation remains incomplete, and Sprint 3.0.1 Preview regression has
  not started.

Sprint 3.0.1 - Accepted reveal Preview regression:

- Skipped by product decision.
- This is not a passed QA checkpoint and does not claim user validation.

Sprint 3.1 - Accepted invite Add to calendar:

- Adds a provider-independent `.ics` calendar download action only after an
  invite is accepted.
- Calendar generation is pure, does not call `InviteStore`, does not import
  Supabase, and does not use provider SDKs or network requests.
- The calendar file uses floating local time because Invite stores
  wall-clock date/time without a timezone field.
- No end time, duration, alarm, reminder, or timezone is invented.
- Calendar contents are minimized to a WINK title, existing place details when
  available, and a generic private-invitation description.
- Sender name, recipient name, invite slug, invite URL, internal IDs, and the
  private invitation message are not exported.
- No schema, persistence, response behavior, metadata behavior, InviteStore,
  Supabase adapter, or environment behavior changed.
- Maps, directions, music, countdowns, reveal drip, notifications, camera,
  scrapbook, partners, sender controls, and dashboard features remain deferred.
- User validation remains incomplete.

Sprint 3.2 - Accepted invite Open in maps:

- Adds an accepted-state external maps link using only existing place name and
  address data.
- Location behavior is isolated behind a provider-neutral `LocationProvider`
  boundary.
- The current v1 provider builds a Google Maps web search URL with no SDK, no
  API key, and no provider API call.
- No external request occurs before the recipient explicitly opens the link.
- The link uses `referrerPolicy="no-referrer"` and explains that the place is
  shared with Google only after click.
- The outbound query excludes invite slug, invite URL, sender name, recipient
  name, private invitation message, internal IDs, and tracking parameters.
- No schema, persistence, `InviteStore`, Supabase, response behavior, metadata
  behavior, or calendar behavior changed.
- Embedded maps, automatic directions, geolocation, travel time, music,
  countdowns, reveal drip, notifications, camera, scrapbook, partners, sender
  controls, and dashboard features remain deferred.
- User validation remains incomplete.

Sprint 3.3 - Accepted experience consolidation:

- Consolidates the accepted reveal into one calmer private-plan artifact after
  the calendar and maps utility slices.
- No new Act II capability is added.
- Calendar and maps actions are grouped under one `Plan actions` hierarchy.
- Place details now render naturally as primary place text and secondary
  address text instead of database-like `Name` and `Address` labels.
- The accepted card uses internal dividers and spacing rather than nested
  place/action cards.
- Calendar status feedback remains accessible through a polite status region.
- No provider, schema, persistence, `InviteStore`, Supabase, metadata, or
  response behavior changed.
- User validation remains incomplete.

Sprint 3.3.1 - Act II accepted experience Production closure:

- `docs/ACT_II_ACCEPTED_EXPERIENCE_PRODUCTION_REPORT.md` records Production
  evidence for the accepted reveal, shared human-readable plan details, Add to
  calendar, Open in Google Maps, and the consolidated plan-actions hierarchy.
- Verdict is `ready with caveats`.
- Production accepted-state rendering, privacy checks, and automated
  verification passed.
- Vercel Production deployment commit confirmation remains pending because the
  public deployment did not expose a commit SHA.
- A real clicked Production browser calendar download/import check remains a
  manual follow-up before creating an Act II alpha tag.
- Full Act II is not complete, and user validation remains incomplete.
- No product code, schema, persistence, `InviteStore`, Supabase, metadata, or
  response behavior changed.

Sprint 3.4 - Production persistence fail-closed and configuration safety:

- Deployed Preview and Production runtimes now require
  `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for invite
  persistence.
- In-memory fallback remains available for local development and automated
  tests only.
- Missing deployed persistence configuration no longer creates disappearing
  invite links from `/create`.
- Missing deployed persistence configuration renders a safe temporary-service
  state that is distinct from a genuinely unknown invite slug.
- Persistence selection remains behind the `InviteStore` boundary and is
  resolved lazily on server use so local builds do not require production
  credentials.
- No schema, provider, product-flow, invite-field, metadata, response behavior,
  calendar, or maps behavior changed.
- User validation remains incomplete.

Sprint 3.5 - Invite expiry enforcement:

- Enforces existing invite expiry semantics lazily at recipient page loading
  and server-side mutation boundaries.
- Pending/opened invites with `now >= expiresAt` render an expired state and
  cannot accept Yes, Raincheck, No, unknown-sender, or no-tap writes.
- Accepted, raincheck, declined, flagged, and cancelled states remain terminal
  and are not retroactively replaced by expiry.
- Missing or malformed expiry values do not crash the app and do not silently
  expire the invite.
- Expiry is effective/derived for correctness; the existing `expireInvites`
  method may persist an expired transition when explicitly called, but no cron,
  scheduler, notification, automatic deletion, or background worker exists.
- No schema, product-flow, provider, `InviteStore` contract, metadata,
  calendar, maps, or route expansion occurred.
- User validation remains incomplete.

Sprint 3.6 - Private sender link and real decline reply v1:

- Adds a private `/s/[token]` sender status page for new invites.
- Invite creation now returns two links: the recipient `/i/[slug]` link and a
  private sender `/s/[token]` link.
- The raw sender access token is generated once and shown only in the creator
  success state; Supabase and in-memory persistence store only
  `sender_token_hash`.
- Sender status shows pending/opened, accepted, raincheck, declined, expired,
  and cancelled summaries without exposing unknown-sender flag details or exact
  opened timestamps.
- Declined recipients on new invites may send one optional WINK-mediated
  message that appears only on the private sender link.
- Legacy invites without sender access keep manual-copy Kind Reply ideas.
- Closure verification confirmed that the Production/Main Supabase migration
  columns are present and aligned with the code. Local lint, typecheck, test,
  and build checks pass for commit
  `6341919881ba84ccd5e8b666206d52ffdba2afad`.
- The branch Vercel Preview deployment completed successfully, but the Preview
  URL was protected by Vercel authentication during closure verification, so
  live Preview smoke remains pending.
- No external messaging, email, SMS, push notification, webhook, analytics,
  read receipt, open count, auth, dashboard, sender controls, new invite modes,
  or route expansion beyond `/s/[token]` was added.
- `/i/[slug]` and `/s/[token]` metadata remain generic and `noindex,nofollow`.
- User validation remains incomplete.

## Not In Current MVP Work

Do not add these unless explicitly requested:

- Direct Supabase imports from app/UI files.
- Broad anon insert/update/delete policies for preview.
- Prisma.
- Authentication.
- Dashboard.
- Notifications.
- External messaging delivery.
- Message read receipts.
- Payments.
- Native mobile app.
- Expo.
- Embedded maps.
- Geolocation.
- Automatic directions.
- Origin detection.
- Distance or travel-time calculation.
- Map SDK integrations.
- Music.
- AI generation.
- Partners.
- Camera.
- Scrapbook.
- Reveal drip.
- Rate limiting.
- Sender verification.
