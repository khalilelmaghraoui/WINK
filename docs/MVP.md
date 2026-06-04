# WINK / DateCard — MVP

## Product
WINK is a romantic invitation microsite builder, not a dating app.
A sender creates a cinematic invitation link for a date, apology, surprise, or romantic moment.

## MVP scope: Act I only
1. Sender creates an invitation.
2. Sender receives a shareable link.
3. Recipient opens the invitation page.
4. Recipient responds:
   - Yes
   - Raincheck / Yes-but
   - No
5. After Yes, the same invitation URL becomes the confirmation experience.

## Platform
Web-first MVP.

## Frozen stack
- Next.js 14
- TypeScript
- Tailwind CSS
- Mock storage first
- Supabase later
- Vercel deployment later

## First invitation modes
- Lawyer
- Unbothered

## Creation form
- Recipient name
- Message or tone
- Invitation mode
- Date details
- Place details

## Important constraints
- Accessibility baseline required.
- previewMode must block writes.
- openedAt is recorded once only.
- Do not implement openCount.
- /i/[slug] must use noindex/nofollow.
- Social previews must remain generic.
- Recipient must see an “I do not know this person” escape option.
- Do not add authentication, payments, chat, notifications, or native apps in the first MVP.