# Supabase Smoke Test

Use this checklist to verify the real Supabase-backed storage path after
Sprint 2.0. The automated tests do not require real Supabase credentials, so
this manual pass is the proof that a configured project works end to end.

## 1. Create A Supabase Project

1. Create a Supabase project.
2. Open the SQL editor.
3. Run the table SQL from `docs/SUPABASE_SCHEMA.md`.
4. For existing projects, also run
   `supabase/migrations/20260610_private_sender_link_reply.sql`.
5. Enable RLS using the preview-safe guidance in `docs/SUPABASE_SCHEMA.md`.
6. Do not add broad anon insert/update/delete policies for Vercel preview.
7. Confirm the `public.invites` table exists.

Do not use production data for this smoke pass.

## 2. Add Local Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Do not commit `.env.local`. Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with
`NEXT_PUBLIC`.

Restart the dev server after editing `.env.local`:

```bash
npm run dev
```

## 3. Confirm Store Selection

With `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` present, the app
should use `SupabaseInviteStore`.

With either the URL or service-role key missing:

- local development and automated tests may use `InMemoryInviteStore`.
- Vercel Preview and Production must fail closed with a safe temporary-service
  message.

The anon key is not enough to select Supabase persistence.

Automated coverage:

```bash
npm test
```

The `supabase-invite-store` tests verify this selection without needing real
credentials.

## 4. Create Invite Smoke

1. Open `/create`.
2. Create a Lawyer invite.
3. Copy the generated recipient `/i/[slug]` path.
4. Save the generated private sender `/s/[token]` path somewhere safe.
5. In Supabase Table Editor, confirm one row appears in `public.invites`.
6. Confirm:
   - `share_slug` matches the path slug.
   - `sender_token_hash` is set.
   - no raw sender token column exists.
   - `status` is `pending`.
   - `phase` is `sent`.
   - `opened_at` is null.
   - `response` is null.
   - `recipient_message` is null.
   - `recipient_message_sent_at` is null.
   - `no_tap_count` is `0`.

## 4A. Private Sender Link Smoke

1. Open the saved `/s/[token]` path.
2. Confirm it renders a private sender status page.
3. Confirm pending/opened status does not reveal an exact opened timestamp.
4. Confirm an invalid `/s/[token]` path renders a generic unavailable state.
5. Confirm the sender token itself does not appear in `public.invites`.

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
2. Save both the recipient `/i/[slug]` link and private sender `/s/[token]`
   link.
3. Open `/i/[slug]`.
4. Submit No.
5. Confirm the same `/i/[slug]` URL renders the declined state.
6. Send one optional kind message through WINK.
7. In Supabase, confirm:
   - `status` is `declined`.
   - `phase` is `responded`.
   - `response` is `no`.
   - `responded_at` is set.
   - `recipient_message` contains only the submitted message.
   - `recipient_message_sent_at` is set.
8. Open `/s/[token]` and confirm the declined status and message appear.
9. Confirm no email, SMS, push notification, webhook, or external message was
   sent.
10. Try sending a second recipient message and confirm the first message is not
    replaced.

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

1. Stop the local dev server.
2. Temporarily remove `NEXT_PUBLIC_SUPABASE_URL` or
   `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`.
3. Restart the dev server.
4. Create an invite.
5. Confirm no new Supabase row is inserted.
6. Confirm the invite works only within the current local server process.
7. Restore `.env.local` when done.

This fallback is local-only. Do not use it to verify Vercel Preview or
Production.

## 12. Security Checks

Confirm:

- `/i/[slug]` metadata is still generic and `noindex,nofollow`.
- No sender name, recipient name, message, date, time, place, or address appears
  in metadata.
- No `openCount` column exists.
- No raw sender-token column exists.
- No device, location, hover, cursor path, dwell-time, repeated-open, or
  analytics fields exist.
- Supabase imports appear only in provider/adapter code.
- `SUPABASE_SERVICE_ROLE_KEY` appears only in server/provider code and docs.
- No `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` appears anywhere.
- No `app/create/*` or `app/i/[slug]/*` file imports Supabase.
- The private sender status route `/s/[token]` does not import Supabase
  directly.
- Browser devtools do not expose the service-role key in page source,
  JavaScript bundles, or network responses.
- Browser devtools do not expose `sender_token_hash`.
- RLS is enabled.
- There are no broad anon insert/update/delete policies.

## 13. Vercel Preview Checks

1. Add these Vercel environment variables for Preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Optional for current server persistence:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Confirm `SUPABASE_SERVICE_ROLE_KEY` is not exposed as a public variable.
4. Deploy a preview.
5. Repeat create/open/respond/flag smoke checks against the preview URL.
6. Confirm a missing or incomplete Preview configuration does not create a
   share link and instead shows the safe temporary-service message.
7. Inspect browser source and built JavaScript for the service-role key.
8. Confirm Supabase table writes still work while anon write policies remain
   absent.

## Expected Result

The app behaves the same as the in-memory Act I flow, but rows persist in
Supabase across server restarts and writes are mediated by server-only provider
code.
