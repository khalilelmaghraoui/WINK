# WINK MVP Backlog

This backlog is intentionally compact. It keeps future Codex runs aligned on
the MVP sequence without pulling later platform ideas into early slices.

## Current Status

Act I MVP is implemented through Sprint 2.6. Supabase-backed preview and
Production alpha persistence works through the `InviteStore` boundary when env
vars are configured, with in-memory fallback when they are absent. Vercel
Preview smoke and real-device QA passed, and final Production alpha smoke
passed after Production Supabase env vars were corrected. The closed alpha
feedback pack is ready, and WINK now has a minimal public entry page explaining
the existing Act I flow. Sprint 2.6.1 homepage Production smoke is documented
with a `ready with caveats` verdict because exact Vercel deployment commit
confirmation remains pending. Sprint 3.0 begins a narrow Act II accepted reveal
foundation using existing invite data only. Sprint 3.3.1 documents the first
accepted-experience Production closure with a `ready with caveats` verdict.
Sprint 3.4 hardens deployed persistence configuration so Preview and Production
fail closed instead of silently using temporary memory storage. Sprint 3.5
enforces existing invite expiry semantics at read/write boundaries without a
scheduler or schema change. Sprint 3.6 adds a private sender status link and a
one-time declined reply stored behind `InviteStore` without external messaging
or notifications. User validation is not completed. This is not a public launch
or production-readiness claim.

Active stack:

- Next.js 15.
- TypeScript.
- Tailwind CSS.
- App Router.
- Supabase persistence behind `InviteStore`.
- In-memory storage fallback for local development and tests.

## Sprint 0 - Foundation

Status: implemented.

Deliverables:

- Next.js web app foundation, now running on Next.js 15.
- TypeScript, Tailwind CSS, App Router, ESLint.
- `npm run lint` and `npm run typecheck`.
- Invite primitive/domain model.
- In-memory `InviteStore`.
- Slug generator.
- Route skeletons for `/`, `/create`, and `/i/[slug]`.
- Privacy metadata baseline for `/i/[slug]`.
- Tests for slug generation and store behavior.

Verification:

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm test` passes.
- `openedAt` is write-once.
- `previewMode=true` blocks writes.
- Missing slugs return `null`.
- Response status transitions are covered.

## Sprint 0.1 - Documentation Alignment

Status: implemented.

Deliverables:

- Root `AGENTS.md` as canonical Codex instruction file.
- Non-empty `docs/BACKLOG_MVP.md`.
- Local `docs/WINK_CONTEXT.md` with product and technical architecture
  context.

Verification:

- No product features are implemented.
- No business logic changes are made unless required to keep tests passing.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm test` passes.

## Sprint 1 - Core Ask

Status: implemented.

Goal: prove the Act I invite loop.

Deliverables:

- 3-step creation flow.
- Preview/share screen.
- Recipient invite page.
- Lawyer and Unbothered modes only.
- Compatibility report.
- Yes / Raincheck / No response flow.
- Same `/i/[slug]` URL becomes the confirmation page after Yes.
- "I do not know this person" escape action.
- `/i/[slug]` remains `noindex,nofollow`.
- Generic Open Graph/social metadata remains in place.

Verification:

- Sender can create an invite.
- Sender can copy/share a link.
- Recipient can open the invite.
- Recipient can answer Yes, Raincheck, or No.
- After Yes, refreshing the same URL shows confirmation.
- No remains visible and usable.
- Unknown-sender action does not notify the sender.
- `previewMode=true` blocks writes.
- No `openCount` exists.

## Sprint 2 - Ethics And Polish

Status: implemented.

Goal: make the loop kinder, safer, and better on mobile.

Deliverables:

- Kind Reply Assistant.
- Better Raincheck / counter-offer UX.
- Reduced-motion fallback.
- Accessibility hardening.
- Mobile polish.
- No dark-pattern response UI.

Verification:

