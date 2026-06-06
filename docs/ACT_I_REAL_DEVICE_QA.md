# Act I Real-Device QA

Use this document to capture post-polish manual QA evidence for the existing
Act I flow. Do not paste secrets, service-role key values, anon key values, or
private invite content.

## Test Run Metadata

* Test date: `2026-06-05`
* Preview URL: `https://wink-three.vercel.app/`
* Branch tested: `qa/sprint-2.2.1-preview-regression`
* Commit hash: `837f4c292722bc8c492970bc20e3e48ff029c165`
* Tester: `Khalil`
* Supabase table checked: `public.invites`

## Devices And Browsers

Record each device/browser used.

| Device / Browser     | Result | Notes                                                            |
| -------------------- | ------ | ---------------------------------------------------------------- |
| iPhone Safari        | `pass` | Act I flow renders correctly; no mobile layout blocker found.    |
| iPhone Chrome mobile | `pass` | Act I flow renders correctly; no mobile layout blocker found.    |
| Android Chrome       | `pass` | Act I flow renders correctly; no Android-specific blocker found. |
| Desktop Chrome       | `pass` | Act I flow renders correctly; no desktop blocker found.          |

## Creator Flow: `/create`

| Check                                    | Result | Notes                                                                                 |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `/create` opens cleanly                  | `pass` | No blank screen or load error.                                                        |
| Form is usable on mobile                 | `pass` | Fields, selects, and buttons are reachable.                                           |
| Form is usable on desktop Chrome         | `pass` | Fields, selects, and buttons are reachable.                                           |
| Required-field behavior is clear         | `pass` | Empty submit/validation errors are readable.                                          |
| Every input has a visible label          | `pass` | Sender, recipient, message, tone, mode, date type, date, time, and place are labeled. |
| Tap targets are usable                   | `pass` | Buttons and inputs are comfortable on touch.                                          |
| No horizontal overflow                   | `pass` | Page does not scroll sideways.                                                        |
| Invite creation succeeds                 | `pass` | Share screen appears after submit.                                                    |
| Generated invite path wraps              | `pass` | Long path wraps correctly on small screens.                                           |
| Copy-link button works when supported    | `pass` | Clipboard copy succeeds where supported.                                              |
| Manual copy fallback is understandable   | `pass` | Path can be selected/copied manually when clipboard API is unavailable.               |
| Browser back/refresh does not break flow | `pass` | Refresh and back behavior remain sane.                                                |
| No console errors                        | `pass` | No browser console errors found during QA.                                            |

## Recipient Flow: `/i/[slug]`

Open a created invite from another browser, private window, or physical device.

| Check                                        | Result | Notes                                                             |
| -------------------------------------------- | ------ | ----------------------------------------------------------------- |
| `/i/[slug]` opens on another browser/device  | `pass` | Invite content renders from another browser/device session.       |
| `opened_at` is set once                      | `pass` | First open sets value; refresh does not overwrite.                |
| Invite details are readable on mobile        | `pass` | Message, date/time, place, and address wrap correctly.            |
| No horizontal overflow                       | `pass` | Page does not scroll sideways.                                    |
| Tap targets are usable                       | `pass` | Yes, Raincheck, No, and unknown sender actions are reachable.     |
| Refresh keeps the correct living URL state   | `pass` | Accepted/raincheck/declined remain on the same URL after refresh. |
| Browser back does not create an unsafe state | `pass` | No unexpected auto-submit or missing No state found.              |
| No console errors                            | `pass` | No browser console errors found during QA.                        |

## Lawyer Mode

Use fresh Lawyer invites for each path.

