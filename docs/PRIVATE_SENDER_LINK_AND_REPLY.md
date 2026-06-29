# Private Sender Link And Decline Reply

Sprint 3.6 adds a private sender status link and a real one-time declined
reply path. This is a messaging-adjacent utility inside WINK, not external
messaging, notifications, accounts, or a dashboard.

## Routes

- `/i/[slug]` remains the recipient invitation URL.
- `/s/[token]` is a private sender status URL created at invite creation time.

Both URLs are bearer/private links. Anyone with the URL can view the matching
experience. WINK does not add authentication in this sprint.

## Sender Access Token

Each new invite gets a 32-byte URL-safe sender access token. The raw token is
shown once in the creator success screen as the private sender link.

The database stores only:

- `sender_token_hash`

The raw sender token is not stored in Supabase, not recoverable, and not passed
to recipient UI. If the sender loses the private `/s/[token]` link, WINK cannot
recover it.

Legacy invites without `sender_token_hash` still work, but they cannot show a
private sender status page and cannot receive a WINK-mediated declined reply.

## Sender Status Page

`/s/[token]` is server rendered and marked `noindex,nofollow`. Metadata is
generic and does not expose invite details.

The page may show:

- waiting or opened status without exact opened timestamp
- accepted status and plan summary
- raincheck details
- declined status and optional recipient message
- expired or cancelled status

For flagged or invalid links, it shows a generic unavailable state. It does not
tell the sender whether the recipient used the unknown-sender escape.

The sender status page does not:

- mutate `openedAt`
- send notifications
- track opens
- expose a service-role key
- import Supabase directly
- show recipient device, location, IP, hover, cursor, dwell-time, repeated-open,
  or open-count data

## Declined Reply

For new invites with sender access, the declined state includes an optional
message composer. The recipient can send one short message through WINK after
choosing No.

Rules:

- message is optional
- message max length is 300 characters
- message is stored only once
- message is available only on the private sender link
- no external message is sent
- no email, SMS, WhatsApp, Instagram, push, or webhook is used
- no notification is sent to the sender
- no read receipt or message-open tracking is added

For legacy invites without sender access, the declined state keeps manual copy
message ideas instead of a WINK-mediated send.

## Supabase Fields

Sprint 3.6 adds:

- `sender_token_hash text`
- `recipient_message text`
- `recipient_message_sent_at timestamptz`

It also adds:

- a unique partial index on `sender_token_hash`
- a `recipient_message` length check of 300 characters or fewer

No raw sender token column is added.

## Closure Verification

As of June 29, 2026, the Supabase Production/Main database migration has been
manually applied and verified to expose the expected `public.invites` columns:

- `sender_token_hash`
- `recipient_message`
- `recipient_message_sent_at`

The Sprint 3.6 code and migration are aligned: the app stores only the sender
token hash, never a plaintext sender token or stored `/s/...` URL. Automated
lint, typecheck, test, and build checks pass locally.

The Vercel Preview deployment for commit
`6341919881ba84ccd5e8b666206d52ffdba2afad` completed successfully, but the
Preview URL was protected by Vercel authentication during closure verification.
Live Preview smoke remains pending until an authenticated or protection-bypass
Preview session is available.

## Privacy And Safety

The private sender link is a convenience for the sender, not an account system.
It must remain private.

Do not add:

- auth
- login
- dashboard
- external delivery
- notifications
- analytics
- read receipts
- open counts
- device/location/IP tracking
- sender controls

`/i/[slug]` metadata remains generic and `noindex,nofollow`.
`/s/[token]` metadata is also generic and `noindex,nofollow`.
