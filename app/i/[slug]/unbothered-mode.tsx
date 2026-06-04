"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { flagUnknownSenderAction, respondToInviteAction } from "./actions";
import {
  getUnbotheredNoTapOutcome,
  unbotheredSlotFinalResult,
  unbotheredSlotSequence
} from "@/lib/invite-page";
import type { Invite } from "@/lib/invite-store";

type SlotState = "idle" | "spinning" | "result";

const slotTimings = [0, 180, 410, 800];

export function UnbotheredMode({
  invite,
  previewMode
}: {
  invite: Invite;
  previewMode: boolean;
}) {
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotState, setSlotState] = useState<SlotState>("idle");
  const [noTapCount, setNoTapCount] = useState(0);
  const [noHint, setNoHint] = useState<string | null>(null);
  const [previewNotice, setPreviewNotice] = useState(false);

  useEffect(() => {
    if (slotState !== "spinning") {
      return;
    }

    const timers = slotTimings.map((timing, index) =>
      window.setTimeout(() => {
        setSlotIndex(index);

        if (index === unbotheredSlotSequence.length - 1) {
          setSlotState("result");
        }
      }, timing)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [slotState]);

  function blockPreviewSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewMode) {
      return false;
    }

    event.preventDefault();
    setPreviewNotice(true);
    return true;
  }

  function handleFateClick() {
    setPreviewNotice(false);

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSlotIndex(unbotheredSlotSequence.length - 1);
      setSlotState("result");
      return;
    }

    setSlotIndex(0);
    setSlotState("spinning");
  }

  function handleNoSubmit(event: FormEvent<HTMLFormElement>) {
    setPreviewNotice(false);

    const outcome = getUnbotheredNoTapOutcome(noTapCount);

    if (!outcome.shouldDecline) {
      event.preventDefault();
      setNoTapCount(outcome.nextNoTapCount);
      setNoHint(outcome.hint);
      return;
    }

    setNoTapCount(outcome.nextNoTapCount);
    setNoHint(null);
    blockPreviewSubmit(event);
  }

  const slotValue = unbotheredSlotSequence[slotIndex];
  const noShiftPx = noTapCount > 0 ? 4 : 0;

  return (
    <section
      aria-labelledby="unbothered-mode-heading"
      className="space-y-5 rounded-lg border border-stone-300 bg-white p-5"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase text-stone-600">
          Unbothered mode
        </p>
        <h2
          className="text-xl font-semibold text-stone-950"
          id="unbothered-mode-heading"
        >
          Yeah so... {invite.recipientName}. {formatDateType(invite.dateType)}{" "}
          or whatever. If you want. No pressure.
        </h2>
        <p className="text-base leading-7 text-stone-800">
          I probably have other plans anyway, but like... it could be cool.
        </p>
        <p className="text-sm text-stone-700">
          This is teasing, not trapping. No stays available.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-stone-950">
          The allegedly casual invite
        </h3>
        <p className="whitespace-pre-wrap text-base leading-7 text-stone-800">
          {invite.message}
        </p>
      </div>

      <div
        aria-labelledby="unbothered-slot-heading"
        className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-4"
      >
        <div className="space-y-1">
          <h3
            className="text-base font-semibold text-stone-950"
            id="unbothered-slot-heading"
          >
            Rigged fate machine
          </h3>
          <p className="text-sm text-stone-700">
            This machine is absolutely not impartial.
          </p>
        </div>
        <div
          aria-live="polite"
          className="rounded-md border border-stone-300 bg-white px-4 py-5 text-center text-3xl font-semibold text-stone-950 transition-transform duration-300 ease-out motion-reduce:transition-none"
        >
          {slotValue}
        </div>
        <button
          aria-label="Let fate decide with a rigged joke machine"
          className="min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
          onClick={handleFateClick}
          type="button"
        >
          Let fate decide 🎰
        </button>
        {slotState === "result" && slotValue === unbotheredSlotFinalResult ? (
          <form action={respondToInviteAction} onSubmit={blockPreviewSubmit}>
            <input name="slug" type="hidden" value={invite.slug} />
            <input
              name="previewMode"
              type="hidden"
              value={previewMode ? "true" : "false"}
            />
            <input name="response" type="hidden" value="yes" />
            <button
              aria-label="Accept the rigged verdict and answer yes"
              className="min-h-11 w-full rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
              type="submit"
            >
              Fine, I accept the rigged verdict
            </button>
          </form>
        ) : null}
      </div>

      <div
        aria-labelledby="unbothered-actions-heading"
        className="space-y-4 border-t border-stone-200 pt-4"
      >
        <div className="space-y-1">
          <h3
            className="text-base font-semibold text-stone-950"
            id="unbothered-actions-heading"
          >
            Your answer
          </h3>
          {previewMode ? (
            <p className="text-sm text-stone-700">
              Preview mode is on. You can try the buttons, but responses will
              not be saved.
            </p>
          ) : null}
          {previewNotice ? (
            <p className="text-sm text-stone-700" role="status">
              Preview mode blocked saving that response.
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <form action={respondToInviteAction} onSubmit={blockPreviewSubmit}>
            <input name="slug" type="hidden" value={invite.slug} />
            <input
              name="previewMode"
              type="hidden"
              value={previewMode ? "true" : "false"}
            />
            <input name="response" type="hidden" value="yes" />
            <button
              aria-label="Answer yes to this invitation"
              className="min-h-11 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
              type="submit"
            >
              Fine, I&apos;m in
            </button>
          </form>

          <form action={respondToInviteAction} onSubmit={blockPreviewSubmit}>
            <input name="slug" type="hidden" value={invite.slug} />
            <input
              name="previewMode"
              type="hidden"
              value={previewMode ? "true" : "false"}
            />
            <input name="response" type="hidden" value="raincheck" />
            <button
              aria-label="Ask for a raincheck"
              className="min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
              type="submit"
            >
              Raincheck
            </button>
          </form>
        </div>

        <form action={respondToInviteAction} onSubmit={handleNoSubmit}>
          <input name="slug" type="hidden" value={invite.slug} />
          <input
            name="previewMode"
            type="hidden"
            value={previewMode ? "true" : "false"}
          />
          <input name="response" type="hidden" value="no" />
          <button
            aria-label="Answer no to this invitation"
            className="min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 transition-transform focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2 motion-reduce:transition-none"
            style={{ transform: `translateX(${noShiftPx}px)` }}
            type="submit"
          >
            No
          </button>
        </form>
        {noHint ? (
          <p aria-live="polite" className="text-sm text-stone-700">
            {noHint}
          </p>
        ) : null}

        <form action={flagUnknownSenderAction} onSubmit={blockPreviewSubmit}>
          <input name="slug" type="hidden" value={invite.slug} />
          <input
            name="previewMode"
            type="hidden"
            value={previewMode ? "true" : "false"}
          />
          <button
            className="min-h-11 w-full rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-800 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
            type="submit"
          >
            I do not know this person
          </button>
        </form>
      </div>
    </section>
  );
}

function formatDateType(value: Invite["dateType"]): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
