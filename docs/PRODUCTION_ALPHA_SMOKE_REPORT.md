# Production Alpha Smoke Report

This report records the final Production environment smoke verification for
the WINK Act I alpha candidate. Do not paste service-role key values, anon key
values, private invite content, sender or recipient names, full invite URLs,
messages, date details, or addresses into this file.

## Deployment Evidence

- Production URL: `https://wink-three.vercel.app/`
- Environment: `Production`
- Git tag: `alpha-act-i-0.1`
- Main commit tested: `d3d698b4dafe7af02995eed4d7f81e94d2040850`
- Supabase project checked: `ingfrhrmtyypztztztga`
- Supabase table checked: `public.invites`
- Date tested: `2026-06-08`
- Tester: `Khalil`

## Production Environment Correction

The final alpha smoke found that the Production deployment needed Supabase
environment variables configured separately from the earlier Preview checks.
Production env vars were corrected before this smoke pass.

Configured without exposing values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` if present for future safe public reads

Confirmed absent:

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## Invite Creation Evidence

- A fresh production invite was created from `/create`: `pass`.
- The generated invite slug is intentionally redacted:
  `redacted-production-alpha-slug`.
- The exact generated slug was manually verified against the matching
  `share_slug` row in `public.invites`: `pass`.
- The exact slug is not committed because invite URLs are bearer/private links.
- No private invite content, sender or recipient names, message, date details,
  or address are recorded in this report.

## Production Smoke Results

| Check | Result | Evidence / Notes |
| --- | --- | --- |
| `/create` opens | `pass` | Production creator page loaded successfully. |
| Invite creation succeeds | `pass` | Fresh production invite created successfully. |
| Exact generated `share_slug` appears in `public.invites` | `pass` | Exact slug manually matched to the Supabase row; slug redacted from repo evidence. |
| Generated `/i/[slug]` opens from another browser/device | `pass` | Route opened successfully from another browser/device using the generated link. |
| `opened_at` is set once | `pass` | First open set `opened_at`; refresh did not overwrite it. |
| Yes persists | `pass` | Fresh invite transitioned to `accepted` with `response = yes`. |
| Raincheck and counter-offer persist | `pass` | Fresh invite transitioned to `raincheck`; `counter_offer` persisted when provided. |
| No persists | `pass` | Fresh invite transitioned to `declined` with `response = no`. |
| Unknown-sender flag persists | `pass` | Fresh invite transitioned to `flagged`; no sender notification was sent. |
| Metadata remains generic | `pass` | Metadata did not expose sender, recipient, message, date, time, place, or address. |
| `noindex,nofollow` remains present | `pass` | Invite page metadata included `noindex,nofollow`. |
| Service-role key absent from browser source | `pass` | Service-role key was not found in page source. |
| Service-role key absent from JavaScript bundles | `pass` | Service-role key was not found in loaded JavaScript bundles. |
| Service-role key absent from network responses | `pass` | Service-role key was not found in browser-visible network responses. |
| No analytics/tracking requests appear | `pass` | No analytics, device, location, hover, cursor, dwell-time, or repeated-open tracking requests were observed. |

## Safety And Architecture Confirmation

- Supabase remains behind the `InviteStore` interface.
- Browser/UI files do not import Supabase directly.
- `SUPABASE_SERVICE_ROLE_KEY` remains server-only.
- No `openCount` exists.
- No behavioral analytics were added.
- Metadata remains generic.
- No and Raincheck remain visible and consent-safe.

## Final Production Alpha Smoke Result

- Result: `pass`.
- WINK Act I alpha candidate is ready for 3-5 trusted closed alpha testers.
- This is not a public launch.
- This is not a production-readiness claim.
- Sprint 2.4 remains deferred until real tester feedback exists.
