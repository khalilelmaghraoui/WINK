# Production Persistence Safety

Sprint 3.4 makes invite persistence fail closed in deployed environments. Local
development and automated tests may still use in-memory storage when Supabase
credentials are absent, but Vercel Preview and Production must use Supabase.

## Required Deployed Variables

Set these for Vercel Preview and Production:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never paste real values into docs,
source control, screenshots, issue comments, or browser-visible code.

## Optional For Current Server Persistence

These are not required for the current server-mediated invite persistence path:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

They may be configured for future safe public reads, but they do not replace
the server-only service-role key for current invite writes.

## Forbidden

Never configure:

```env
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key must not be exposed to browser source, JavaScript bundles,
client-exposed environment variables, logs, network responses, or metadata.

## Environment Behavior

- Local development without Supabase credentials: uses in-memory storage.
- Automated tests without Supabase credentials: use in-memory storage.
- Local development with `NEXT_PUBLIC_SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`: uses Supabase.
- Vercel Preview without complete Supabase credentials: fails closed with a
  safe temporary-service message.
- Vercel Production without complete Supabase credentials: fails closed with a
  safe temporary-service message.
- Vercel Preview and Production with complete Supabase credentials: use
  Supabase persistence.

Changing Vercel environment variables requires a new deployment before the app
runtime sees the updated values.

Previously created in-memory invite links cannot be recovered after a process
restart or deployment. If a deployed environment accidentally created such a
link before Sprint 3.4, create a fresh invite after Supabase variables are
configured.

## User-Facing Failure Behavior

When deployed persistence is not configured:

- `/create` does not return a share link.
- `/create` shows:
  `Invitation service is temporarily unavailable. Please try again later.`
- `/i/[slug]` shows a temporary unavailable state:
  `This invitation could not be loaded right now.`
- A genuinely unknown slug still shows the existing invite-not-found state.

No user-facing message mentions Supabase, Vercel, service-role keys,
environment-variable names, stack traces, or internal error codes.

## Safe Verification

After configuring Vercel Preview or Production:

1. Create a fresh invite from `/create`.
2. Verify the exact generated slug privately in `public.invites.share_slug`.
3. Open the generated `/i/[slug]` from another browser/device.
4. Confirm `opened_at` is set once.
5. Confirm the app never returns a success link without a matching Supabase row.
6. Confirm browser source, JavaScript bundles, and network responses do not
   expose `SUPABASE_SERVICE_ROLE_KEY`.

Do not publish the exact slug, full invite URL, private invite content, sender
or recipient names, messages, addresses, or secret values in committed evidence.

## Architecture Notes

- Persistence selection stays behind the `InviteStore` boundary.
- Browser/UI files do not import Supabase directly.
- Browser/UI files do not read deployment variables.
- Supabase access remains server-mediated.
- No database schema change is required for this safety behavior.
- No authentication, dashboard, notifications, analytics, rate limiting,
  invite expiry, health endpoint, or monitoring SDK is added by Sprint 3.4.