- Reduced-motion users get static fallbacks.
- All controls have accessible names.
- Focus order is logical.
- Tap targets are at least 44px.
- Raincheck and No remain clear, respectful, and easy to choose.

## Sprint 2.0 - Supabase Persistence

Status: implemented.

Goal: replace mock persistence without changing feature UI contracts.

Deliverables:

- Supabase adapter behind the existing `InviteStore` interface.
- No direct Supabase imports in feature UI.
- Environment variable handling.
- Real shareable links.
- Data persistence tests.

Verification:

- Existing store behavior remains compatible.
- Provider interface boundaries are preserved.
- No feature UI imports third-party SDKs directly.
- Data persists across server restarts.
- Privacy metadata remains generic.

## Sprint 2.0.2 - Supabase Security Hardening

Status: implemented.

Deliverables:

- Server-only Supabase service-role provider path.
- In-memory fallback when Supabase env vars are absent.
- RLS guidance that avoids broad anon insert/update/delete policies for
  preview.
- Source-safety tests for service-role exposure and direct Supabase imports.

Verification:

- Browser/UI files do not import Supabase directly.
- `SUPABASE_SERVICE_ROLE_KEY` is never exposed as `NEXT_PUBLIC`.
- No `openCount` or analytics/tracking fields exist.

## Sprint 2.1 - Vercel Preview Readiness

Status: implemented.

Deliverables:

- Vercel Preview deployment guide.
- Required env var documentation.
- Post-deployment smoke checklist.
- Deployment-readiness source tests.

## Sprint 2.1.1 - Preview Guardrail Hardening

Status: implemented.

Deliverables:

- Cross-platform source-safety path handling.
- Stronger Supabase import guardrails.
- Stronger service-role exposure guardrails.
- Node 20 runtime declaration.

## Sprint 2.1.2 - Vercel Preview Smoke Evidence

Status: implemented.

Deliverables:

- Vercel Preview smoke report.
- Supabase project/table evidence without secrets.
- Metadata and service-role exposure evidence.

## Sprint 2.2 - Act I QA Polish

Status: implemented.

Deliverables:

- Consent and mobile hardening.
- Accessibility and copy polish.
- Additional Act I safety/source tests.
- Updated Act I QA checklist.

## Sprint 2.2.1 - Post-Polish Real-Device QA Evidence

Status: implemented.

Deliverables:

- Real-device QA checklist and evidence.
- Post-polish Vercel Preview regression section.
- Status note in local project context.

## Sprint 2.3 - Closed Alpha Feedback Pack

Status: implemented.

Deliverables:

- Closed alpha test plan for 3-5 trusted testers.
- Closed alpha feedback template.
- Context note confirming feedback collection and triage are next.

## Sprint 2.3.1 - Alpha Candidate Release Hygiene

Status: implemented.

Deliverables:

- Act I alpha candidate release notes.
- Short context/backlog status updates.
- Sprint 2.4 explicitly deferred until real tester feedback exists.

## Sprint 2.3.2 - Production Environment Verification

Status: implemented.

Deliverables:

- Production alpha smoke report.
- Clarification that Preview smoke evidence remains historical Preview
  evidence.
- Production Supabase env correction documented.
- Production invite persistence manually verified with the bearer invite slug
  redacted from repo evidence.
- Sprint 2.4 remains deferred until real tester feedback exists.

## Sprint 2.4 - Closed Alpha Feedback Triage

Status: skipped by product decision.

Reason:

- No real closed-alpha tester feedback had been collected.
- The project should not fake a triage sprint without human responses.

## Sprint 2.5 - Feedback-Driven Fixes

Status: skipped.

Reason:

- No Sprint 2.4 feedback triage existed.
- No tester-backed fixes were available to implement.

## Sprint 2.6 - Minimal Alpha Entry Page

Status: implemented.

Deliverables:

- Minimal root `/` entry page.
- Static fictional invitation preview.
- Existing mode previews for Lawyer and Unbothered only.
- Direct CTA to `/create`.
- Homepage source tests.

