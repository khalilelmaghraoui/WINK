# WINK Act I Alpha Candidate

## Release Status

- Act I MVP implemented.
- Supabase-backed preview persistence working.
- Production Supabase environment configured.
- Production invite persistence verified.
- Vercel Preview smoke passed.
- Final Production alpha smoke passed.
- Real-device QA passed.
- Closed alpha test plan ready.
- Minimal public entry page added.
- Ready for 3-5 trusted testers when testing starts.
- Not public launch.
- Not a production-readiness claim.

## Alpha 0.2 Candidate

- Sprint 2.6 added a restrained root `/` entry page for the already-implemented
  Act I flow.
- The entry page links directly to `/create` and does not change invitation
  creation, recipient response behavior, Supabase persistence, or invite
  metadata.
- Sprint 2.6.1 Production smoke recorded homepage, responsive, typography,
  metadata, and fresh invite create/open evidence.
- Production content matches the Sprint 2.6 homepage and `origin/main` points
  to the expected commit `894ea42`.
- Vercel Production deployment commit confirmation remains pending because the
  public deployment did not expose a commit SHA and CLI inspection timed out.
- No closed-alpha user-validation claim is made.
- Create `alpha-act-i-0.2` only after the Vercel Production deployment commit
  is confirmed.

## Included Flows

- `/create`.
- `/i/[slug]`.
- Lawyer mode.
- Unbothered mode.
- Compatibility Report.
- Yes.
- Raincheck.
- No.
- Kind Reply Assistant.
- Unknown sender escape.
- Generic metadata.
- `noindex,nofollow`.

## Safety And Privacy Guarantees

- No `openCount`.
- No analytics or tracking fields.
- No device, location, hover, cursor, or dwell-time tracking.
- Service-role key is server-only.
- No direct Supabase imports from app/UI files.
- Metadata does not expose invite details.
- No remains clear and available.

## Known Limitations

- Invite links are bearer/private links.
- No auth.
- No dashboard.
- No notifications.
- No account-based product home, dashboard, or authenticated landing flow.
- No Act II reveal drip.
- No maps, music, camera, scrapbook, or partners.
- Closed alpha feedback has not been collected yet.

## Next Deferred Sprint

Sprint 2.4 - Closed Alpha Feedback Triage is deferred until real tester
feedback exists.

## Manual Release Checklist

- Confirm branch merged.
- Confirm Vercel preview URL works.
- Confirm Supabase env vars configured.
- Confirm Production alpha smoke report is filled.
- Confirm smoke docs are filled.
- Confirm real-device QA docs are filled.
- Confirm closed alpha docs exist.
- Confirm no secrets committed.
