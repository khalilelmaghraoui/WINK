# Act II Accepted Experience Production Report

## Deployment Evidence

- Production URL: `https://wink-three.vercel.app/`
- Environment: Production
- Test date: June 9, 2026
- Tester: Codex production smoke
- Local/full main commit tested: `559ad299658880873a143bc0235eb3c4a4613fbf`
- Vercel Production deployment commit: pending independent dashboard
  confirmation. Public headers did not expose a commit SHA, and the deployed
  content matched `origin/main` at `559ad299658880873a143bc0235eb3c4a4613fbf`.
- Existing tag: `alpha-act-i-0.2`
- Automated result: `171/171` tests passing
- Browser/device coverage: desktop Chrome headless screenshots at `320px`,
  `375px`, `768px`, `1024px`, and `1440px`
- Supabase project identifier: `ingfrhrmtyypztztztga`

No live invite slug, full bearer invite URL, private invite content, secrets, or
calendar UID values are committed in this report. Temporary Production QA rows
were removed after verification.

## Pending-State Regression

Result: pass with caveat.

- `/create` loaded successfully in Production.
- A fresh Production invite was created through the deployed `/create` form.
- The generated slug was verified privately against the matching
  `share_slug` row in `public.invites`.
- The exact slug is intentionally redacted because invite URLs are
  bearer/private links.
- The generated `/i/[slug]` route opened successfully.
- `opened_at` was set on first non-preview open and did not change on refresh.
- Compatibility Report appeared in the respondable state.
- Lawyer mode mechanics appeared for the Lawyer test invite.
- Yes, Raincheck, and No controls were present in the respondable state.
- Date/time rendered in human-readable form.
- `/i/[slug]` metadata stayed generic.
- `noindex,nofollow` remained present.

Caveat: a synthetic raw HTTP POST to the deployed server-action form did not
persist the Lawyer Yes response, so browser-click response submission is not
claimed from that synthetic check. Existing server-action behavior remains
covered by the automated Act I flow tests.

## Accepted Reveal

Result: pass.

- Accepted-state Production rows with `status = accepted`, `response = yes`,
  and `responded_at` set rendered the accepted reveal on the same `/i/[slug]`
  URL.
- Refresh preserved the accepted reveal.
- One clear accepted-state heading appeared: `It's a yes.`
- The invitation message appeared.
- Date/time appeared in human-readable local wall-clock format.
- Place name and address rendered naturally without visible database-style
  `Name` or `Address` labels.
- Optional note rendered only when a valid place note existed.
- No visible `null`, `undefined`, `Invalid Date`, `NaN`, or empty detail rows
  appeared in the accepted UI.
- Old pre-response mode heading, signature mechanics, and response controls
  were absent after acceptance.

## Calendar Action

Result: pass by Production rendering plus automated ICS verification; browser
download click remains a manual caveat.

- `Add to calendar` appeared for accepted invites with a valid date.
- Date-only accepted invites rendered the calendar action.
- Invalid or missing date accepted invites omitted the calendar action.
- Automated calendar tests verified floating local timed `.ics` output, all-day
  date-only output, CRLF serialization, escaping, and deterministic output.
- Generated calendar content is covered by tests to exclude invite slug, invite
  URL, sender/recipient names, internal IDs, and private invitation message.
- Calendar generation performs no network request and imports no calendar SDK.
- Calendar status feedback uses accessible status semantics in source and tests.

Caveat: this sprint did not complete a real clicked Production browser download
and calendar import inspection. That should be verified before creating an
Act II alpha tag.

## Maps Action

Result: pass.

- `Open in Google Maps` rendered for accepted invites with location data.
- Place plus address, place-only, and address-only accepted states all produced
  a provider-neutral location link.
- No-location accepted state omitted the maps action.
- The link was present only after the recipient had an accepted plan.
- The link used HTTPS and the Google Maps web search endpoint.
- The link used `target="_blank"`, `rel="noopener noreferrer"`, and
  `referrerPolicy="no-referrer"`.
