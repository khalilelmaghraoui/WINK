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
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit `.env.local` or real secrets. `SUPABASE_SERVICE_ROLE_KEY` is
server-only and must never be prefixed with `NEXT_PUBLIC`. If the Supabase URL
or service-role key is missing, the app falls back to the in-memory store only
for local development and tests. Vercel Preview and Production fail closed when
these values are missing or incomplete.

## Local Development Modes

- No Supabase service env vars: in-memory persistence, same as earlier MVP
  sprints.
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` present:
  `SupabaseInviteStore` is selected automatically.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` may remain configured for future safe public
  reads, but invite persistence does not require anon table writes.
- Deployed Preview and Production must have `NEXT_PUBLIC_SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`; otherwise invite creation and loading show safe
  temporary-service messages instead of creating disappearing memory links.

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
  sender_token_hash text,
  recipient_message text check (
    recipient_message is null or char_length(recipient_message) <= 300
  ),
  recipient_message_sent_at timestamptz,
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

create unique index if not exists invites_sender_token_hash_idx
  on public.invites (sender_token_hash)
  where sender_token_hash is not null;
```

Existing Supabase projects created before Sprint 3.6 must also run the
migration in `supabase/migrations/20260610_private_sender_link_reply.sql`.
It adds `sender_token_hash`, `recipient_message`,
`recipient_message_sent_at`, the unique sender-token hash index, and the
recipient-message length check. Do not add a raw sender token column.

For Sprint 3.6 closure, the Production/Main Supabase database was manually
verified to include `sender_token_hash`, `recipient_message`, and
`recipient_message_sent_at` on `public.invites`. Live Preview smoke confirmed
that the private sender link and one-time declined recipient message work with
those fields, and the Sprint 3.6 final verdict is ready to merge.

## Row Level Security Review

Sprint 2.0.2 finding: preview-safe persistence should not rely on broad anon
write policies. The app now routes InviteStore operations through server-side
provider code that can use a server-only Supabase service-role key.

With no authenticated sender or recipient identity, table-level RLS cannot prove
that an anon caller "owns" a specific invite. The invite slug acts like a
capability link in the app, but Supabase table policies cannot reliably enforce
"only requests that know this slug can read or update this exact row" with
broad anon table policies. For Vercel preview, keep browser access mediated by
the Next.js app and do not grant anon write policies.

### Preview-Safe Posture

- Enable RLS on `public.invites`.
- Do not create broad anon insert/update/delete policies for public preview.
- Browser code never writes directly to Supabase.
- Existing server actions call `InviteStore`; `InviteStore` uses server-only
  provider code.
- `SupabaseInviteStore` should use `SUPABASE_SERVICE_ROLE_KEY` from server
  environment only.
- Service-role clients bypass RLS, so all access checks and allowed transitions
  must live in the server adapter and server actions.
- Do not expose the service-role key to the browser, logs, source control, or
  any `NEXT_PUBLIC_*` variable.
- Metadata remains generic in application code and does not read from Supabase.
- There is no `openCount`.
- There are no device, location, hover, cursor, dwell-time, repeated-open, or
  analytics fields.

Recommended preview baseline:

```sql
alter table public.invites enable row level security;

drop policy if exists "mvp_invites_insert" on public.invites;
drop policy if exists "mvp_invites_select" on public.invites;
drop policy if exists "mvp_invites_update" on public.invites;

-- No anon table policies are required for the current server-mediated preview.
-- The server-side service-role client bypasses RLS and must enforce InviteStore
-- rules in application code.
```

### Optional Anon Read Tradeoff

If a future slice introduces direct browser reads by slug, an anon select policy
would expose any invite row to anyone who can call Supabase with the anon key
unless access is mediated by an RPC function that validates the slug argument.
That may be acceptable for private link semantics only if the team knowingly
accepts invite slugs as bearer tokens. It is not equivalent to authenticated
privacy.

### Production Blocker Reminder

Before public production deployment, keep using a server-controlled design:

- Use a server-only Supabase service-role key inside provider code only, keep it
  out of `NEXT_PUBLIC_*`, and expose only app routes/server actions.
- Or replace table access with security-definer RPC functions such as
  `create_invite`, `get_invite_by_slug`, `mark_invite_opened`,
  `respond_to_invite`, and `flag_unknown_sender`, with each function validating
  allowed state transitions.

Do not make broad anon write policies part of public preview or production.

## Current Model Notes

- `mysteryLevel`, `previewMode`, and `isDemo` are not in the current `Invite`
  model, so they are not persisted.
- `noTapCount` is in the current model and is stored only as a capped integer:
  `0`, `1`, or `2`.
- `counterOffer` is stored as JSONB to preserve Raincheck option, note, and
  suggested day without changing the existing `InviteStore` contract.
- New invites store only `sender_token_hash` for the private sender link. The
  raw `/s/[token]` token is generated once and is not stored or recoverable.
- `recipient_message` and `recipient_message_sent_at` support a one-time
  declined recipient reply that appears only on the private sender status link.
  Legacy invites without `sender_token_hash` keep manual-copy reply ideas.
- `openedAt` remains write-once in the adapter. The app reads first, then
  updates only rows whose `opened_at` is still null.
- `expires_at` / `expired_at` support lazy invite expiry enforcement. Pending
  or opened invites are treated as expired when `now >= expires_at`; accepted,
  raincheck, declined, flagged, and cancelled states are not retroactively
  replaced. No Supabase scheduled job or schema migration is required for this
  enforcement.

## Privacy And Safety

Do not add these fields:

- `openCount`
- raw sender access tokens
- message read receipts
- device identifiers
- location or IP fields
- hover, cursor path, dwell-time, or repeated-open tracking
- analytics event tables for recipient behavior

Metadata for `/i/[slug]` must remain generic and `noindex,nofollow`; private
invite data must never be copied into social preview metadata.

## Supabase Setup

1. Create a Supabase project.
2. Run the SQL above in the Supabase SQL editor.
3. Copy the project URL, anon key, and service-role key into `.env.local`.
4. Restart the Next.js dev server.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` out of Vercel client-exposed variables.
6. Keep Supabase imports limited to provider/adapter files.

This MVP does not add authentication, dashboards, notifications, payments, or
new routes.