| Check                                  | Result | Notes                                                              |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| Lawyer mode renders legal-case content | `pass` | Petitioner, decision-maker, and evidence content render correctly. |
| Yes requires typed approval            | `pass` | Missing approval shows validation.                                 |
| Raincheck remains available            | `pass` | Signature field does not gate Raincheck.                           |
| No remains available                   | `pass` | Signature field does not gate No.                                  |
| Yes path reaches accepted state        | `pass` | Same `/i/[slug]` URL renders accepted state.                       |
| Raincheck panel opens                  | `pass` | Panel is reachable and understandable.                             |
| Raincheck panel focus behavior works   | `pass` | Focus moves to panel heading when opened.                          |
| Raincheck path reaches raincheck state | `pass` | Same URL renders `Raincheck sent.`                                 |
| No path reaches declined state         | `pass` | Same URL renders declined state.                                   |

## Unbothered Mode

Use fresh Unbothered invites for each path.

| Check                                           | Result | Notes                                              |
| ----------------------------------------------- | ------ | -------------------------------------------------- |
| Unbothered mode renders reverse-psychology copy | `pass` | Sender, recipient, and date type appear correctly. |
| Four actions are visible                        | `pass` | Yes, slot, Raincheck, and No are visible.          |
| Slot opens on touch/click                       | `pass` | Slot panel appears.                                |
| Slot says it cannot answer for recipient        | `pass` | Consent copy is visible.                           |
| Raincheck remains available during slot         | `pass` | Visible and keyboard/touch reachable.              |
| No remains available during slot                | `pass` | Visible and keyboard/touch reachable.              |
| Slot does not auto-accept                       | `pass` | Final confirmation button is required.             |
| Final slot confirmation reaches accepted state  | `pass` | Same URL renders accepted state.                   |
| No tap 1 shows first hint only                  | `pass` | No decline yet.                                    |
| No tap 2 shows second hint and real No action   | `pass` | `No, for real` appears.                            |
| No tap 3 or real No reaches declined state      | `pass` | Same URL renders declined state.                   |
| Raincheck path reaches raincheck state          | `pass` | Same URL renders `Raincheck sent.`                 |

## Response States

Use fresh invites for each response path.

| Check                                             | Result | Notes                                                                                              |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Yes updates Supabase status                       | `pass` | Confirmed `accepted`, `response = yes`.                                                            |
| Raincheck updates status and counter-offer        | `pass` | Confirmed `raincheck`; `counter_offer` persisted when provided.                                    |
| No updates status                                 | `pass` | Confirmed `declined`, `response = no`.                                                             |
| Kind Reply Assistant appears after declined state | `pass` | Exactly three suggestions visible.                                                                 |
| Kind Reply copy button works or falls back        | `pass` | Copy works where supported; fallback remains usable. No sender notification, no stored reply text. |
| Unknown sender escape reaches flagged state       | `pass` | Flagged state reached; no notification sent to sender.                                             |

## Metadata And Privacy

Run these checks against a real `/i/[slug]` URL.

| Check                                          | Result | Notes                                                                                 |
| ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| Metadata is generic                            | `pass` | Expected `You have a surprise waiting.`                                               |
| `noindex,nofollow` is present                  | `pass` | Rendered metadata includes `noindex,nofollow`.                                        |
| Sender name absent from metadata               | `pass` | Sender name not found in metadata.                                                    |
| Recipient name absent from metadata            | `pass` | Recipient name not found in metadata.                                                 |
| Message absent from metadata                   | `pass` | Invite message not found in metadata.                                                 |
| Date/time/place/address absent from metadata   | `pass` | Date/time/place/address not found in metadata.                                        |
| Service-role key absent from page source       | `pass` | Service-role key not found in browser-visible source.                                 |
| Service-role key absent from loaded bundles    | `pass` | Service-role key not found in loaded JavaScript bundles.                              |
| Service-role key absent from network responses | `pass` | Service-role key not found in network responses.                                      |
| No analytics/tracking requests visible         | `pass` | No analytics, device, location, hover, cursor, or dwell-time tracking requests found. |

## Final Real-Device QA Verdict

* Verdict: `ready`
* Known issues:

  * No known issues from real-device Act I QA.
* Follow-up owner: `Khalil`
