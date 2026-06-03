# AGENTS.md

## Canonical Repository Instructions

This root `AGENTS.md` is the canonical Codex instruction file for Frisson /
DateCard. If older instruction copies exist elsewhere, prefer this root file.

## Project Identity

Frisson is a romantic invitation microsite builder, not a dating app. It lets a
sender create a cinematic private invitation link for a date, apology, surprise,
or romantic moment. The recipient opens the link in a browser and answers.

The product strategy is to prove the core invitation loop before expanding into
a broader platform.

Core loop:

1. Ask.
2. Reveal.
3. Date.
4. Memory.
5. Next invite.

Build Act I first. Validate invite sharing and recipient response before
expanding.

## Current Scope

Sprint 0 foundation is implemented:

- Next.js 14 app foundation.
- TypeScript.
- Tailwind CSS.
- App Router.
- ESLint.
- Invite primitive/domain model.
- In-memory `InviteStore`.
- Slug generator.
- Route skeletons.
- Privacy metadata baseline.
- Tests for core Sprint 0 behavior.

Sprint 0.1 is documentation alignment only:

- Root `AGENTS.md`.
- Non-empty `docs/BACKLOG_MVP.md`.
- Local `docs/FRISSON_CONTEXT.md`.
- No product features.

## Stack

Use:

- Next.js 14.
- TypeScript.
- Tailwind CSS.
- App Router.
- Mock storage first.
- Supabase later only when explicitly requested.

Do not add a backend, database, authentication, Prisma, payments,
notifications, native mobile app, dashboard, or admin panel unless explicitly
requested.

## Architecture Rules

Everything revolves around the Invite primitive.

Feature modules should depend on InviteCore and provider interfaces. No feature
code should import third-party SDKs directly. Provider interfaces protect
against vendor lock-in and keep future Supabase or AI integrations replaceable.

Keep storage behind an `InviteStore` interface so mock storage can later be
replaced by Supabase.

Prefer simple, readable code. Do not create clever abstractions too early. Do
not install new dependencies without explaining why they are needed.

## Routes

Current MVP routes:

- `/` - product entry route, only when explicitly requested by the current
  sprint.
- `/create` - sender creates an invitation.
- `/i/[slug]` - recipient views and responds to an invitation.

Do not add extra routes unless the task explicitly asks for them.

## Domain Model Rules

Allowed invitation modes in MVP:

- `lawyer`
- `unbothered`

Do not add these modes yet:

- `ceo`
- `desperate`
- `scratch`
- `classic`
- any invented mode

Allowed recipient responses:

- `yes`
- `raincheck`
- `no`

Allowed invite statuses:

- `draft`
- `pending`
- `opened`
- `accepted`
- `raincheck`
- `declined`
- `expired`
- `cancelled`
- `flagged`

Do not add other modes, responses, or statuses without explicit instruction.

## Privacy and Safety Rules

These rules are non-negotiable:

- `/i/[slug]` must be `noindex,nofollow`.
- Social previews / Open Graph previews must remain generic.
- Do not expose sender name, recipient name, invitation text, message, place,
  date, time, or address in metadata.
- Use this generic preview text: "You have a surprise waiting."
- Include an "I do not know this person" escape action on the recipient page.
- Flagging unknown sender sends no notification to the sender.
- Do not show or track recipient device, location, IP, hover, cursor path,
  repeated opens, dwell time, exact open timestamp, or open count.
- Never implement `openCount`.
- Refusal must always remain possible and clear.
- The app may be playful, but must never make refusal difficult.

## Behavioral Rules

- `openedAt` may be set only once, on first non-preview open.
- If `openedAt` already exists, never overwrite it.
- `previewMode=true` blocks all writes. No exceptions.
- In preview mode, UI interactions may simulate state but must not persist data.
- The Yes response must keep the recipient on the same `/i/[slug]` URL and show
  the confirmation state there.
- Reduced-motion users must get static fallbacks.
- All controls need accessible names and logical focus order.

## Sprint Order

Sprint 0 - Foundation:

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
- Local `docs/FRISSON_CONTEXT.md`.
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

Sprint 3 - Persistence:

- Supabase adapter behind the existing `InviteStore` interface.
- No direct Supabase imports in feature UI.
- Environment variables.
- Real shareable links.
- Data persistence tests.

Future, not now:

- Native mobile app.
- Expo.
- Authenticated accounts.
- Dashboard.
- Payments.
- Full notifications.
- Reveal drip.
- Camera.
- Scrapbook.
- Partner offers.
- AI-generated messages.
- Music or map integrations.

## Scope Control

Do not implement features without explicit instruction. If a feature is not part
of the requested slice, stop and ask before adding it.

Especially do not add:

- authentication
- login
- user accounts
- sender dashboard
- notifications
- email sending
- SMS sending
- analytics
- tracking
- payment
- subscriptions
- native mobile app
- Expo
- Prisma
- Supabase
- database schema
- admin panel
- AI-generated messages
- Compatibility Report before Sprint 1
- Kind Reply Assistant before Sprint 2
- slot machine
- signature canvas
- excuse generator
- camera
- scrapbook
- music
- maps
- reveal drip
- partners

## Development Rules

Work in small vertical slices.

Before implementation, summarize:

1. What you understood.
2. What files you expect to change.
3. What is explicitly out of scope.

After implementation, report:

1. Files changed.
2. Commands run.
3. Tests/checks passed or failed.
4. Anything not completed.

Always run:

- `npm run lint`
- `npm run typecheck`

When tests exist for the touched area, run them. When visible UI changes are
made, verify the affected route in a browser or with Playwright if available.
