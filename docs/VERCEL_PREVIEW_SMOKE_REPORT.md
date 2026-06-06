# Vercel Preview Smoke Report

Use this report to capture the real Vercel Preview deployment evidence for
WINK. Do not paste secrets, service-role key values, anon key values, or private
invite content into this file.

## Deployment Evidence

* Preview deployment URL: `https://wink-three.vercel.app/`
* Deployment date: `2026-06-05`
* Branch deployed: `qa/sprint-2.2.1-preview-regression`
* Commit hash: `837f4c292722bc8c492970bc20e3e48ff029c165`
* Vercel project/environment: `Preview`
* Supabase project checked: `ingfrhrmtyypztztztga`
* Supabase table checked: `public.invites`

## Vercel Environment Variables

Configured without exposing values:

* `NEXT_PUBLIC_SUPABASE_URL`
* `SUPABASE_SERVICE_ROLE_KEY`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY` not required for current service-role persistence path

Confirmed absent:

* `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## Supabase Checks

* Project URL configured in Vercel: `pass`
* Service-role key configured as server-only: `pass`
* `public.invites` table exists: `pass`
* RLS enabled on `public.invites`: `pass`
* Broad anon insert/update/delete policies absent: `pass`
* No `openCount` column exists: `pass`
* No tracking columns for device, location, hover, cursor, dwell time, repeated
  opens, or analytics exist: `pass`

## Smoke Checklist Results

Record the outcome after testing against the Vercel Preview URL.

| Check                                                   | Result | Evidence / Notes                                                                                   |
| ------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `/create` opens                                         | `pass` | Creator page loads successfully on Vercel Preview.                                                 |
| Invite creation succeeds                                | `pass` | Invite created successfully from `/create`.                                                        |
| Supabase row inserted                                   | `pass` | Row confirmed in `public.invites`; private invite content not pasted.                              |
| `/i/[slug]` opens on another browser/device             | `pass` | Invite page opens successfully from a separate browser/device session.                             |
| `opened_at` is set once                                 | `pass` | First open sets `opened_at`; refresh does not overwrite the value.                                 |
| Yes updates status                                      | `pass` | Fresh invite updated to `status = accepted`; response path completed.                              |
| Raincheck updates status/counter-offer                  | `pass` | Fresh invite updated to `status = raincheck`; `counter_offer` persisted when provided.             |
| No updates status/kind reply path                       | `pass` | Fresh invite updated to `status = declined`; Kind Reply Assistant visible on declined state.       |
| Metadata is generic                                     | `pass` | Invite metadata remains generic and does not expose private invite content.                        |
| `noindex,nofollow` is present                           | `pass` | `/i/[slug]` rendered metadata includes `noindex,nofollow`.                                         |
| Browser bundle/network does not expose service-role key | `pass` | Page source, loaded JavaScript, and network responses checked; `SUPABASE_SERVICE_ROLE_KEY` absent. |

## Response Flow Evidence

Use fresh invites for each response path.

### Yes

* Invite slug tested: `redacted-yes-slug`
* Same `/i/[slug]` URL rendered accepted state: `pass`
* Supabase status: `accepted`
* Supabase response: `yes`
* `responded_at` set: `pass`

### Raincheck

* Invite slug tested: `redacted-raincheck-slug`
* Same `/i/[slug]` URL rendered `Raincheck sent.`: `pass`
* Supabase status: `raincheck`
* Supabase response: `raincheck`
* `counter_offer` persisted when provided: `pass`

### No

* Invite slug tested: `redacted-no-slug`
* Same `/i/[slug]` URL rendered declined state: `pass`
* Kind Reply Assistant appeared on declined state: `pass`
* Supabase status: `declined`
* Supabase response: `no`
* `responded_at` set: `pass`

## Metadata And Privacy Evidence

* `/i/[slug]` uses `noindex,nofollow`: `pass`
* Open Graph/Twitter preview is generic: `pass`
* Sender name absent from metadata: `pass`
* Recipient name absent from metadata: `pass`
* Message absent from metadata: `pass`
* Date/time/place/address absent from metadata: `pass`
* Service-role key absent from page source: `pass`
* Service-role key absent from JavaScript bundles: `pass`
* Service-role key absent from network responses: `pass`

## Sprint 2.2 Post-Polish Regression

Use this section after deploying the Sprint 2.2 polish changes to Vercel
Preview. Do not paste secrets or private invite content.

### Regression Evidence

* Preview deployment URL: `https://wink-three.vercel.app/`
* Branch deployed: `qa/sprint-2.2.1-preview-regression`
* Commit hash: `837f4c292722bc8c492970bc20e3e48ff029c165`
* Regression date: `2026-06-05`
* Tester: `Khalil`

