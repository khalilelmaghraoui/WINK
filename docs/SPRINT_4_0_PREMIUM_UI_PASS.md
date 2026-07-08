# Sprint 4.0 — Premium UI Pass

**Goal:** WINK should feel like a premium private invitation object, not a form app.

**Scope:** UI/UX only. No route changes, no data model changes, no auth, no dashboard, no notifications, no analytics, no new product features.

**Routes affected:** `/`, `/create`, `/i/[slug]`, `/s/[token]`.

---

## Task 1 — Three visual directions

### Direction 1: Editorial Love Letter

**Concept:** The invitation is a piece of fine stationery that happens to live in a browser. Everything borrows from letterpress printing, wedding suites, and high-end magazine editorial. The screen is paper; the invite is the only object on it.

- **Mood words:** intimate, printed, considered, quiet, warm, adult.

- **Color usage:** Warm paper `#F8F3EA` dominates 80% of every screen. Ivory `#FFFCF7` reserved *only* for the invitation artifact itself — nothing else gets a card. Oxblood `#8F2438` is ink: primary CTA and one accent rule per screen, never washes or gradients. Brass `#C9A24E` appears only as a single hairline rule or ornament on the invitation card — think foil stamp, used once. Teal focus ring only.

- **Typography:** Fraunces at real display sizes (48–72px desktop, 34–40px mobile) with optical-size axis high, tight leading (1.05–1.1) for headings. Inter 14–16px for everything functional. A third role: Fraunces italic at small sizes for "spoken" lines (the invite message), giving the sender's words a distinct voice from UI chrome.

- **Card/layout style:** One dominant object per screen. The invite card has a slightly stronger 1.5px border in a darker paper tone, a brass hairline rule under its header, and generous internal padding (32–40px). Everything else is border-less content sitting directly on the paper background, separated by hairline dividers.

- **Button style:** Rectangular 6px radius, oxblood fill for primary, ivory + 1px border for secondary. Letterpress press-state: on `:active`, background darkens to `primaryHover` with an inset feel via 1px darker top border. No shadows.

- **Micro-interactions:** 150–200ms opacity + 4px translate-y on state reveal. The invite card fades/settles in on load like a card being laid on a table. Nothing loops. Reduced-motion: instant.

- **Lawyer mode feel:** Legal-brief stationery. Small-caps eyebrow ("EXHIBIT A: THE ASK"), numbered clauses, brass rule between "case details." Formal type, playful copy.

- **Unbothered mode feel:** Wide margins, fewer words, lowercase Fraunces heading, single hairline rule. The design itself shrugs.

- **Risks:** Can drift into wedding-invitation stuffiness; humor must come from copy since the visuals are restrained. Beige monotony if the oxblood/brass accents are under-used. This is also currently the most common AI-generated aesthetic (cream + serif + warm accent) — differentiation must come from the *stationery object* framing, not just the palette.

### Direction 2: Playful Micro-Theater

**Concept:** Each invite is a tiny stage play. The page is a proscenium: curtain-like framing devices, a "scene" structure (the ask → the details → your move), theatrical copy labels ("Act I"). The drama lives in structure and language, not motion.

- **Mood words:** staged, witty, dramatic, mischievous, choreographed.

- **Color usage:** Same token palette, but oxblood gets more surface area — a deep oxblood header band or frame acts as the "curtain." Brass used for stage-direction labels. Paper background becomes the "stage floor."

- **Typography:** Fraunces pushed harder — bigger contrasts between huge display lines and tiny small-caps "stage directions" (STAGE LEFT: THE DETAILS). Inter stays for controls.

- **Card/layout style:** Framed compositions — a thin double-border frame around the invitation, scene-numbered sections. More chrome than Direction 1.

- **Button style:** Response buttons presented as a "your move" moment — grouped in a labeled tray with a small-caps header. Same shapes, more theatrical framing.

- **Micro-interactions:** Sequential reveal: header, then message, then details, then responses, staggered 80–120ms apart on first load. The Yes confirmation is a "scene change" — a full crossfade rather than an inline swap.

- **Lawyer mode feel:** Courtroom drama. "The prosecution rests." Naturally excellent here.

- **Unbothered mode feel:** Harder fit — an actor who won't perform. Would need an "empty stage" treatment which risks reading as unfinished.

