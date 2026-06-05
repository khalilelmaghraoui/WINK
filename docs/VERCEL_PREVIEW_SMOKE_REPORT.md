# Vercel Preview Smoke Report

Use this report to capture the real Vercel Preview deployment evidence for
WINK. Do not paste secrets, service-role key values, anon key values, or private
invite content into this file.

## Deployment Evidence

* Preview deployment URL: `REPLACE_WITH_PREVIEW_URL`
* Deployment date: `2026-06-05`
* Branch deployed: `docs/sprint-2.1.2-preview-evidence`
* Commit hash: `REPLACE_WITH_COMMIT_SHA`
* Vercel project/environment: `Preview`
* Supabase project checked: `REPLACE_WITH_NON_SECRET_PROJECT_NAME_OR_IDENTIFIER`
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
  * Repo is ready to proceed to the next controlled sprint.
