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