- **Risks:** Highest risk of tipping into gimmick. Staged reveals fight the "recipient understands the joke in 3 seconds" rule. Unbothered mode fights the whole metaphor. More components, more motion, more code — biggest sprint.

### Direction 3: Private Cinematic Card

**Concept:** The invite is a single lit object in a quiet room. Very dark or dusk-toned framing around a warmly lit card — cinema screen logic. The privacy of the link becomes visual: dim surroundings, one illuminated thing.

- **Mood words:** hushed, lit, nocturnal, focused, secret.

- **Color usage:** Inverts the system — a deep ink/espresso page background `#1A1512`-ish) with the ivory invitation card as the only bright object. Oxblood buttons on ivory. Brass reads as candlelight.

- **Typography:** Same Fraunces/Inter pairing; ivory-on-dark for chrome, ink-on-ivory in the card.

- **Card/layout style:** Small, centered, high-contrast card with a soft warm glow (the one place a shadow is allowed). Everything else recedes.

- **Button style:** As in Direction 1, but contrast-checked against dark chrome.

- **Micro-interactions:** A slow 250ms brightness fade-in on the card, like lights coming up. Nothing else moves.

- **Lawyer mode feel:** Late-night deposition, film noir. Strong.

- **Unbothered mode feel:** Naturally great — dim room, one cool line.

- **Risks:** Directly contradicts the established warm-paper design system — this is a re-skin, not a refinement, so it invalidates existing DESIGN_[SYSTEM.md](http://SYSTEM.md) tokens and all shipped screens. Dark UIs read as "app," not "stationery." Daylight mobile legibility. Glow flirts with the banned shadow rules.

---

## Task 2 — Recommendation: Editorial Love Letter

Pick **Direction 1**, and steal one idea from each of the others.

Reasons:

1. **It's the direction the codebase already committed to.** DESIGN_[SYSTEM.md](http://SYSTEM.md)'s tokens, radius rules, "borders before shadows," and motion rules *are* Editorial Love Letter, executed at ~60%. Sprint 4.0 becomes a refinement pass, not a redesign — lowest risk, no token migration, no re-QA of color contrast across every state.

2. **It serves both modes equally.** Lawyer mode gets legal stationery; Unbothered mode gets minimalist stationery. Micro-Theater breaks on Unbothered; Cinematic breaks the token system.

3. **It's the most "not a dating app" of the three.** Stationery is the strongest possible signal that this is an invitation, not a profile.

4. **It respects the guardrails natively.** Restraint is the aesthetic, so there's no tension between the visual language and "no noisy animations, no dark patterns."

Steal from Direction 2: the **"your move" response tray framing** and the Lawyer-mode small-caps stage-direction labels (already half-present as "EXHIBIT A" energy).

Steal from Direction 3: the **single-lit-object hierarchy** — on `/i/[slug]`, dim everything that isn't the invitation card by using `surfaceMuted` page chrome and letting the card be the only ivory element.

The differentiation risk (cream+serif is a common default) is answered by execution: WINK's cream+serif isn't a landing-page trend, it's literal — the product *is* a piece of stationery. Lean into physical-print details (hairline brass rule, letterpress press states, eyebrow labels styled as printer's marks) that generic cream sites never bother with.

---

## Task 3 — Screen system

Global rules for all screens (from DESIGN_[SYSTEM.md](http://SYSTEM.md), restated as binding for this sprint):

- Spacing: 8px system; mobile padding 20px; desktop 32–48px.

- Max widths: forms 560px, invitation 680px, landing 1120px.

- One ivory card per screen maximum ("one lit object"). No cards inside cards.

- Fraunces only for the hero line and the invitation artifact heading. Everything else Inter.

- Motion: 150–250ms, opacity + ≤8px translate, reduced-motion = instant.

### 3.1 Home `/`

**Layout structure (desktop):** Two-column hero within 1120px — left: eyebrow, display headline, subline, primary CTA + trust line; right: the sample InviteCard. Below: hairline divider → "How it works" three-step row → divider → two-mode row → quiet footer.

**Layout (mobile):** Single column, headline first, sample card second (it's the product demo — don't hide it), then steps, then modes.

**Hierarchy:** 1) headline, 2) sample invite card, 3) CTA, 4) everything else.

