# Home Page Production Smoke Report

This report records the Production smoke check for the Sprint 2.6 minimal WINK
entry page. Do not paste service-role key values, anon key values, private
invite content, full invite URLs, live bearer invite slugs, sender or recipient
names, messages, date details, or addresses into this file.

## Deployment Evidence

- Production URL: `https://wink-three.vercel.app/`
- Vercel environment: `Production`
- Test date: `2026-06-08`
- Tester: `Codex on Khalil's workstation`
- Expected short commit: `894ea42`
- Expected full commit from local `HEAD` and `origin/main`:
  `894ea42485c548a6cc19596b4f24137299614759`
- Vercel deployed commit independently confirmed: `pending`
- Existing tag before this smoke: `alpha-act-i-0.1`
- Planned tag after successful smoke closure: `alpha-act-i-0.2`

Notes:

- The public Production deployment rendered the Sprint 2.6 homepage content.
- `origin/main` points to `894ea42485c548a6cc19596b4f24137299614759`.
- Public Vercel response headers and the deployed page did not expose a commit
  SHA.
- A Vercel CLI inspection attempt timed out, so this report does not claim that
  the Vercel deployment commit was independently confirmed.
- No secrets, private invite content, or live invite URL are recorded here.

## Homepage Checks

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| `/` returns successfully | `pass` | Production homepage returned `200` through Vercel. |
| WINK wordmark appears | `pass` | Header wordmark rendered. |
| Hero headline appears | `pass` | `Make the ask memorable.` rendered as the single `h1`. |
| Primary CTA links to `/create` | `pass` | Header, hero, and final CTAs link to `/create`. |
| Static sample invitation appears | `pass` | Fictional sample invitation card rendered with Alex/Sam content. |
| Sample invitation is non-interactive | `pass` | Sample preview has no form, buttons, server action, fetch call, or invite link. |
| 3-step Create / Share / Answer section appears | `pass` | How-it-works section rendered. |
| Lawyer mode appears | `pass` | Lawyer mode preview rendered. |
| Unbothered mode appears | `pass` | Unbothered mode preview rendered. |
| No additional modes appear | `pass` | CEO, Desperate, Scratch, and Classic absent. |
| Final CTA links to `/create` | `pass` | Final CTA href is `/create`. |
| No login/signup/dashboard/pricing/testimonials appear | `pass` | Forbidden account, SaaS, pricing, and social-proof copy absent. |
| No real invite slug appears | `pass` | No `/i/` bearer link appears on `/`. |
| No Supabase or InviteStore browser behavior is introduced | `pass` | Homepage HTML and loaded scripts did not contain `InviteStore`, Supabase service-role names, or service-role key values. |
| No console errors appear | `pass` | Browser console error log was empty during homepage smoke. |

## Responsive Checks

| Viewport | Result | Evidence / Notes |
| --- | --- | --- |
| `320px` | `pass` | No horizontal overflow; CTA reachable; sample card fits; typography readable; mode cards stack. |
| `375px` | `pass` | No horizontal overflow; CTA reachable; sample card fits; typography readable; mode cards stack. |
| `768px` | `pass` | No horizontal overflow; CTA reachable; sample card fits; spacing remains usable. |
| `1024px` | `pass` | No horizontal overflow; CTA reachable; mode cards align correctly. |
| Wide desktop | `pass` | No horizontal overflow; layout remains constrained and readable. |

## Typography Checks

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| Fraunces is used for display/headings | `pass` | `app/layout.tsx` imports `Fraunces` via `next/font/google`; production HTML includes Next font assets. |
| Inter is used for body/interface copy | `pass` | `app/layout.tsx` imports `Inter` via `next/font/google`; body uses the registered font variable. |
| Fonts load through the Next.js font mechanism | `pass` | Production HTML includes Next-managed `font/woff2` assets and font variable classes. |
| No raw external Google Fonts stylesheet is added | `pass` | No `fonts.googleapis.com` stylesheet was found. |
| Fallback rendering remains usable | `pass` | Tailwind font families include Georgia/serif and Arial/Helvetica/sans-serif fallbacks. |

