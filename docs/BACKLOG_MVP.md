# WINK MVP Backlog

This backlog is intentionally compact. It keeps future Codex runs aligned on
the MVP sequence without pulling later platform ideas into early slices.

## Current Status

Act I MVP is implemented through Sprint 2.3.2. Supabase-backed preview and
Production alpha persistence works through the `InviteStore` boundary when env
vars are configured, with in-memory fallback when they are absent. Vercel
Preview smoke and real-device QA passed, and final Production alpha smoke
passed after Production Supabase env vars were corrected. The closed alpha
feedback pack is ready, and WINK is an Act I alpha candidate for 3-5 trusted
testers. This is not a public launch or production-readiness claim.

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

## Future, Not Now

Do not implement these during MVP foundation or Core Ask unless explicitly
requested:

- Native mobile app.
- Expo.
- Authentication or user accounts.
- Dashboard.
- Payments or subscriptions.
- Full notifications.
- Reveal drip.
- Camera.
- Scrapbook.
- Partner offers.
- AI-generated messages.
- Music integrations.
- Map integrations.
- Extra modes beyond `lawyer` and `unbothered`.
