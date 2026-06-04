# Act I QA Checklist

Use this checklist before persistence or deployment work. Act I must prove the
create invite -> share link -> recipient response -> same URL state loop while
keeping refusal easy and privacy intact.

## Setup

- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm test`.
- Start the local app with `npm run dev`.
- Use a clean browser session or refresh between invite runs.

## Create Lawyer Invite

- Open `/create`.
- Complete all three steps with `lawyer` mode.
- Confirm every field has a visible label.
- Confirm validation errors are associated with the relevant fields.
- Create the invite.
- Confirm the share screen shows a generated `/i/[slug]` path.
- Copy link if clipboard is available.
- Open the invite link.

## Create Unbothered Invite

- Open `/create`.
- Complete all three steps with `unbothered` mode.
- Create the invite.
- Open the generated `/i/[slug]` link.
- Confirm the Unbothered copy includes the sender name, recipient name, and
  date type.

## Lawyer Yes With Signature

- Open a fresh Lawyer invite.
- Confirm Compatibility Report appears before the mode actions.
- Confirm Lawyer legal-case content appears.
- Click the Yes action without typing `approved`.
- Confirm an accessible validation message appears.
- Confirm Raincheck and No remain visible and usable.
- Type `approved`.
- Submit Yes.
- Confirm the same `/i/[slug]` URL renders the accepted state.
- Confirm Compatibility Report and Lawyer mode are hidden after acceptance.

## Lawyer Raincheck

- Open a fresh Lawyer invite.
- Open the Raincheck panel.
- Select a quick option.
- Add an optional note.
- Add an optional suggested day.
- Submit Raincheck.
- Confirm the same `/i/[slug]` URL renders `Raincheck sent.`
- Confirm the selected option, note, and suggested day appear if provided.
- Confirm Compatibility Report, Lawyer mode, and Kind Reply Assistant are hidden.

## Lawyer No And Kind Reply Assistant

- Open a fresh Lawyer invite.
- Submit No.
- Confirm the same `/i/[slug]` URL renders
  `Fair enough. Thanks for being honest.`
- Confirm Kind Reply Assistant appears below the declined message.
- Confirm exactly three reply options appear.
- Click a copy button.
- Confirm the label changes to `Copied ✓` or a manual-copy textarea appears.
- Confirm no sender notification or storage write occurs.

## Unbothered Yes

- Open a fresh Unbothered invite.
- Confirm four actions are visible: `Fine, I'm in`, `Let fate decide 🎰`,
  `Maybe another day`, and `No`.
- Click `Fine, I'm in`.
- Confirm the same `/i/[slug]` URL renders the accepted state.
- Confirm Unbothered UI and Compatibility Report are hidden.

## Unbothered Slot Consent

- Open a fresh Unbothered invite.
- Click `Let fate decide 🎰`.
- Confirm the slot cycles `No` -> `Maybe` -> `Maybe` -> `YES`.
- Confirm Raincheck remains visible and keyboard reachable during the slot.
- Confirm No remains visible and keyboard reachable during the slot.
- Confirm the slot does not auto-accept after landing on `YES`.
- Confirm the final button appears:
  `Fine, I accept the rigged verdict`.
- Click the final button.
- Confirm the same `/i/[slug]` URL renders the accepted state.

## Unbothered Slot Avoidance Paths

- Open a fresh Unbothered invite.
- Start the slot.
- Click Raincheck before accepting the rigged verdict.
- Confirm Raincheck works and the invite does not become accepted.
- Open another fresh Unbothered invite.
- Start the slot.
- Click No before accepting the rigged verdict.
- Confirm the No tap sequence still works and the invite does not become
  accepted.

## Unbothered No Tap Sequence

- Open a fresh Unbothered invite.
- Click No once.
- Confirm the hint appears:
  `...okay that's fine. I'm fine.`
- Confirm focus remains on the No button.
- Click No again.
- Confirm the hint changes to `Cool cool cool.`
- Confirm `No, for real →` appears and is keyboard reachable.
- Click No a third time.
- Confirm the same `/i/[slug]` URL renders the declined state.
- Repeat on a fresh invite and click `No, for real →`.
- Confirm it declines immediately.

## Unbothered Raincheck

- Open a fresh Unbothered invite.
- Open the Raincheck panel.
- Confirm No remains visible before the panel opens.
- Select `Different day`.
- Add a note.
- Submit Raincheck.
- Confirm the same `/i/[slug]` URL renders `Raincheck sent.`
- Confirm Kind Reply Assistant does not render on Raincheck.

## Preview Mode

- Open an invite with `?previewMode=true`.
- Confirm the preview message is visible.
- Confirm opening the page does not set `openedAt`.
- Try Yes, Raincheck, No tap sequence, slot final confirmation, and unknown
  sender flag.
- Confirm none of those actions persist.
- Confirm local preview messages make the blocked write clear.

## Unknown Sender Flag

- Open a fresh invite.
- Click `I do not know this person`.
- Confirm the same `/i/[slug]` URL renders the flagged state.
- Confirm no sender notification is sent.
- Confirm Compatibility Report, mode UI, Raincheck panel, and Kind Reply
  Assistant are hidden.
- Confirm full private invite details are not repeated in the flagged state.

## Mobile Viewport

- Test `/create` and `/i/[slug]` at a mobile viewport width.
- Confirm tap targets are comfortable, at least 44px high where practical.
- Confirm text does not overlap or clip.
- Confirm response actions remain easy to reach.

## Keyboard-Only Navigation

- Navigate `/create` using only Tab, Shift+Tab, Enter, and Space.
- Navigate `/i/[slug]` using only the keyboard.
- Confirm focus rings are visible.
- Confirm field order and action order are logical.
- Confirm No and Raincheck are always reachable.

## Reduced Motion

- Enable reduced motion in browser or OS settings.
- Open a fresh Unbothered invite.
- Click `Let fate decide 🎰`.
- Confirm the slot skips animation and shows `YES` immediately.
- Confirm the final confirmation button is still required.
- Confirm no automatic Yes response is submitted.

## Metadata And Privacy

- Inspect `/i/[slug]` metadata.
- Confirm `noindex,nofollow`.
- Confirm Open Graph and Twitter previews are generic.
- Confirm preview text is `You have a surprise waiting.`
- Confirm sender name, recipient name, message, date, time, place, and address
  do not appear in metadata.
- Search source for `openCount`.
- Confirm no device, location, hover, cursor path, repeated-open, dwell-time,
  analytics, email, SMS, or notification tracking has been added.