**Key copy areas:** eyebrow ("WINK PRIVATE INVITATIONS"), headline ("Make the ask memorable."), subline, CTA label ("Create an invitation"), trust line ("No accounts. No tracking. One private link."). The current alpha caveat ("Act I is technically verified…") should move out of the CTA row — it's internal-status copy leaking into product. Put a single quiet line in the footer or cut it.

**Components:** PageShell, InviteCard (sample, static), ModeBadge, PrimaryButton, SectionDivider, step items (plain content, not cards — remove the current three bordered boxes; three columns separated by whitespace with brass step numerals reads more editorial and kills the "SaaS feature grid" feel).

**Spacing:** 96px between major sections desktop, 56px mobile. Hero gets 64px top padding minimum.

**Premium:** the sample card's craft (brass rule, mode badge, Fraunces heading, real response buttons in disabled/preview state). **Simple:** steps and mode descriptions — text on paper, no boxes.

### 3.2 Create `/create`

**Layout structure:** Single centered 560px column. StepIndicator top, Fraunces step title, form fields, button row pinned to natural flow (not sticky). No sidebar, no preview pane in this sprint (a live preview is a new feature — out of scope).

**Hierarchy:** step title > fields > continue. The StepIndicator is quiet metadata, not a progress spectacle.

**Key copy areas:** step titles get one supporting line each in `textSecondary` ("Who's asking, and who's being asked?"). Field helper text where stakes exist (message field: "This is the line they'll read first.").

**Components:** PageShell, StepIndicator, FormField (text, textarea, select, date, time), PrimaryButton, SecondaryButton (Back).

**Spacing:** 24px between fields, 32px between title block and first field, 40px above the button row.

