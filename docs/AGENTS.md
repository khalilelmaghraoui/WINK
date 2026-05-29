# AGENTS.md

## Project Identity

This repository is for Frisson / DateCard.

Frisson is a romantic invitation microsite builder, not a dating app. The product lets a sender create a private invitation link that a recipient can open instantly in a browser and answer.

The first product goal is to prove the core invitation loop, not to build a full platform.

## Current Scope: MVP 0

Build only the smallest web-first MVP:

1. Sender creates an invitation.
2. Sender gets a shareable invitation URL.
3. Recipient opens `/i/[slug]`.
4. Recipient answers:

   * Yes
   * Raincheck
   * No
5. If the recipient answers Yes, the same `/i/[slug]` URL becomes the confirmation experience.

## Stack

Use:

* Next.js 14
* TypeScript
* Tailwind CSS
* App Router
* Mock storage first
* Supabase later, only when explicitly requested

Do not add a backend, database, authentication, Prisma, payments, notifications, mobile app, dashboard, or admin panel unless explicitly requested.

## Routes

MVP 0 routes:

* `/create` — sender creates an invitation
* `/i/[slug]` — recipient views and responds to an invitation

Do not add extra routes unless the task explicitly asks for them.

## Domain Model Rules

Allowed invitation modes in MVP 0:

* `lawyer`
* `unbothered`

Do not add these modes yet:

* `ceo`
* `desperate`
* `scratch`
* `classic`
* any other invented mode

Allowed response values:

* `yes`
* `raincheck`
* `no`

Invitation status may be:

* `draft`
* `pending`
* `opened`
* `accepted`
* `raincheck`
* `declined`

Do not add other statuses without explicit instruction.

## Privacy and Safety Rules

These rules are non-negotiable:

* `/i/[slug]` must be `noindex,nofollow`.
* Social previews / Open Graph previews must remain generic.
* Do not expose recipient name, sender name, invitation text, place, or date in metadata.
* Use a generic preview such as: “You have a surprise waiting.”
* Include an “I do not know this person” escape action on the recipient page.
* Do not show the sender recipient device, location, IP, exact open timestamp, or open count.
* Never implement `openCount`.

## Behavioral Rules

* `openedAt` may be set only once, on first non-preview open.
* If `openedAt` already exists, never overwrite it.
* `previewMode=true` blocks all writes. No exceptions.
* In preview mode, UI interactions may simulate state but must not persist data.
* The Yes response must keep the recipient on the same `/i/[slug]` URL and show the confirmation state there.

## Development Rules

Work in small vertical slices.

Before implementation, summarize:

1. What you understood.
2. What files you expect to change.
3. What is explicitly out of scope.

After implementation, report:

1. Files changed.
2. Commands run.
3. Tests/checks passed or failed.
4. Anything not completed.

Always run:

* `npm run lint`
* `npm run typecheck`

When visible UI changes are made, verify the affected route in a browser or with Playwright if available.

## Scope Control

Do not implement features without explicit instruction.

If a feature is not part of the requested slice, stop and ask before adding it.

Especially do not add:

* authentication
* login
* user accounts
* sender dashboard
* notifications
* email sending
* SMS sending
* analytics
* tracking
* payment
* subscriptions
* native mobile app
* Expo
* Prisma
* Supabase
* database schema
* admin panel
* AI-generated messages
* compatibility report
* slot machine
* canvas signature
* excuse generator

Those may come later, but they are not MVP 0.

## Code Quality

Prefer simple, readable code.

Use TypeScript types for domain objects.

Keep storage behind a repository interface so mock storage can later be replaced by Supabase.

Do not create clever abstractions too early.

Do not install new dependencies without explaining why they are needed.
