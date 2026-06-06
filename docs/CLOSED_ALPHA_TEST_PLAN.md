# WINK Closed Alpha Test Plan

Use this plan for a tiny trusted-user test of WINK Act I. This is not a public
launch, growth test, or production readiness exercise.

## Purpose

Validate whether trusted users can understand, create, share, and respond to
WINK Act I invites without help. The goal is to learn whether the current
creator flow and living invite URL make sense before expanding the product.

## Test Size

Use 3-5 trusted testers only.

Keep the test small, private, and deliberate. Do not open this to a public
audience yet.

## Tester Roles

Sender tester:

- Creates an invite.
- Copies or manually shares the invite link.
- Reports on the creation and sharing experience.

Recipient tester:

- Opens an invite.
- Responds with Yes, Raincheck, or No.
- Reports on clarity, consent, tone, and mobile behavior.

A tester may do both roles, but feedback must distinguish sender experience
from recipient experience.

## Test Scope

Allowed to test:

- `/create`.
- Lawyer invite.
- Unbothered invite.
- Yes.
- Raincheck.
- No.
- Kind Reply Assistant.
- Unknown sender escape.
- Share-link copy and manual copy.
- Mobile and desktop behavior.

Not allowed or not expected:

- Home page.
- Login.
- Dashboard.
- Notifications.
- Analytics.
- AI.
- Maps.
- Music.
- Camera.
- Scrapbook.
- Payments.
- Native mobile.
- Extra modes.

## Privacy Instructions

Tell testers:

- Use fake names.
- Do not put sensitive or private messages into invites.
- Do not use real addresses.
- Do not paste secrets or invite content in feedback.
- Treat invite links as bearer/private links. Anyone with the link may be able
  to open and respond to the invite.

## Device Coverage

Ask for at least:

- 1 mobile browser test.
- 1 desktop browser test if possible.

Prefer a mix of iPhone Safari or Chrome, Android Chrome if available, and
desktop Chrome.

## Success Criteria

Closed alpha is successful if:

- Testers understand the invite within 3 seconds.
- Sender testers can create and share without help.
- Recipient testers can answer Yes, Raincheck, or No without confusion.
- No feels easy and non-coercive.
- No critical mobile layout issue appears.
- At least 1 tester says they would actually send this to someone.

## Stop Conditions

Stop and do not expand testing if:

- Invite creation fails.
- Links do not open across devices.
- Supabase persistence fails.
- No feels hidden or coercive.
- Service-role key or private invite content appears in browser-visible places.
- Multiple testers cannot understand the product.

## After-Test Workflow

Collect feedback in Sprint 2.4 and classify each item into one of four buckets:

- Must fix before wider sharing.
- Copy or UX confusion.
- Actual bug.
- Feature request - defer.

Do not turn every request into scope. Prioritize issues that block the Act I
loop, trust, consent, mobile usability, or privacy.
