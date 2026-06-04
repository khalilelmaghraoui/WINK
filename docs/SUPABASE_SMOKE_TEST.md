# Supabase Smoke Test

Use this checklist to verify the real Supabase-backed storage path after
Sprint 2.0. The automated tests do not require real Supabase credentials, so
this manual pass is the proof that a configured project works end to end.

## 1. Create A Supabase Project

1. Create a Supabase project.
2. Open the SQL editor.
3. Run the table SQL from `docs/SUPABASE_SCHEMA.md`.
4. For local smoke only, run the RLS smoke policies from
   `docs/SUPABASE_SCHEMA.md`.
5. Confirm the `public.invites` table exists.

Do not use production data for this smoke pass.

## 2. Add Local Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Do not commit `.env.local`.

Restart the dev server after editing `.env.local`:

```bash
npm run dev
```

## 3. Confirm Store Selection

With both env vars present, the app should use `SupabaseInviteStore`.

With either env var missing, the app should use `InMemoryInviteStore`.

Automated coverage:

```bash
npm test
```

The `supabase-invite-store` tests verify this selection without needing real
credentials.

## 4. Create Invite Smoke

1. Open `/create`.
2. Create a Lawyer invite.
3. Copy the generated `/i/[slug]` path.
4. In Supabase Table Editor, confirm one row appears in `public.invites`.
5. Confirm:
   - `share_slug` matches the path slug.
   - `status` is `pending`.
   - `phase` is `sent`.
   - `opened_at` is null.
   - `response` is null.
   - `no_tap_count` is `0`.

## 5. Open Invite Smoke

1. Open `/i/[slug]`.
2. Refresh the Supabase row.
3. Confirm:
   - `opened_at` is now set.
   - `status` is `opened`.
   - `phase` is `opened`.
4. Save the `opened_at` value.
5. Refresh `/i/[slug]`.
6. Refresh the Supabase row.
7. Confirm `opened_at` did not change.

## 6. Yes Response Smoke

1. Use the same invite if it is still respondable, or create a fresh invite.
2. Submit Yes.
3. Confirm the same `/i/[slug]` URL renders the accepted state.
4. In Supabase, confirm:
   - `status` is `accepted`.
   - `phase` is `responded`.
   - `response` is `yes`.
   - `responded_at` is set.

## 7. Raincheck Smoke

1. Create a second invite.
2. Open `/i/[slug]`.
3. Open the Raincheck panel.
4. Select `Different day`.
5. Add a note such as `Maybe next week?`.
6. Add a suggested day.
7. Submit Raincheck.
8. Confirm the same `/i/[slug]` URL renders `Raincheck sent.`
9. In Supabase, confirm:
   - `status` is `raincheck`.
   - `phase` is `responded`.
   - `response` is `raincheck`.
   - `counter_offer` contains `selectedOption`, `message`, and
     `proposedDateIso`.

## 8. No Response Smoke

1. Create a third invite.
2. Open `/i/[slug]`.
3. Submit No.
4. Confirm the same `/i/[slug]` URL renders the declined state.
5. In Supabase, confirm:
   - `status` is `declined`.
   - `phase` is `responded`.
   - `response` is `no`.
   - `responded_at` is set.

## 9. Unknown Sender Flag Smoke

1. Create a fourth invite.
2. Open `/i/[slug]`.
3. Click `I do not know this person`.
4. Confirm the same `/i/[slug]` URL renders the flagged state.
5. In Supabase, confirm:
   - `status` is `flagged`.
   - `phase` is `closed`.
   - `unknown_sender_flagged_at` is set.
6. Confirm no sender notification was sent.

## 10. Preview Mode Smoke

1. Open an invite with `/i/[slug]?previewMode=true`.
2. Try opening, Yes, Raincheck, No tap, slot confirmation, and unknown-sender
   flag interactions.
3. Confirm the Supabase row does not change.

## 11. In-Memory Fallback Smoke

1. Stop the dev server.
2. Temporarily remove one or both Supabase env vars from `.env.local`.
3. Restart the dev server.
4. Create an invite.
5. Confirm no new Supabase row is inserted.
6. Confirm the invite works only within the current local server process.
7. Restore `.env.local` when done.

## 12. Security Checks

Confirm:

- `/i/[slug]` metadata is still generic and `noindex,nofollow`.
- No sender name, recipient name, message, date, time, place, or address appears
  in metadata.
- No `openCount` column exists.
- No device, location, hover, cursor path, dwell-time, repeated-open, or
  analytics fields exist.
- Supabase imports appear only in provider/adapter code.
- RLS smoke policies are not treated as production-safe.

## Expected Result

The app behaves the same as the in-memory Act I flow, but rows persist in
Supabase across server restarts.
