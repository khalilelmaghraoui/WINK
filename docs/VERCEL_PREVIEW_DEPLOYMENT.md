# Vercel Preview Deployment

This checklist prepares WINK for a Vercel Preview deployment using the existing
server-mediated Supabase persistence path. It does not add authentication,
dashboard routes, notifications, payments, or new product flows.

## GitHub Repository

1. Push the branch to GitHub.
2. Confirm `.env.local` is not committed.
3. Confirm `.env.example` includes only placeholder values.
4. Confirm the latest checks pass locally:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Vercel Import

1. In Vercel, choose **Add New Project**.
2. Import the GitHub repository.
3. Keep the framework preset as **Next.js**.
4. Use the default install command unless Vercel changes it:

```bash
npm install
```

5. Set the build command:

```bash
npm run build
```

6. Leave the output directory unset for the Next.js preset.

## Required Preview Environment Variables

Set these for the Vercel **Preview** environment:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional for the current app, but safe to configure for future public read
work:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never add:

```env
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It must not appear in browser
source, JavaScript bundles, client-exposed environment variables, logs, or
network responses.

Sprint 3.4 fail-closed rule: Vercel Preview and Production must not fall back
to in-memory storage. If either `NEXT_PUBLIC_SUPABASE_URL` or
`SUPABASE_SERVICE_ROLE_KEY` is missing or blank, `/create` must not return a
share link and `/i/[slug]` must show a temporary-service message rather than
misclassifying the problem as invite-not-found.

## Supabase Preparation

1. Run the SQL from `docs/SUPABASE_SCHEMA.md`.
2. For existing projects, run
   `supabase/migrations/20260610_private_sender_link_reply.sql` before testing
   Sprint 3.6 branches.
3. Enable RLS on `public.invites`.
4. Do not add broad anon insert/update/delete policies for preview.
5. Confirm writes still work through the Vercel app because server actions use
   the service-role provider code.

## Post-Deployment Smoke Checklist

Run this against the Vercel preview URL.

### Create

1. Open `/create`.
2. Create a Lawyer invite.
3. Confirm a recipient `/i/[slug]` link is shown.
4. Confirm a private sender `/s/[token]` link is shown.
5. In Supabase, confirm one row was inserted into `public.invites`.
6. Confirm:
   - `sender_token_hash` is set.
   - no raw sender token is stored.
   - `status` is `pending`.
   - `phase` is `sent`.
   - `opened_at` is null.
   - `recipient_message` is null.
   - `recipient_message_sent_at` is null.
   - `no_tap_count` is `0`.

### Missing Configuration Fail-Closed Check

Use a disposable Vercel deployment or environment override only:

1. Remove or blank either `NEXT_PUBLIC_SUPABASE_URL` or
   `SUPABASE_SERVICE_ROLE_KEY`.
2. Redeploy.
3. Submit `/create`.
4. Confirm no share link is returned.
5. Confirm the safe message appears:
   `Invitation service is temporarily unavailable. Please try again later.`
6. Open any `/i/[slug]` path.
7. Confirm the temporary unavailable state appears:
   `This invitation could not be loaded right now.`
8. Restore the variables and redeploy before normal smoke testing.

### Open

1. Open `/i/[slug]` in another browser or device.
2. Confirm `opened_at` is set in Supabase.
3. Refresh `/i/[slug]`.
4. Confirm `opened_at` did not change.

### Yes

1. Create a fresh invite.
2. Open `/i/[slug]`.
3. Submit Yes.
4. Confirm the same URL renders the accepted state.
5. Confirm Supabase has:
   - `status = accepted`
   - `phase = responded`
   - `response = yes`
   - `responded_at` set

### Raincheck

1. Create a fresh invite.
2. Open `/i/[slug]`.
3. Submit Raincheck with an option and note.
4. Confirm the same URL renders `Raincheck sent.`
5. Confirm Supabase has:
   - `status = raincheck`
   - `phase = responded`
   - `response = raincheck`
   - `counter_offer` contains the selected option and note

### No

1. Create a fresh invite.
2. Save the private `/s/[token]` link.
3. Open `/i/[slug]`.
4. Submit No.
5. Confirm the same URL renders the declined state.
6. Send one optional WINK message from the declined state.
7. Confirm Supabase has:
   - `status = declined`
   - `phase = responded`
   - `response = no`
   - `recipient_message` set
   - `recipient_message_sent_at` set
8. Open `/s/[token]` and confirm the declined status and optional message are
   visible there.
9. Confirm no email, SMS, push notification, webhook, or external message was
   sent.

### Metadata And Privacy

1. Inspect `/i/[slug]` page metadata.
2. Confirm `noindex,nofollow`.
3. Confirm Open Graph/Twitter preview text is generic:
   `You have a surprise waiting.`
4. Confirm metadata does not expose sender name, recipient name, message, date,
   time, place, or address.

### Secret Exposure

1. Open browser devtools on the preview URL.
2. Search page source and loaded JavaScript for `SUPABASE_SERVICE_ROLE_KEY`.
3. Search network responses for the actual service-role key value.
4. Confirm no `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` exists in Vercel env.
5. Confirm no `app/create/*` or `app/i/[slug]/*` file imports Supabase.
6. Confirm `/s/[token]` source does not import Supabase directly.
7. Confirm `sender_token_hash` is not exposed in browser-visible source,
   JavaScript bundles, or network responses.

## In-Memory Fallback Check

For local development and tests only:

1. Remove `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` from
   `.env.local`.
2. Restart `npm run dev`.
3. Create an invite.
4. Confirm no Supabase row is inserted.
5. Confirm the invite works only within the current local server process.

Do not use in-memory fallback in Vercel Preview or Production.

## Known Preview Tradeoff

WINK still uses invite slugs as bearer links. Anyone with a valid `/i/[slug]`
URL can open and respond to that invite. The service-role path protects the
database from direct broad anon writes, but it does not add authentication or
recipient identity.