## Accessibility Checks

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| One logical `h1` | `pass` | Production DOM has one `h1`: `Make the ask memorable.` |
| Heading hierarchy is logical | `pass` | Sections use `h2` and mode/step cards use lower headings. |
| Links have clear accessible names | `pass` | CTAs use visible descriptive text. |
| Keyboard focus is visible | `source-verified` | CTA links include `focus-visible:outline` and `focus-visible:outline-wink-focus`; in-app browser Tab simulation did not move focus from `body`, so this was not fully observed interactively. |
| All CTAs are keyboard reachable | `source-verified` | CTAs are semantic links with `href="/create"`. |
| Tap targets remain usable | `pass` | CTAs use `min-h-11`; responsive checks found them reachable. |
| Reduced-motion mode preserves understanding | `source-verified` | Global reduced-motion CSS disables decorative motion; homepage meaning does not depend on motion. |
| Sample invitation is not exposed as an active form | `pass` | Sample response labels are spans inside an `aria-hidden` visual row; no form or buttons are present. |
| Contrast remains readable | `pass` | Design-system tokens were used on warm paper/ivory surfaces; no unreadable contrast issue was observed. |

## Metadata Checks

### Root `/`

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| Title describes WINK | `pass` | Title: `WINK - Make the ask memorable`. |
| Description describes the public product | `pass` | Description: `Create a playful private invitation link for a date, apology, surprise, or romantic moment.` |
| No invite data appears | `pass` | Root metadata contains no invite slug, sender, recipient, message, date, time, place, or address. |

### `/i/[slug]`

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| Invite metadata remains generic | `pass` | Description and Open Graph description are `You have a surprise waiting.` |
| `noindex,nofollow` remains present | `pass` | Production invite page rendered `noindex, nofollow`. |
| Sender name absent from metadata | `pass` | No sender name appeared in metadata. |
| Recipient name absent from metadata | `pass` | No recipient name appeared in metadata. |
| Message/date/place/address absent from metadata | `pass` | Private invite details did not appear in metadata. |

## Existing Product Regression

A fresh fake Production invite was created through `/create` for this smoke.
The exact generated slug was verified privately and is intentionally redacted
because invite URLs are bearer/private links.

Redacted evidence label: `redacted-homepage-alpha-smoke-slug`

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| Homepage CTA reaches `/create` | `pass` | Header CTA navigation reached `/create`. |
| `/create` loads | `pass` | Creator page loaded without console errors. |
| Invite creation succeeds | `pass` | Fake production invite was created from the form. |
| Generated slug appears in `public.invites` | `pass` | Exact slug was privately matched to one `share_slug` row. |
| Exact slug is redacted from committed docs | `pass` | No live bearer slug is recorded. |
| Generated `/i/[slug]` opens from another browser/tab | `pass` | Invite page opened successfully; no `Invite not found` regression. |
| `opened_at` is set once | `pass` | First open set `opened_at`; refresh/query check observed the same value. |
| Supabase persistence remains functional | `pass` | Row persisted with `status = opened` after first open. |
| Service-role key absent from browser source | `pass` | Homepage, `/create`, and redacted invite HTML did not contain the key value or env var name. |
| Service-role key absent from JavaScript bundles | `pass` | Loaded JS assets for homepage, `/create`, and redacted invite page did not contain the key value or env var name. |
| Service-role key absent from network responses | `partial` | Browser-visible HTML and loaded JS responses were checked; full DevTools network export was not captured by Codex. |

It was not necessary to repeat all Yes/Raincheck/No paths because Sprint 2.6
did not change those files and the fresh invite create/open regression passed.

## Privacy And Safety

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| No `openCount` | `pass` | Homepage, `/create`, invite HTML, and loaded scripts did not contain `openCount`; existing source tests still cover this. |
| No analytics | `pass` | No analytics markers were found in checked browser-visible HTML or loaded scripts. |
| No device/location/hover/cursor/dwell-time tracking | `pass` | No tracking fields or requests were introduced by the homepage. |
| No direct Supabase import in homepage files | `pass` | `app/page.tsx` does not import Supabase. |
| No private invite content on `/` | `pass` | Root page uses only fictional sample content. |
| No and Raincheck behavior unchanged | `pass` | Sprint 2.6 did not modify recipient response files. |
| Unknown-sender behavior unchanged | `pass` | Sprint 2.6 did not modify the unknown-sender flow. |
| Preview mode remains write-blocked | `pass` | Sprint 2.6 did not modify preview-mode behavior; automated tests remain passing. |

## Automated Checks

Run after documentation updates:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Final Verdict

Verdict: `ready with caveats`.

The homepage smoke, responsive checks, typography checks, metadata checks,
fresh Production invite creation, Supabase row verification, and automated
checks passed. However, the exact Vercel Production deployment commit was not
independently confirmed from Vercel metadata. The deployed content matches the
Sprint 2.6 homepage and `origin/main` points to the expected full commit, but
the release tag should wait until a human confirms the Production deployment
commit in Vercel.

Safe to create `alpha-act-i-0.2`: `not yet`.