Constraints:

- No product behavior changed.
- No closed-alpha user-validation claim is made.
- The homepage explains only already-implemented Act I functionality.
- Act II and future features remain out of scope.

## Sprint 2.6.1 - Home Page Production Smoke

Status: documented, ready with caveats.

Deliverables:

- Production homepage smoke report.
- Responsive checks for `320px`, `375px`, `768px`, `1024px`, and wide desktop.
- Root metadata verification.
- `/i/[slug]` generic metadata and `noindex,nofollow` verification.
- Fresh Production invite create/open regression evidence with live slug
  redacted.
- Alpha 0.2 release note update.

Caveat:

- Public Production content matches Sprint 2.6 and `origin/main` points to the
  expected full commit.
- Exact Vercel Production deployment commit confirmation remains pending.
- Do not tag `alpha-act-i-0.2` until that commit is confirmed in Vercel.

## Sprint 3.0 - Act II Accepted Reveal Foundation

Status: implemented.

Deliverables:

- Pure read-only RevealEngine for accepted invite presentation.
- Accepted `/i/[slug]` state renders a private confirmation artifact using
  existing Invite data.
- Pre-preview amendment fixes accepted reveal semantics and hierarchy:
  `dateDetails.notes` is not used as dress guidance, date/time renders in a
  human-readable local wall-clock format, and the accepted reveal owns the page
  heading after acceptance.
- Follow-up amendment centralizes invite date/time presentation in one shared
  pure formatter so Lawyer Evidence, the recipient Details card, and
  AcceptedReveal use the same local wall-clock display.
- Focused tests for complete and missing accepted invite data.
- Source guardrails ensuring accepted reveal UI does not import Supabase,
  storage, server actions, or response submission behavior.

Constraints:

- No schema or persistence changes.
- No new stored fields.
- No stored date/time value changes.
- No acceptance logic moved into RevealEngine.
- No changes to `/create`, response submission, Raincheck, No, unknown sender,
  preview mode, Lawyer mode, Unbothered mode, Kind Reply Assistant,
  Compatibility Report, homepage, or invite metadata.
- Calendar export, maps, music, countdowns, reveal drip, notifications, camera,
  scrapbook, partners, and dashboard behavior remain deferred.
- User validation remains incomplete.
- Sprint 3.0.1 Preview regression is not complete yet.

## Sprint 3.0.1 - Accepted Reveal Preview Regression

Status: skipped by product decision.

Notes:

- This checkpoint was not run and should not be described as passed.
- User validation remains incomplete.

## Sprint 3.1 - Accepted Invite Add To Calendar

Status: implemented.

Deliverables:

- Provider-independent `.ics` calendar download action rendered only in the
  accepted reveal.
- Pure calendar utility that serializes valid RFC 5545-style calendar output.
- Shared invite local date/time parser reused for calendar safety.
- Floating local timed events for stored wall-clock date/time values.
- All-day events for date-only values.
- Source-safety and ICS serialization tests.

Constraints:

- No calendar provider SDKs, Google Calendar URLs, Apple Calendar APIs,
  Microsoft Graph, OAuth, maps, directions, notifications, reminders, alarms,
  analytics, or network requests.
- No schema, persistence, stored field, InviteStore, Supabase, response flow,
  metadata, `/create`, Lawyer, Unbothered, Raincheck, No, Kind Reply Assistant,
  Compatibility Report, or homepage changes.
- No sender name, recipient name, invite slug, invite URL, internal IDs, or
  private invitation message are exported to the `.ics`.
- No end time, duration, alarm, reminder, timezone, or `TZID` is invented.
- User validation remains incomplete.

## Sprint 3.2 - Accepted Invite Open In Maps

Status: implemented.

Deliverables:

- Provider-neutral `LocationProvider` interface for accepted-state location
  links.
- Google Maps web search provider that uses no SDK, no API key, no geolocation,
  and no automatic provider request.
