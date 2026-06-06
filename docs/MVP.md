# WINK / DateCard - MVP

## Product

WINK is a romantic invitation microsite builder, not a dating app. A sender
creates a cinematic invitation link for a date, apology, surprise, or romantic
moment.

## MVP Scope: Act I Only

1. Sender creates an invitation.
2. Sender receives a shareable link.
3. Recipient opens the invitation page.
4. Recipient responds:
   - Yes.
   - Raincheck / Yes-but.
   - No.
5. After Yes, the same invitation URL becomes the confirmation experience.

## Platform

Web-first MVP.

## Current Stack

- Next.js 15.
- TypeScript.
- Tailwind CSS.
- App Router.
- Supabase persistence behind `InviteStore` when env vars are configured.
- In-memory storage fallback when Supabase env vars are absent.
- Vercel Preview smoke passed.

## Current Status

- Act I MVP is implemented.
- Supabase-backed preview persistence is working.
- Vercel Preview smoke passed.
- Real-device QA passed.
- Ready for closed alpha preparation.
- Not public launch or production readiness.

## First Invitation Modes

- Lawyer.
- Unbothered.

## Creation Form

- Recipient name.
- Sender name.
- Message and tone.
- Invitation mode.
- Date details.
- Place details.

## Important Constraints

- Accessibility baseline required.
- `previewMode=true` must block writes.
- `openedAt` is recorded once only.
- Do not implement `openCount`.
- Do not add analytics or recipient tracking fields.
- Do not track device, location, hover, cursor path, repeated opens, or dwell
  time.
- `/i/[slug]` must use `noindex,nofollow`.
- Social previews must remain generic.
- Metadata must not expose sender name, recipient name, message, date, time,
  place, or address.
- Recipient must see an "I do not know this person" escape option.
- Refusal must remain easy and clear.
- Supabase service-role key must stay server-only and must never use a
  `NEXT_PUBLIC` prefix.
- App/UI files must not import Supabase directly.
- Do not use broad anon insert/update/delete policies for preview.
- Do not add authentication, payments, chat, notifications, dashboard, AI,
  maps, music, camera, scrapbook, partners, reveal drip, Expo, or native apps
  in the first MVP.
