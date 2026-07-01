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

## Sender Controls v1

Sprint 3.8 adds two narrow controls to the valid private sender page. The
private sender link remains a bearer capability; this is not authentication or
a dashboard.

The sender can:

- copy the recipient `/i/[slug]` link again
- cancel the invitation while its effective status is `pending` or `opened`

The copied recipient link must not include:

- the `/s/[token]` sender path
- the raw sender token
- `sender_token_hash`
- Supabase details

Cancellation rules:

- cancellation is unavailable after `accepted`, `raincheck`, `declined`,
  `flagged`, `expired`, or `cancelled`
- effectively expired pending/opened invites cannot be cancelled
- cancellation uses the existing `cancelled` status and `canceledAt` field
- cancellation does not change declined recipient messages
- cancellation sends no notification
- flagged sender links still show the generic unavailable state and do not
  reveal the unknown-sender reason

After cancellation, the recipient `/i/[slug]` page shows the closed/cancelled
state and hides Yes, Raincheck, No, Kind Reply Assistant, accepted reveal,
calendar, and maps actions.

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

The Vercel Preview deployment was smoke tested successfully after Vercel
Preview access was available.

Final Sprint 3.6 verification:

- Live Vercel Preview smoke: passed
- Private sender link: passed
- Recipient decline message: passed
- Message persisted once: passed
- Sender page displayed message: passed
- Invalid sender token revealed nothing: passed
- Metadata/noindex check: passed
- Final verdict: ready to merge

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
- sender editing or sender inbox

`/i/[slug]` metadata remains generic and `noindex,nofollow`.
`/s/[token]` metadata is also generic and `noindex,nofollow`.
