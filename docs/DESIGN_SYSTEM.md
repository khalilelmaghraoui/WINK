# Frisson MVP Design System

Frisson / DateCard is a romantic invitation microsite builder, not a dating app.
The MVP design system should make a private browser invitation feel cinematic,
premium, playful, and safe.

## Brand Personality

Frisson should feel like a tasteful private invitation scene: intimate, lightly
theatrical, and self-aware. The product should invite a moment, not simulate a
relationship, a dating feed, or a dashboard.

Brand qualities:

- Romantic, but not sugary.
- Cinematic, but not heavy.
- Premium, but not sterile.
- Playful, but not childish.
- Emotional, but never manipulative.
- Mobile-first and private by default.
- Elegant, witty, and grounded.

Mode personality:

- `lawyer`: witty, structured, mock-formal, persuasive, and charming.
- `unbothered`: cool, low-pressure, dry, confident, and restrained.

## Color Tokens

Use warm paper as the canvas, oxblood for primary action, brass for restrained
premium accents, and teal as a balancing counter-accent. Avoid letting the UI
become one-note beige, rose, or purple.

| Token | Hex | Use |
| --- | --- | --- |
| `background` | `#F8F3EA` | Page background, warm paper canvas |
| `surface` | `#FFFCF7` | Invitation cards, form panels, raised surfaces |
| `surfaceMuted` | `#EFE7DA` | Subtle section backgrounds and inactive fills |
| `textPrimary` | `#181512` | Main text and headings |
| `textSecondary` | `#6F665D` | Secondary copy and helper text |
| `border` | `#DCD1C2` | Dividers, field borders, card edges |
| `primary` | `#8F2438` | Primary CTAs and accepted emphasis |
| `primaryHover` | `#741A2C` | Primary hover and pressed states |
| `accent` | `#C9A24E` | Small premium accents, rules, selected details |
| `counterAccent` | `#0F5E5D` | Focus rings, balancing highlights |
| `success` | `#2F6B4F` | Confirmation and accepted state |
| `warning` | `#A96F1E` | Raincheck state |
| `danger` | `#8A1F2D` | Declined or safety-related states |
| `focus` | `#0F5E5D` | Keyboard focus ring |

## Typography

Recommended pairing:

- Display and invitation headings: `Fraunces`
- UI, forms, body, and labels: `Inter`

Fallbacks:

- Display: `Georgia`, `serif`
- Body: `Arial`, `Helvetica`, `sans-serif`

Typography rules:

- Use display type sparingly for invitation moments and hero headings.
- Use body type for all form controls, metadata-like text, and buttons.
- Do not use script fonts for core UI.
- Do not use ultra-thin font weights.
- Do not scale font size with viewport width.
- Keep letter spacing at `0`.
- Ensure text fits its container on mobile and desktop.

## Spacing

Use an 8px spacing system:

- `4px` for tiny internal gaps only.
- `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, and `64px` for layout.

Layout rules:

- Mobile page padding: `20px`.
- Desktop page padding: `32px` to `48px`.
- Form max width: `560px`.
- Invitation page max width: `680px`.
- Landing content max width: `1120px`.
- Use mobile-first single-column layouts.
- Keep fixed-format elements stable with explicit dimensions or min-heights.
- Maintain at least `44px` tap targets.

## Border Radius

Keep the interface crisp and adult:

- Cards and panels: `8px` max.
- Buttons and inputs: `6px` to `8px`.
- Small pills or status chips: `999px` only when they are truly pill-shaped.

Avoid oversized rounded rectangles that make the product feel childish or
generic.

## Shadows

Use borders before shadows. When shadows are needed, keep them soft and low
contrast.

Recommended shadow behavior:

- Invitation card: subtle elevation only.
- Buttons: no heavy shadow; use hover and press states instead.
- Modals or overlays, if added later: soft shadow plus clear backdrop.

Avoid:

- Neon glows.
- Large blurry drop shadows.
- Stacked card shadows.
- Glassmorphism-style floating panels.

## Motion Rules

Motion should feel like a quiet film edit, not an app showing off.

Use:

- `150ms` to `250ms` transitions.
- Opacity, small translate, border, and background changes.
- Subtle press states on buttons.
- Gentle state reveal after a `yes` response.

Avoid:

- Heavy parallax.
- Infinite decorative animations.
- Confetti by default.
- Dramatic refusal animations.
- Motion required to understand state.

Respect `prefers-reduced-motion`:

- Disable decorative transforms.
- Keep state changes immediate.
- Preserve focus behavior and status messaging.

## Accessibility Rules

Contrast:

- Body text must meet WCAG AA contrast.
- Primary buttons must pass contrast in default, hover, and disabled states.
- Muted text must not be used for essential information.
- Errors and response states must not rely on color alone.

Focus:

- Every button, link, input, select, and response action needs a visible focus
  state.
- Use the teal focus token for a consistent focus ring.
- Focus states must be visible on warm backgrounds and oxblood buttons.

Reduced motion:

- Respect `prefers-reduced-motion`.
- Do not require animation to understand progress or state.

Mobile:

- Tap targets must be at least `44px`.
- Response buttons need clear spacing.
- Safety-related actions must not be tiny or hidden.

Keyboard:

- Preserve logical tab order.
- Forms, submit actions, response buttons, and escape actions must be keyboard
  reachable.
- Confirmation and error states should use semantic status messaging when
  appropriate.

## Component Rules

### Buttons

- Primary button: oxblood background with ivory text.
- Secondary button: ivory surface, deep ink text, clear border.
- Quiet button or link: text-only or low-emphasis.
- Minimum height: `44px`.
- Radius: `6px` to `8px`.
- Use clear labels for critical actions.
- Do not hide or visually punish the `No` action.
- Do not use emojis as primary icons.

### Cards

- Use cards for invitation artifacts and repeated mode previews only.
- Radius max: `8px`.
- Prefer fine borders over heavy shadows.
- Do not put cards inside cards.
- The invitation card may use a slightly stronger paper edge or accent rule.

### Forms

- Use a single-column layout.
- Keep labels always visible.
- Put helper text below the relevant field.
- Put validation messages close to the field they describe.
- Make required and optional fields clear.
- Keep inputs comfortable on mobile.
- Do not introduce account, payment, or dashboard prompts.

### Mode Selector

- Use a two-option segmented control or two compact option panels.
- Allowed options are only `lawyer` and `unbothered`.
- Show a short sample line for each mode.
- Selected state must be obvious through border, background, and iconography.
- Do not tease locked or future modes in the MVP.

### Invitation Page

- Treat `/i/[slug]` as a private cinematic moment.
- Recipient name may appear in page content but never in metadata.
- Date and place details should be readable, calm, and compact.
- Keep the page focused on invitation content, response actions, and safety.
- Do not show sender analytics, timestamps, device, location, IP, or open count.

### Response Buttons

- `Yes`: primary.
- `Raincheck`: secondary and respectful.
- `No`: visible, accessible, and non-shaming.
- Keep all response options keyboard reachable.
- Do not use dark-pattern ordering, copy, or styling.
- Include an `I do not know this person` escape action.

### Confirmation State

- The accepted confirmation must render on the same `/i/[slug]` URL.
- Clearly show that the invitation was accepted.
- Restate date and place details if available.
- Keep the tone warm, not explosive or manipulative.
- Do not imply notifications, tracking, or sender dashboard behavior.

## Page-Specific Guidance

### `/`

Use a compact product entry page only if explicitly included in the current
slice. The first viewport should show the Frisson name, a direct value
proposition, a primary CTA to create an invitation, and a realistic sample
invitation preview.

Recommended structure:

- Product-first hero with sample invitation as the visual anchor.
- Short explanation of the loop: create, share, answer.
- Two mode previews: `lawyer` and `unbothered`.
- Final CTA to `/create`.

Avoid pricing, testimonials, dashboard screenshots, and generic SaaS sections.

### `/create`

Goal: help the sender create one invitation quickly.

Recommended UX:

- Focused single-column form.
- Fields for recipient name, message or tone, mode, date details, and place
  details.
- Lightweight preview only if it does not complicate the slice.
- Success state shows the generated share link.
- No login prompt, dashboard redirect, payment prompt, or upgrade path.

### `/i/[slug]`

Goal: help the recipient understand the invitation and answer safely.

Required UX:

- Generic social metadata.
- `noindex,nofollow`.
- Invitation content with date and place details.
- Response actions: `Yes`, `Raincheck`, `No`.
- Visible `I do not know this person` escape action.
- After `Yes`, render the confirmation state on the same URL.
- In `previewMode=true`, UI interactions may simulate state but must not write.

## Anti-Patterns To Avoid

- Tinder-like swipes, hearts, match language, or dating-app tropes.
- Cheap pink or purple AI gradients.
- Generic SaaS dashboard aesthetics.
- Dark-pattern refusal UI.
- Hiding, minimizing, or shaming `No`.
- Overly cute illustrations.
- Emojis as primary icons.
- Heavy animation, confetti spam, or parallax.
- Future-mode teasers.
- Login prompts.
- Payment prompts.
- Analytics surfaces.
- Sender surveillance language.
- Exposing private invite details in metadata.
- Showing recipient device, location, IP, exact open timestamp, or open count.
- Adding `openCount` in any form.
- Adding extra statuses, response types, modes, or routes without explicit
  instruction.