- Accepted reveal renders a quiet external `Open in Google Maps` action only
  when a place name or address exists.
- Source-safety and provider tests for query construction, encoding,
  no-referrer behavior, privacy exclusions, and provider boundaries.

Constraints:

- No schema, persistence, `InviteStore`, Supabase, response behavior, metadata,
  `/create`, Lawyer, Unbothered, Raincheck, No, Kind Reply Assistant,
  Compatibility Report, homepage, or calendar behavior changed.
- No map SDK, map embed, API key, geolocation, automatic directions, origin
  detection, distance calculation, travel-time calculation, analytics, or click
  tracking was added.
- No invite slug, invite URL, sender name, recipient name, private message,
  internal ID, or tracking parameter is included in the outbound maps query.
- Place information is shared with Google only after the recipient explicitly
  clicks the link.
- Embedded maps, full directions, music, countdowns, reveal drip,
  notifications, camera, scrapbook, partners, sender controls, and dashboard
  features remain deferred.
- User validation remains incomplete.

## Sprint 3.3 - Accepted Experience Consolidation

Status: implemented.

Deliverables:

- Accepted reveal hierarchy consolidated into one private-plan artifact.
- Place details render as natural place/address text instead of database-like
  field labels.
- Calendar and maps actions are grouped under one compact `Plan actions`
  section.
- Calendar status feedback uses accessible polite status semantics.
- Source-safety tests cover action grouping, missing-action cases, presentation
  boundaries, external-link attributes, and natural place rendering.

Constraints:

- No new product capability was added.
- Calendar generation and Google Maps URL generation remain unchanged.
- No provider, schema, persistence, `InviteStore`, Supabase, response behavior,
  metadata, `/create`, Lawyer, Unbothered, Raincheck, No, Kind Reply Assistant,
  Compatibility Report, homepage, or route behavior changed.
- No map embed, geolocation, automatic directions, origin detection,
  distance/travel-time calculation, calendar provider, notification, analytics,
  tracking, auth, dashboard, payment, AI, music, countdown, reveal drip, camera,
  scrapbook, partner, sender-control, or new-mode behavior was added.
- User validation remains incomplete.

## Sprint 3.3.1 - Act II Accepted Experience Production Closure

Status: documented, ready with caveats.

Deliverables:

- Production evidence report for accepted reveal, human-readable plan details,
  Add to calendar, Open in Google Maps, and consolidated Plan actions.
- Production pending-state create/open smoke with bearer slug redacted.
- Production accepted-state rendering checks for calendar/maps action presence
  and omission cases.
- Responsive screenshots at `320px`, `375px`, `768px`, `1024px`, and wide
  desktop.
- Privacy and architecture checks for service-role exposure, `openCount`,
  analytics, geolocation, map SDKs, calendar SDKs, and generic invite metadata.

Caveats:

- Vercel Production deployment commit still needs independent dashboard
  confirmation before tagging.
- A real clicked Production browser calendar download/import check remains to
  be completed before an Act II alpha tag.
- A narrow-phone spot-check should confirm the `320px` maps helper text remains
  comfortable.

Constraints:

- No product code, tests, package files, schema, persistence, `InviteStore`,
  Supabase adapter, metadata, route, or response behavior changed.
- Full Act II is not complete.
- User validation remains incomplete.

## Sprint 3.4 - Production Persistence Fail-Closed

Status: implemented.

Deliverables:

- Pure persistence-mode resolver for local/test memory fallback versus
  deployed Supabase requirement.
- Typed persistence-configuration error with a stable non-secret code.
- Lazy server-side `InviteStore` resolution so local builds do not require
  production credentials.
- `/create` returns a safe temporary-service message instead of a disappearing
  memory-backed share link when deployed persistence is missing.
- `/i/[slug]` distinguishes storage-unavailable from a genuine invite-not-found
  slug.
- Source and behavior tests for deployed fail-closed behavior, service-role
  secrecy, UI import boundaries, and build safety.
