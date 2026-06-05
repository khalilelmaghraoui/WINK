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

## Supabase Preparation

1. Run the SQL from `docs/SUPABASE_SCHEMA.md`.
2. Enable RLS on `public.invites`.
3. Do not add broad anon insert/update/delete policies for preview.
4. Confirm writes still work through the Vercel app because server actions use
   the service-role provider code.

## Post-Deployment Smoke Checklist

Run this against the Vercel preview URL.

### Create

1. Open `/create`.
2. Create a Lawyer invite.
3. Confirm a `/i/[slug]` link is shown.
4. In Supabase, confirm one row was inserted into `public.invites`.
5. Confirm:
   - `status` is `pending`.
   - `phase` is `sent`.
   - `opened_at` is null.
   - `no_tap_count` is `0`.

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
2. Open `/i/[slug]`.
3. Submit No.
4. Confirm the same URL renders the declined state.
5. Confirm Supabase has:
   - `status = declined`
   - `phase = responded`
   - `response = no`

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

## In-Memory Fallback Check

For local development only:

1. Remove `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` from
   `.env.local`.
2. Restart `npm run dev`.
3. Create an invite.
4. Confirm no Supabase row is inserted.
5. Confirm the invite works only within the current local server process.

## Known Preview Tradeoff

WINK still uses invite slugs as bearer links. Anyone with a valid `/i/[slug]`
URL can open and respond to that invite. The service-role path protects the
database from direct broad anon writes, but it does not add authentication or
recipient identity.
