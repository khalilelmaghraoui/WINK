# Supabase Schema

Sprint 2.0 adds Supabase persistence behind the existing `InviteStore`
interface. UI components and route handlers continue to import only the store
boundary. Do not import Supabase directly from `app/create/*` or
`app/i/[slug]/*`.

## Environment

Create a local `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Do not commit `.env.local` or real secrets. If either variable is missing, the
app falls back to the in-memory store for local development and tests.

## Local Development Modes

- No Supabase env vars: in-memory persistence, same as earlier MVP sprints.
- Supabase env vars present: `SupabaseInviteStore` is selected automatically.

Normal unit tests do not require a real Supabase project.

## Table: `invites`

The SQL uses snake_case. The TypeScript adapter maps these columns to the
existing camelCase `Invite` model.

```sql
create table if not exists public.invites (
  id uuid primary key,
  share_slug text not null unique,

  sender_name text not null default '',
  recipient_name text not null,
  message text not null,

  tone text not null check (tone in ('cute', 'funny', 'romantic', 'bold')),
  mode text not null check (mode in ('lawyer', 'unbothered')),
  date_type text not null check (
    date_type in ('date', 'apology', 'surprise', 'romantic_moment')
  ),

  date_details jsonb not null default '{}'::jsonb,
  place_details jsonb not null default '{}'::jsonb,

  -- Convenience generated columns for human inspection.
  date text generated always as (
    split_part(coalesce(date_details ->> 'startsAt', ''), 'T', 1)
  ) stored,
  time text generated always as (
    split_part(coalesce(date_details ->> 'startsAt', ''), 'T', 2)
  ) stored,
  place_name text generated always as (place_details ->> 'name') stored,
  place_address text generated always as (place_details ->> 'address') stored,
  dress_hint text generated always as (place_details ->> 'notes') stored,

  status text not null check (
    status in (
      'draft',
      'pending',
      'opened',
      'accepted',
      'raincheck',
      'declined',
      'expired',
      'cancelled',
      'flagged'
    )
  ),
  phase text not null check (
    phase in ('compose', 'sent', 'opened', 'responded', 'closed')
  ),

  response text check (response in ('yes', 'raincheck', 'no')),
  counter_offer jsonb,
  no_tap_count smallint not null default 0 check (
    no_tap_count >= 0 and no_tap_count <= 2
  ),

  created_at timestamptz not null,
  updated_at timestamptz not null,
  opened_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz,
  expired_at timestamptz,
  unknown_sender_flagged_at timestamptz,
  canceled_at timestamptz
);

create index if not exists invites_share_slug_idx
  on public.invites (share_slug);

create index if not exists invites_expires_at_idx
  on public.invites (expires_at)
  where expires_at is not null and expired_at is null;
```

## Row Level Security Review

Sprint 2.0.1 finding: the app currently uses the public anon key from server
code and does not have authentication. That is enough for a local/staging smoke
test, but it is not a strong production access-control model by itself.

With no authenticated sender or recipient identity, table-level RLS cannot prove
that an anon caller "owns" a specific invite. The invite slug acts like a
capability link in the app, but Supabase table policies cannot reliably enforce
"only requests that know this slug can read or update this exact row" unless
the database API is moved behind server-only service-role code or dedicated
security-definer RPC functions.

### Current MVP Smoke Posture

- RLS should be enabled before any non-local testing.
- Anon users may insert invite rows for the `/create` flow.
- Anon users may read invite rows for the `/i/[slug]` flow.
- Anon users may update invite rows for opened/responded/flagged/cancelled/
  expired state transitions.
- Updates are restricted by the application adapter using `share_slug`, but
  broad anon table policies are still callable outside the app if someone has
  the anon key.
- Metadata remains generic in application code and does not read from Supabase.
- There is no `openCount`.
- There are no device, location, hover, cursor, dwell-time, repeated-open, or
  analytics fields.

Use the following policies only for local smoke tests or private staging. They
keep RLS enabled and preserve model constraints, but they are still broad
because there is no auth layer yet.

```sql
alter table public.invites enable row level security;

drop policy if exists "mvp_invites_insert" on public.invites;
drop policy if exists "mvp_invites_select" on public.invites;
drop policy if exists "mvp_invites_update" on public.invites;

create policy "mvp_invites_insert"
  on public.invites
  for insert
  to anon
  with check (
    status = 'pending'
    and phase = 'sent'
    and response is null
    and opened_at is null
    and responded_at is null
    and unknown_sender_flagged_at is null
    and canceled_at is null
    and expired_at is null
    and no_tap_count >= 0
    and no_tap_count <= 2
  );

create policy "mvp_invites_select"
  on public.invites
  for select
  to anon
  using (true);

create policy "mvp_invites_update"
  on public.invites
  for update
  to anon
  using (true)
  with check (
    status in (
      'pending',
      'opened',
      'accepted',
      'raincheck',
      'declined',
      'expired',
      'cancelled',
      'flagged'
    )
    and phase in ('sent', 'opened', 'responded', 'closed')
    and no_tap_count >= 0
    and no_tap_count <= 2
  );
```

### Production Blocker

Before public deployment, replace the broad anon table access with one of these
server-controlled designs:

- Use a server-only Supabase service-role key inside provider code only, keep it
  out of `NEXT_PUBLIC_*`, and expose only app routes/server actions.
- Or replace table access with security-definer RPC functions such as
  `create_invite`, `get_invite_by_slug`, `mark_invite_opened`,
  `respond_to_invite`, and `flag_unknown_sender`, with each function validating
  allowed state transitions.

Do not treat the smoke policies above as production-safe.

## Current Model Notes

- `mysteryLevel`, `previewMode`, and `isDemo` are not in the current `Invite`
  model, so they are not persisted.
- `noTapCount` is in the current model and is stored only as a capped integer:
  `0`, `1`, or `2`.
- `counterOffer` is stored as JSONB to preserve Raincheck option, note, and
  suggested day without changing the existing `InviteStore` contract.
- `openedAt` remains write-once in the adapter. The app reads first, then
  updates only rows whose `opened_at` is still null.

## Privacy And Safety

Do not add these fields:

- `openCount`
- device identifiers
- location or IP fields
- hover, cursor path, dwell-time, or repeated-open tracking
- analytics event tables for recipient behavior

Metadata for `/i/[slug]` must remain generic and `noindex,nofollow`; private
invite data must never be copied into social preview metadata.

## Supabase Setup

1. Create a Supabase project.
2. Run the SQL above in the Supabase SQL editor.
3. Copy the project URL and anon key into `.env.local`.
4. Restart the Next.js dev server.
5. Keep Supabase imports limited to provider/adapter files.

This MVP does not add authentication, dashboards, notifications, payments, or
new routes.
