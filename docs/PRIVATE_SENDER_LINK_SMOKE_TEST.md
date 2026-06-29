# Private Sender Link Smoke Test

Sprint 3.6.1 closes the private sender link evidence for Sprint 3.6. This is
manual QA documentation only; it does not add product behavior.

Do not paste live sender tokens, bearer invite URLs, private messages, sender
names, recipient names, addresses, or secret values into this document.

## Scope

Verify the `/s/[token]` private sender status route and the one-time declined
recipient message path introduced in Sprint 3.6.

Out of scope:

- authentication
- dashboard
- notifications
- email, SMS, WhatsApp, Instagram, or push delivery
- reply threads
- read receipts
- analytics or open counts
- sender controls
- new invite modes

## Migration Confirmation

Status: passed.

The Supabase Production/Main database was manually verified to include the
Sprint 3.6 columns on `public.invites`:

- `sender_token_hash`
- `recipient_message`
- `recipient_message_sent_at`

The migration file is `supabase/migrations/20260610_private_sender_link_reply.sql`.
It is idempotent, adds a unique partial index for `sender_token_hash`, and
limits `recipient_message` to 300 characters.

The database must not contain:

- a plaintext sender token column
- a stored `/s/...` sender URL column
- external message-delivery fields
- read receipt or open-count fields

## Two-Link Success Screen

Status: passed.

Manual smoke verified that creating a new invite displays two distinct private
links:

- recipient link: `/i/[slug]`
- private sender link: `/s/[token]`

The recipient link does not contain the sender token. The sender link is shown
as a private link that should be saved because WINK cannot recover the raw
token later.

## Sender Status View

Status: passed.

The `/s/[token]` route renders a privacy-safe sender summary only. It may show
the invitation state and safe plan/status summary, but it must not behave like
a dashboard.

The sender status view must not expose:

- sender token hash
- raw sender token beyond the URL itself
- exact opened timestamp
- open count
- recipient device, location, IP, hover, cursor, or dwell-time data
- unknown-sender flag details
- service-role key or Supabase internals

Invalid, malformed, flagged, or legacy-unavailable sender links must reveal
nothing beyond the generic unavailable state.

## Recipient Message Delivery

Status: passed.

For new invites with sender access, a recipient who chooses No can optionally
send one short WINK-mediated message from the declined state.

Manual smoke verified:

- the message composer appears after No on new invites
- exactly one message can be sent
- the submitted message persists once
- a second message does not overwrite the first
- declined status remains declined
- `response` remains `no`
- no external notification or delivery is sent
- the private sender page displays the message when the sender opens `/s/[token]`

If the recipient leaves no message, the sender page shows the declined status
without inventing one.

## Metadata Privacy

Status: passed.

Manual smoke verified that `/s/[token]` metadata remains generic.

The sender route metadata must not include:

- sender name
- recipient name
- invitation message
- recipient declined message
- response text
- date, time, place, or address
- invite slug
- sender token
- sender token hash

## Noindex/Nofollow

Status: passed.

Manual smoke verified that `/s/[token]` is marked `noindex,nofollow`.

`/i/[slug]` also remains `noindex,nofollow` with generic metadata.

## Legacy Declined Invites

Status: passed.

Legacy declined invites without `sender_token_hash` remain safe. They do not
show real WINK message sending because there is no private sender link to
receive the message.

Instead, the declined state keeps the manual-copy Kind Reply fallback.

## Final Verdict

Sprint 3.6 private sender link evidence is complete and ready to merge.
