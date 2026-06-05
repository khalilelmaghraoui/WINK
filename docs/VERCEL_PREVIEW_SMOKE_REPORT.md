# Vercel Preview Smoke Report

Use this report to capture the real Vercel Preview deployment evidence for
WINK. Do not paste secrets, service-role key values, anon key values, or private
invite content into this file.

## Deployment Evidence

- Preview deployment URL: `TODO: https://...vercel.app`
- Deployment date: `TODO: YYYY-MM-DD`
- Branch deployed: `docs/sprint-2.1.2-preview-evidence`
- Commit hash: `TODO: commit SHA`
- Vercel project/environment: `Preview`
- Supabase project checked: `TODO: project name or non-secret identifier`
- Supabase table checked: `public.invites`

## Vercel Environment Variables

Configured without exposing values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` if configured for this preview

Confirmed absent:

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## Supabase Checks

- Project URL configured in Vercel: `TODO: pass/fail`
- Service-role key configured as server-only: `TODO: pass/fail`
- `public.invites` table exists: `TODO: pass/fail`
- RLS enabled on `public.invites`: `TODO: pass/fail`
- Broad anon insert/update/delete policies absent: `TODO: pass/fail`
- No `openCount` column exists: `TODO: pass/fail`
- No tracking columns for device, location, hover, cursor, dwell time, repeated
  opens, or analytics exist: `TODO: pass/fail`

## Smoke Checklist Results

Record the outcome after testing against the Vercel Preview URL.

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| `/create` opens | `TODO` | `TODO` |
| Invite creation succeeds | `TODO` | `TODO` |
| Supabase row inserted | `TODO` | Confirm row in `public.invites` without pasting private content. |
| `/i/[slug]` opens on another browser/device | `TODO` | `TODO` |
| `opened_at` is set once | `TODO` | Save first value privately; confirm refresh does not change it. |
| Yes updates status | `TODO` | Expected `status = accepted`, `response = yes`. |
| Raincheck updates status/counter-offer | `TODO` | Expected `status = raincheck` and `counter_offer` populated when provided. |
| No updates status/kind reply path | `TODO` | Expected `status = declined`; Kind Reply Assistant visible on declined state. |
| Metadata is generic | `TODO` | Expected preview text: `You have a surprise waiting.` |
| `noindex,nofollow` is present | `TODO` | Inspect rendered metadata for `/i/[slug]`. |
| Browser bundle/network does not expose service-role key | `TODO` | Search page source, loaded JS, and network responses. |

## Response Flow Evidence

Use fresh invites for each response path.

### Yes

- Invite slug tested: `TODO: slug or redacted slug`
- Same `/i/[slug]` URL rendered accepted state: `TODO: pass/fail`
- Supabase status: `TODO`
- Supabase response: `TODO`
- `responded_at` set: `TODO: pass/fail`

### Raincheck

- Invite slug tested: `TODO: slug or redacted slug`
- Same `/i/[slug]` URL rendered `Raincheck sent.`: `TODO: pass/fail`
- Supabase status: `TODO`
- Supabase response: `TODO`
- `counter_offer` persisted when provided: `TODO: pass/fail`

### No

- Invite slug tested: `TODO: slug or redacted slug`
- Same `/i/[slug]` URL rendered declined state: `TODO: pass/fail`
- Kind Reply Assistant appeared on declined state: `TODO: pass/fail`
- Supabase status: `TODO`
- Supabase response: `TODO`
- `responded_at` set: `TODO: pass/fail`

## Metadata And Privacy Evidence

- `/i/[slug]` uses `noindex,nofollow`: `TODO: pass/fail`
- Open Graph/Twitter preview is generic: `TODO: pass/fail`
- Sender name absent from metadata: `TODO: pass/fail`
- Recipient name absent from metadata: `TODO: pass/fail`
- Message absent from metadata: `TODO: pass/fail`
- Date/time/place/address absent from metadata: `TODO: pass/fail`
- Service-role key absent from page source: `TODO: pass/fail`
- Service-role key absent from JavaScript bundles: `TODO: pass/fail`
- Service-role key absent from network responses: `TODO: pass/fail`

## Known Issues

- `TODO: Add any deployment, browser, Supabase, or smoke-test issue found.`
- If no issues were found, write: `No known issues from preview smoke.`

## Final Readiness Verdict

- Verdict: `TODO: ready / ready with caveats / not ready`
- Reviewer: `TODO`
- Date reviewed: `TODO: YYYY-MM-DD`
- Notes:
  - `TODO`