- The link contained no invite slug, WINK URL, sender/recipient name, private
  message, API key, or tracking parameter.
- Helper disclosure remained visible: the place is shared with Google only
  after the recipient opens the link.
- No external map request occurs during page load; the outbound provider
  request happens only after explicit recipient click.

## Consolidated Action Hierarchy

Result: pass.

- A single `Plan actions` region appeared when at least one action existed.
- Calendar and maps rendered together cleanly in the main accepted case.
- Calendar-only, maps-only, and neither-action cases remained possible.
- The neither-action case omitted the entire action region.
- Actions stacked on mobile and aligned side by side on wider desktop.
- Actions had comparable visual weight.
- Focusable controls retained visible focus styling in source and screenshots.
- The accepted reveal avoided nested-card clutter.
- Visible `Name` and `Address` labels were not rendered in the accepted Place
  section.

## Responsive And Accessibility

Result: pass with minor visual caveat.

Chrome headless screenshots were captured at:

- `320px`
- `375px`
- `768px`
- `1024px`
- `1440px`

Observed:

- Accepted card remained within the viewport.
- Long invitation message wrapped.
- Place name and address wrapped.
- Plan actions stacked on mobile and aligned side by side on desktop.
- Tap targets remained at least 44px where practical.
- Keyboard order follows the visual order by source structure.
- Calendar button and maps link are keyboard reachable by source structure.
- Calendar status feedback uses live/status semantics after activation.
- Meaning does not depend only on color.
- Reduced-motion users lose no information because accepted reveal actions do
  not require animation.

Caveat: at `320px`, the maps helper line is visually tight in the screenshot.
It remained readable in the captured page, but it should be spot-checked on a
real narrow phone before tagging.

## Existing-State Regression

Result: pass by Production state rendering plus automated flow tests.

- Raincheck state rendered safely and did not show calendar/maps actions.
- Declined state rendered safely and kept the Kind Reply Assistant.
- Flagged state rendered safely.
- Calendar/maps actions did not appear outside accepted state in the checked
  Production state renderings.
- Preview mode write blocking, unknown-sender action behavior, and response
  flows remain covered by the automated Act I flow and source-safety tests.

## Privacy And Architecture

Result: pass.

- No service-role key appeared in fetched Production HTML, JavaScript bundles,
  or fetched network responses.
- No `SUPABASE_SERVICE_ROLE_KEY` marker appeared in fetched browser-visible
  assets.
- No `openCount` appeared.
- No analytics request or analytics SDK was found.
- No behavioral device/location/cursor/dwell tracking was found.
- CSS class names containing `hover` or `cursor` were present only as styling
  states, not tracking behavior.
- No geolocation permission path was found.
- No map SDK was present.
- No calendar SDK was present.
- No external map request occurred before explicit link activation.
- No schema or persistence change was made.
- `InviteStore` remains unchanged.
- Supabase adapter remains unchanged.
- Invite metadata remains generic and `noindex,nofollow`.

## Automated Verification

Commands run:

- `npm run lint` - passed
- `npm run typecheck` - passed
- `npm test` - passed, `171/171`
- `npm run build` - passed

Confirmed executed suites include:

- invite date/time
- RevealEngine
- accepted reveal
- calendar event
- Add to Calendar source safety
- location provider
- Open in Maps source safety
- accepted experience consolidation
- existing Act I/privacy tests

## Final Verdict

`ready with caveats`

The accepted experience is technically rendering in Production and automated
verification is clean. Do not create the Act II alpha tag yet until:

- the Vercel Production deployment commit is independently confirmed in the
  Vercel dashboard, and
- a real clicked Production browser calendar download/import check is completed,
  including a narrow-phone spot-check of the `320px` action helper text.

This is an alpha technical milestone. It is not a claim that Act II is complete
or user-validated.
