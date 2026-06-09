# Invite Expiry Policy

Sprint 3.5 enforces invitation expiry using the fields already present in the
Invite model and Supabase schema. It adds no scheduler, cron job, automatic
deletion, notification, authentication, dashboard, or schema migration.

## Fields Used

TypeScript:

- `expiresAt`
- `expiredAt`
- `status = "expired"`

Supabase:

- `expires_at`
- `expired_at`
- `status = 'expired'`

## Effective Expiry Rule

For pending or opened invitations:

```text
now >= expiresAt
```

means the invitation is effectively expired.

Expired invitations cannot accept:

- Yes
- Raincheck
- No
- unknown-sender flagging
- no-tap writes

The recipient page renders the expired state and hides response mechanics,
Compatibility Report, calendar actions, and maps actions.

## Terminal States

Expiry does not retroactively replace terminal states:

- accepted
- raincheck
- declined
- flagged
- cancelled

An accepted invitation remains available as the living private plan even if the
original expiry timestamp has passed.

## Missing Or Malformed Expiry

If `expiresAt` is missing, existing behavior is preserved.

If `expiresAt` is malformed or not a real calendar timestamp, the app does not
crash and does not silently expire the invitation.

## Enforcement Boundaries

Expiry is enforced lazily at read and write boundaries:

- recipient page loading derives expired state before marking an invite opened
- `markOpened` refuses to write an open for effectively expired invites
- response writes refuse Yes, Raincheck, and No after expiry
- unknown-sender flagging refuses to write after expiry
- no-tap writes refuse to write after expiry

UI hiding is not treated as authorization. Server-side store boundaries enforce
the rule independently.

## Derived Versus Persisted Expiry

Effective expiry is derived for correctness. The existing `expireInvites`
method may persist `status = expired` and `expiredAt` when explicitly called,
but Sprint 3.5 does not add a background worker or require persistence of the
expired transition for correctness.

## Race Limitations

A response near the expiry boundary is checked server-side at the mutation
boundary using the server's current time. This avoids relying on stale page UI.

Sprint 3.5 does not add distributed locks, queues, or database transactions
beyond the existing provider behavior. If a future high-scale deployment needs
stronger concurrency guarantees, that should be handled in a separate safety
sprint.

## Privacy And Metadata

Expiry does not change invite metadata behavior:

- `/i/[slug]` remains `noindex,nofollow`
- social previews remain generic
- private invite details are not exposed in metadata
- no `openCount` is added
- no analytics, device, location, hover, cursor, dwell-time, or repeated-open
  tracking is added

