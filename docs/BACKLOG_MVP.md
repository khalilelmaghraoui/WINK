# WINK MVP Backlog

This backlog is intentionally compact. It keeps future Codex runs aligned on
the MVP sequence without pulling later platform ideas into early slices.

## Sprint 0 - Foundation

Status: implemented.

Deliverables:

- Next.js 14 web app foundation.
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

Status: current sprint.

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

## Sprint 3 - Persistence

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