### Devices And Browsers Tested

| Device / Browser     | Result | Notes                                                            |
| -------------------- | ------ | ---------------------------------------------------------------- |
| iPhone Safari        | `pass` | Act I flow renders correctly; no mobile layout blocker found.    |
| iPhone Chrome mobile | `pass` | Act I flow renders correctly; no mobile layout blocker found.    |
| Android Chrome       | `pass` | Act I flow renders correctly; no Android-specific blocker found. |
| Desktop Chrome       | `pass` | Act I flow renders correctly; no desktop blocker found.          |

### Post-Polish Checklist

| Check                                                 | Result | Evidence / Notes                                                                     |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `/create` opens                                       | `pass` | Creator page loads successfully on Vercel Preview.                                   |
| Required-field behavior is clear                      | `pass` | Empty submit/validation errors are readable.                                         |
| Share-link path wraps on mobile                       | `pass` | Long generated invite paths wrap without horizontal overflow.                        |
| Copy-link success or fallback works                   | `pass` | Clipboard copy succeeds where supported; fallback remains understandable.            |
| `/i/[slug]` opens from another browser/device         | `pass` | Invite page opens successfully from another browser/device session.                  |
| Long place/address text does not overflow             | `pass` | Long details wrap on small screens.                                                  |
| Lawyer Yes requires approval                          | `pass` | Missing approval shows validation.                                                   |
| Lawyer Raincheck and No do not require approval       | `pass` | Raincheck and No remain available without typed approval.                            |
| Raincheck panel focus moves to heading                | `pass` | Focus moves to panel heading when opened.                                            |
| Raincheck copy is noncommittal                        | `pass` | Copy makes clear Raincheck does not commit the recipient to anything.                |
| Unbothered slot says it cannot answer for recipient   | `pass` | Consent copy is visible in slot panel.                                               |
| Unbothered slot keeps Raincheck visible               | `pass` | Raincheck remains visible and reachable during slot interaction.                     |
| Unbothered slot keeps No visible                      | `pass` | No remains visible and reachable during slot interaction.                            |
| Yes path reaches accepted state                       | `pass` | Same `/i/[slug]` URL renders accepted state.                                         |
| Raincheck path reaches raincheck state                | `pass` | Same `/i/[slug]` URL renders `Raincheck sent.`                                       |
| No path reaches declined state                        | `pass` | Same `/i/[slug]` URL renders declined state.                                         |
| Kind Reply Assistant appears after declined state     | `pass` | Exactly three suggestions visible.                                                   |
| Unknown sender escape reaches flagged state           | `pass` | Flagged state reached; no sender notification sent.                                  |
| Refresh/back behavior does not break living URL state | `pass` | Refresh/back do not create unsafe or inconsistent states.                            |
| No horizontal overflow on mobile                      | `pass` | No sideways scrolling found.                                                         |
| Tap targets are usable on touch devices               | `pass` | Buttons and inputs are comfortable on touch.                                         |
| No console errors                                     | `pass` | No browser console errors found during regression QA.                                |
| Metadata remains generic                              | `pass` | Expected `You have a surprise waiting.`                                              |
| `noindex,nofollow` remains present                    | `pass` | Rendered metadata includes `noindex,nofollow`.                                       |
| Service-role key absent from source/network/bundles   | `pass` | Service-role key not found in page source, JavaScript bundles, or network responses. |

### Known Issues

* No known issues from post-polish regression.

### Readiness Verdict

* Verdict: `ready`
* Reviewer: `Khalil`
* Date reviewed: `2026-06-05`
* Notes:

  * Sprint 2.2 post-polish regression passed on Vercel Preview.
  * Act I creator flow, invite flow, and response paths work on tested devices.
  * Consent guardrails remain intact: Yes, Raincheck, and No remain available and understandable.
  * Metadata remains generic and private invite content is not exposed.
  * Service-role key was not found in browser-visible source, JavaScript bundles, or network responses.
  * WINK is ready for a tiny closed alpha with trusted testers.

## Known Issues

* No known issues from preview smoke.

## Final Readiness Verdict

* Verdict: `ready`
* Reviewer: `Khalil`
* Date reviewed: `2026-06-05`
* Notes:

  * Vercel Preview deployment passed the Act I smoke test.
  * Supabase service-role persistence path works from the deployed preview.
  * Invite creation, opening, Yes, Raincheck, and No flows all work.
  * Metadata remains generic and private invite data is not exposed.
  * Service-role key was not found in browser-visible source, JavaScript bundles, or network responses.
  * Sprint 2.2 post-polish regression passed.
  * Repo is ready to proceed to closed alpha preparation.