- `docs/PRODUCTION_PERSISTENCE_SAFETY.md` documents required deployed
  variables and safe verification.

Constraints:

- No product capability was added.
- No schema, route, provider, invite-field, metadata, response behavior,
  calendar, maps, homepage, Lawyer, Unbothered, Raincheck, No, Kind Reply
  Assistant, or accepted reveal behavior changed.
- In-memory storage remains local/test only.
- User validation remains incomplete.

## Sprint 3.5 - Invite Expiry Enforcement

Status: implemented.

Deliverables:

- Pure lifecycle helper for effective invite expiry.
- Pending/opened invites with `now >= expiresAt` render the expired state.
- Yes, Raincheck, No, unknown-sender, and no-tap mutations are blocked after
  effective expiry.
- Recipient loading derives expiry before marking an invite opened.
- Accepted, raincheck, declined, flagged, and cancelled states remain terminal
  and are not retroactively replaced by expiry.
- Expiry policy documentation.

Constraints:

- No scheduler, cron job, queue, notification, automatic deletion, dashboard,
  authentication, schema migration, route, provider, or product-flow expansion
  was added.
- Effective expiry remains correct even if the existing explicit
  `expireInvites` persistence method is never called.
- Missing or malformed expiry values do not crash and do not silently expire an
  invite.
- User validation remains incomplete.

## Sprint 3.6 - Private Sender Link And Declined Reply

Status: implemented; Preview smoke pending behind Vercel protection.

Deliverables:

- New invite creation returns a recipient link and a private sender link.
- `/s/[token]` renders a private sender status page using a one-time generated
  bearer token.
- Only `sender_token_hash` is stored; the raw sender token is not stored or
  recoverable.
- Sender status includes pending/opened, accepted, raincheck, declined,
  expired, and cancelled summaries while hiding unknown-sender flag details.
- Declined recipients on new invites can send one optional short WINK-mediated
  message through the declined state.
- Legacy invites without sender access keep manual-copy Kind Reply ideas.
- Supabase migration adds `sender_token_hash`, `recipient_message`, and
  `recipient_message_sent_at` with a unique sender-token hash index and
  recipient-message length check.
- Source and behavior tests cover sender-token generation, hashing, status
  privacy, one-time recipient message storage, migration safety, route
  inventory, and no-notification/no-tracking boundaries.
- The Supabase Production/Main migration was manually applied and verified for
  `sender_token_hash`, `recipient_message`, and
  `recipient_message_sent_at`.
- Local lint, typecheck, test, and build checks pass for commit
  `6341919881ba84ccd5e8b666206d52ffdba2afad`.
- The branch Vercel Preview deployment completed successfully, but the Preview
  URL was protected by Vercel authentication during closure verification, so
  live Preview smoke remains pending.

Constraints:

- No authentication, dashboard, notifications, email, SMS, push, webhook,
  analytics, read receipts, external messaging delivery, sender controls, route
  expansion beyond `/s/[token]`, new invite modes, or public metadata exposure
  was added.
- `/i/[slug]` remains the recipient URL and stays `noindex,nofollow` with
  generic metadata.
- `/s/[token]` is also `noindex,nofollow` with generic metadata.
- User validation remains incomplete.

## Future, Not Now

Do not implement these during MVP foundation or Core Ask unless explicitly
requested:

- Native mobile app.
- Expo.
- Authentication or user accounts.
- Dashboard.
- Payments or subscriptions.
- Full notifications.
- External messaging delivery.
- Message read receipts.
- Reveal drip.
- Camera.
- Scrapbook.
- Partner offers.
- AI-generated messages.
- Music integrations.
- Embedded maps.
- Geolocation.
- Automatic directions.
- Origin detection.
- Distance or travel-time calculation.
- Map SDK integrations.
- Rate limiting.
- Sender verification.
- Extra modes beyond `lawyer` and `unbothered`.