**Mobile:** identical single column; buttons full-width stacked, Continue above Back. Native date/time inputs stay (don't build custom pickers — scope).

**Desktop:** buttons inline, Back left as secondary, Continue right as primary — reading order ends on the primary action.

**Premium:** typography of step titles, focus states, field craft (consistent 44px+ heights, visible labels, teal focus ring). The current step 1–3 screens read as unstyled defaults — the black default buttons must become the oxblood/ivory system.

**Simple:** three steps, no animations between steps beyond a 150ms fade.

**Mode selector fix:** Step 2's "Mode: Choose one" dropdown is the weakest moment in the current flow — the product's personality buried in a `<select>`. Replace with the two-option segmented panel from DESIGN_[SYSTEM.md](http://SYSTEM.md): two compact selectable panels, each with mode name + one sample line ("Lawyer — *I have a small case to make.*" / "Unbothered — *no pressure. some pressure.*"). Selected state = oxblood border + surfaceMuted fill. Same for Tone if the option count is ≤4; otherwise keep the select but style it.

### 3.3 Recipient invite `/i/[slug]` (pending state)

The most important screen in the product. Treat as a lit object on a dim table.

**Layout structure:** Page background can shift one step warmer/darker `surfaceMuted` wash or a subtle vertical tint) so the ivory card is the only bright surface. Centered 680px InviteCard containing: mode badge (top-right), eyebrow ("A private invitation for Sam"), Fraunces headline (the ask), the sender's message in Fraunces italic, hairline brass rule, details grid (2×2: date type / when / place / tone), rule, ResponseButtonGroup, then below the card (outside it, quiet): "I don't know this person" escape link and the privacy line.

**Hierarchy:** headline > message > details > responses. The recipient understands the joke in 3 seconds because the headline *is* the joke.

**Key copy areas:** headline (mode-generated), message (sender's words, visually distinct as "spoken"), privacy reassurance ("Only you can see this page. Your answer sends one status update — nothing else.").

**Components:** PageShell (dim variant), InviteCard, ModeBadge, SectionDivider, ResponseButtonGroup, quiet escape link.

**Spacing:** card internal padding 32px mobile / 40px desktop. 24px between content zones inside the card.

**Mobile:** response buttons stack full-width: Yes, Raincheck, No — equal heights (48px), equal visual availability. **Desktop:** three buttons in a row, Yes primary, others secondary; No must be identical in size to Raincheck.

**Premium:** the card as artifact — border craft, brass rule, typography, the entrance settle (200ms fade + 6px rise, once).

**Simple:** the response mechanics. No hover games on No beyond the capped playful interruptions already implemented per mode.

### 3.4 Accepted state (same URL)

**Layout:** Same card, transformed — not a new page. Eyebrow changes to a success-toned "IT'S A DATE" / mode-appropriate line, headline confirms, details restated, then two action buttons: "Add to calendar" (secondary), "Open in Maps" (secondary). No primary button — the decision is done; the card becomes a keepsake/ticket.

**Hierarchy:** confirmation line > details > utility actions.

**Copy:** warm, one beat of delight, no exclamation avalanche. Lawyer: "Verdict: yes." Unbothered: "cool. it's on."

**Premium:** the state transition — a single 200ms crossfade of card content, brass rule stays constant like the card physically stayed and the ink changed. A thin `success`-toned top border on the card is enough color signaling.

**Simple:** calendar/maps as plain secondary buttons, not icon spectacles.

**Mobile:** actions stacked full-width.

### 3.5 Declined state with optional message

**Layout:** Same card. Calm eyebrow ("ANSWERED"), one gracious line ("Sam said not this time — kindly."), then the optional-message composer: one labeled textarea ("Want to say something? Optional, one message."), character guidance, single "Send reply" secondary-styled action, plus "Skip" quiet link. After send/skip: a closing line, no lingering UI.

**Hierarchy:** the kind close > optional message > done.

**Rules made visual:** no guilt copy, no red, no sad-face theatrics. `danger` token is *not* used here — declining is not dangerous. Neutral ink and paper.

**Premium:** the grace. This screen is where "the app can tease but cannot trap" is proven.

**Simple:** everything. This is the quietest screen in the product.

### 3.6 Private sender status `/s/[token]`

**Layout structure:** 680px column. A distinct private-page header treatment: eyebrow "PRIVATE — ONLY YOU HAVE THIS LINK" with a brass hairline above and below (a sealed-document motif — this is the one screen that should feel like opening something confidential). Then StatusCard: status word set in Fraunces ("Pending." / "Opened." / "Accepted." / "Declined." / "Rainchecked." / "Canceled."), one supporting line, details recap. If declined-with-message: the recipient's message in the same "spoken" italic treatment, clearly framed as their words. Below the card: SenderControls (Copy recipient link, Cancel invitation) and PrivateLinkNotice.

**Hierarchy:** status > message (if any) > details > controls.

**Copy:** status lines carry mode tone lightly; the privacy notice is factual, not scary: "Anyone with this link can see this page. WINK can't recover it if lost."

**Components:** PageShell, StatusCard, PrivateLinkNotice, CopyControl, SenderControls (with DangerButton for cancel behind a confirm step), SectionDivider.

**Mobile:** controls stack; Cancel visually separated (divider + spacing) from Copy so it's never fat-fingered.

**Premium:** the confidential-document framing; the status word as a typographic moment.

**Simple:** no timeline, no activity log, no timestamps beyond what exists. One status, stated once — this is the anti-surveillance promise rendered as design.

---

## Task 4 — Component library

All components live in `components/ui/` (or the repo's existing convention — preserve it). All are presentational; no data fetching, no Supabase imports.

**PageShell** — Purpose: consistent page chrome (background, padding, max-width, header/footer slots). Visual: `background` canvas; a `dim` variant using `surfaceMuted` wash for `/i/[slug]`. Props: `maxWidth: 'form' | 'invite' | 'landing'`, `variant: 'default' | 'dim'`. States: none. A11y: `<main>` landmark, skip-link target. Mobile: 20px padding.

**InviteCard** — Purpose: the invitation artifact; the single most crafted component. Visual: `surface` bg, 1.5px border in a darkened `border` tone, 8px radius, brass hairline rule element, 32–40px padding, subtle elevation only. States: preview (home page, responses disabled with "static preview" caption), live, accepted, declined. A11y: `<article>` with `aria-labelledby` on the headline; state changes announced via `aria-live="polite"` region. Mobile: full-width minus padding; no horizontal scroll ever.

**StatusCard** — Purpose: sender-facing status artifact on `/s/[token]`. Visual: same card language as InviteCard but quieter — standard border, status word in Fraunces 32–40px, tone-mapped left border or eyebrow color (success/warning/neutral/danger only for canceled). States: pending, opened, accepted, rainchecked, declined, declined-with-message, canceled. A11y: status as `<h1>`; message quoted in `<blockquote>` with visible attribution. Mobile: single column.

**PrivateLinkNotice** — Purpose: communicates privacy weight of `/s/[token]` and the links screen without fear-mongering. Visual: no card — text block between two brass hairlines, small-caps eyebrow, Inter body. States: static. A11y: not `role="alert"` (it's not an alert); plain content. Mobile: full-width.

**ModeBadge** — Purpose: shows lawyer/unbothered identity. Visual: pill (999px), 1px border, `surfaceMuted` fill, small-caps Inter 12px, brass tint for lawyer, teal tint for unbothered (border/text only, not fills). States: static, selectable (in create flow: adds oxblood border + check when selected). A11y: in selector context it's a radio `role="radio"` within `radiogroup`, or real inputs visually styled); standalone it's decorative-with-text. Mobile: min 44px tap height when selectable.

**ResponseButtonGroup** — Purpose: Yes / Raincheck / No with consent-first mechanics. Visual: Yes = PrimaryButton; Raincheck and No = SecondaryButton, *identical* to each other in size and weight. Small-caps "YOUR MOVE" eyebrow optional per mode. States: default, submitting (all disabled + inline progress on active choice), answered (locked). Playful-interruption behavior stays capped at 2 per existing implementation; visuals never shrink/move the No button. A11y: buttons in DOM order Yes → Raincheck → No; focus is never stolen except the existing post-tap refocus on No; each button ≥44px; not color-only differentiated. Mobile: stacked full-width, 12px gaps.

**CopyControl** — Purpose: display + copy a link. Visual: mono-ish readable URL in a bordered `surfaceMuted` well (wrap, never truncate the middle of the slug), copy button adjacent. States: idle, copied (button label swaps to "Copied" for 2s + `aria-live` confirmation), failed (shows select-manually fallback). A11y: the URL is real selectable text in an `<output>` or read-only input; copy button labeled with which link it copies ("Copy recipient link"). Mobile: button full-width below the well.

**SenderControls** — Purpose: groups copy-recipient-link and cancel actions on `/s/[token]`. Visual: divider-separated section, "Manage" small-caps eyebrow; Cancel is a DangerButton with a one-step inline confirm ("Cancel this invitation? — Yes, cancel / Keep it"), only rendered for pending/opened per existing rules. States: idle, confirming, canceling, canceled (controls replaced by a closing line). A11y: confirm is real focusable buttons, not a hover reveal; destructive action labeled explicitly. Mobile: stacked, 24px separation between copy and cancel zones.

**SectionDivider** — Purpose: editorial rhythm. Visual: 1px `border` hairline; `accent` brass variant reserved for the invitation card and the private-page seal. States: static. A11y: `role="separator"` or plain `<hr>`. Mobile: full-width.

**FormField** — Purpose: label + control + helper + error, one contract for text/textarea/select/date/time. Visual: Inter 14px label always visible above; 44–48px control height; 1px `border`, 6–8px radius, `surface` fill; helper in `textSecondary` below; error in `danger` with icon-independent text. States: default, focus (teal 2px ring, offset 2px), error, disabled. A11y: `htmlForid` wiring, `aria-describedby` for helper/error, `aria-invalid` on error; error text is text, not color alone. Mobile: font-size ≥16px in inputs to prevent iOS zoom.

**StepIndicator** — Purpose: orient within the 3-step create flow. Visual: quiet — "Step 2 of 3" small-caps Inter + three 24px hairline segments, filled oxblood up to current. Not clickable (navigation stays on Back/Continue — no new nav behavior). States: per-step. A11y: `aria-label="Step 2 of 3: Message and mode"`; decorative segments `aria-hidden`. Mobile: same.

**PrimaryButton** — Purpose: the one main action per screen. Visual: oxblood fill, ivory text, 6px radius, 44–48px height, 16–24px horizontal padding, Inter 15–16px medium. States: default, hover `primaryHover`), active (letterpress: `primaryHover` + 1px inset top border), focus-visible (teal ring), disabled `surfaceMuted` fill, `textSecondary` text — still AA), loading (inline spinner + label persists). A11y: contrast-checked in all states; never width-collapses on loading. Mobile: full-width in stacked layouts.

**SecondaryButton** — Purpose: alternate actions with dignity (Raincheck, No, Back, calendar/maps). Visual: `surface` fill, `textPrimary` text, 1px `border`, same dimensions as primary — parity of size is a consent feature. States: mirror primary; hover = `surfaceMuted` fill. A11y: as primary.

**DangerButton** — Purpose: cancel invitation only. Visual: outline style — `danger` text + border on `surface`; fills `danger` only in the confirm step. Never used for "No" (declining an invite is not destructive). States: default, hover (danger-tinted fill 8%), confirming, disabled. A11y: explicit verb labels ("Cancel invitation", "Yes, cancel it").

---

## Task 5 — Implementation plan (Sprint 4.0 for Codex)

**Branch:** `sprint-4.0-premium-ui-pass`. Suggest splitting into three Codex passes so each is reviewable:

**Pass A — Foundation (tokens + primitives)**

1. Verify/extend `tailwind.config.ts` tokens against DESIGN_[SYSTEM.md](http://SYSTEM.md) (all named tokens present as Tailwind colors; spacing scale; radius). No token value changes — codify what's documented.

2. Confirm Fraunces + Inter via `next/font/google` with fallbacks, exposed as CSS variables and Tailwind `fontFamily`.

3. Build `components/ui/`: PrimaryButton, SecondaryButton, DangerButton, FormField, SectionDivider, StepIndicator, ModeBadge, CopyControl, PageShell.

4. Add a `/dev/components` route? **No** — that's new surface area. Verify primitives via unit tests + usage in Pass B instead.

5. Tests: render + state tests for each primitive (focus ring class presence, disabled semantics, copy-control clipboard fallback).

**Pass B — Recipient surfaces (highest value)**

1. Rebuild `/i/[slug]` pending state with InviteCard + ResponseButtonGroup + dim PageShell variant. Preserve all existing server actions, form posts, mode interruption logic, and the reduced-motion branches already in `unbothered-mode.tsx` — this is a re-skin of markup/classes, not behavior.

2. Accepted state: same-card crossfade treatment, calendar/maps as SecondaryButtons.

3. Declined state + optional message composer restyle.

4. Tests: existing 248 must stay green; update any snapshot/markup assertions; add a11y assertions (No button same size class as Raincheck; escape link present; `aria-live` on state change).

**Pass C — Sender + shell surfaces**

1. `/create`: FormField adoption, StepIndicator, segmented mode selector replacing the mode `<select>` (values unchanged — same form field name/values posted).

2. Links-created screen: CopyControl ×2 + PrivateLinkNotice; keep the "cannot recover" warning, restyled.

3. `/s/[token]`: StatusCard, sealed-document header, SenderControls with inline cancel confirm (existing cancel action unchanged).

4. `/` home: hero refinement, de-card the steps section, sample InviteCard in preview state, move alpha-status copy to footer.

5. Tests + browser smoke 320px → desktop, reduced-motion pass, keyboard-only pass.

**Hard constraints to state verbatim in every Codex prompt:**

- Do not change routes, route params, redirects, or file locations of pages.

- Do not change server actions, form field names, posted values, or the data model.

- Do not add auth, dashboards, notifications, analytics, previews, new modes, or any new product feature.

- Do not add dependencies (no framer-motion, no component libraries — Tailwind transitions only).

- Do not track opens, hovers, cursors, devices, or locations. No new timestamps.

- Preserve `prefers-reduced-motion` branches; all new motion must have a reduced-motion path.

- All 248 existing tests must pass; update assertions only where markup legitimately changed.

**Exit gate for Sprint 4.0:**

- All four routes visually consistent with this spec at 320px, 375px, 768px, 1280px.

- Keyboard-only walkthrough of the full loop (create → recipient answer → sender status) succeeds with visible focus at every stop.

- No/Raincheck/Yes have equal size and equal reachability on `/i/[slug]`.

- Reduced-motion produces zero decorative movement.

- No new dependencies in `package.json` diff.

- Lighthouse a11y ≥ 95 on `/i/[slug]` and `/create`.

---

## Explicitly not in this sprint

Live invite preview in `/create`, custom date/time pickers, dark mode, illustrations/iconography systems, OG-image work, sound, confetti, new modes, animation libraries, `/dev` playground routes, copy rewrites beyond what's specified per screen.