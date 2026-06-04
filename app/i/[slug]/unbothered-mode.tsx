"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  flagUnknownSenderAction,
  recordNoTapAction,
  respondToInviteAction
} from "./actions";
import { RaincheckPanel } from "./raincheck-panel";
import {
  getUnbotheredHeader,
  getUnbotheredMainCopy,
  getUnbotheredNoTapHint,
  getUnbotheredNoTapOutcome,
  unbotheredSlotConfirmationLabel,
  unbotheredSlotFinalResult,
  unbotheredSlotSequence,
  unbotheredSlotTimings
} from "@/lib/invite-page";
import type { Invite } from "@/lib/invite-store";

type SlotState = "idle" | "spinning" | "landed";

export function UnbotheredMode({
  invite,
  noTapCount,
  previewMode
}: {
  invite: Invite;
  noTapCount: Invite["noTapCount"];
  previewMode: boolean;
}) {
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const [, startTransition] = useTransition();
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotState, setSlotState] = useState<SlotState>("idle");
  const [slotConfirmationReady, setSlotConfirmationReady] = useState(false);
  const [localNoTapCount, setLocalNoTapCount] = useState(noTapCount);
  const [noHint, setNoHint] = useState<string | null>(
    getUnbotheredNoTapHint(noTapCount)
  );
  const [previewNotice, setPreviewNotice] = useState(false);

  const header = getUnbotheredHeader(invite);
  const mainCopy = getUnbotheredMainCopy(invite);
  const slotPanelOpen = slotState !== "idle";
  const slotValue = unbotheredSlotSequence[slotIndex];
  const noButtonShiftClass =
    localNoTapCount >= 1 ? "motion-safe:translate-x-1" : "";

  useEffect(() => {
    setLocalNoTapCount(noTapCount);
    setNoHint(getUnbotheredNoTapHint(noTapCount));
  }, [noTapCount]);

  useEffect(() => {
    if (slotState !== "spinning") {
      return;
    }

    const timers = [
      ...unbotheredSlotTimings.map((timing, index) =>
        window.setTimeout(() => {
          setSlotIndex(index);
        }, timing)
      ),
      window.setTimeout(() => {
        setSlotState("landed");
      }, 800),
      window.setTimeout(() => {
        setSlotConfirmationReady(true);
      }, 1400)
    ];

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
    setSlotIndex(unbotheredSlotSequence.length - 1);
    setSlotConfirmationReady(false);

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setSlotState("landed");
      setSlotConfirmationReady(true);
      return;
    }

    setSlotIndex(0);
    setSlotState("spinning");
  }

  function handleNoSubmit(event: FormEvent<HTMLFormElement>) {
    setPreviewNotice(false);

    if (previewMode) {
      event.preventDefault();
      setPreviewNotice(true);
      return;
    }

    const outcome = getUnbotheredNoTapOutcome(localNoTapCount);

    if (outcome.shouldDecline) {
      blockPreviewSubmit(event);
      return;
    }

    event.preventDefault();
    setLocalNoTapCount(outcome.nextNoTapCount);
    setNoHint(outcome.hint);
    window.setTimeout(() => noButtonRef.current?.focus(), 0);

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const persistedCount = await recordNoTapAction(formData);

      if (persistedCount !== null) {
        setLocalNoTapCount(persistedCount);
        setNoHint(getUnbotheredNoTapHint(persistedCount));
      }
    });
  }

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
          {header}
        </h2>
      </div>

      {!slotPanelOpen ? (
        <div className="space-y-2">
          <p className="text-base leading-7 text-stone-800">
            {mainCopy.line1}
          </p>
          <p className="text-base leading-7 text-stone-800">
            {mainCopy.line2}
          </p>
        </div>
      ) : (
        <SlotPanel
          invite={invite}
          previewMode={previewMode}
          previewNotice={previewNotice}
          slotConfirmationReady={slotConfirmationReady}
          slotState={slotState}
          slotValue={slotValue}
          onPreviewSubmit={blockPreviewSubmit}
        />
      )}

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
              <span className="font-semibold">PREVIEW</span> mode is on. You
              can try the buttons, but responses and No taps will not be saved.
            </p>
          ) : null}
          {previewNotice ? (
            <p className="text-sm text-stone-700" role="status">
              Preview mode blocked saving that response.
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ResponseForm
            ariaLabel="Answer yes to this invitation"
            label="Fine, I'm in"
            previewMode={previewMode}
            response="yes"
            slug={invite.slug}
            variant="understated"
            onPreviewSubmit={blockPreviewSubmit}
          />

          <button
            aria-label="Let fate decide with a rigged joke machine"
            className="min-h-11 w-full rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
            onClick={handleFateClick}
            type="button"
          >
            Let fate decide 🎰
          </button>

          <RaincheckPanel
            previewMode={previewMode}
            slug={invite.slug}
            triggerLabel="Maybe another day"
          />

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
              className={`min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 transition-transform duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2 motion-reduce:transition-none ${noButtonShiftClass}`}
              ref={noButtonRef}
              type="submit"
            >
              No
            </button>
          </form>
        </div>

        <div className="space-y-2">
          <p
            aria-live="polite"
            className="min-h-5 text-sm italic text-stone-600"
          >
            {noHint}
          </p>
          {localNoTapCount >= 2 ? (
            <form action={respondToInviteAction} onSubmit={blockPreviewSubmit}>
              <input name="slug" type="hidden" value={invite.slug} />
              <input
                name="previewMode"
                type="hidden"
                value={previewMode ? "true" : "false"}
              />
              <input name="response" type="hidden" value="no" />
              <button
                aria-label="Answer no for real to this invitation"
                className="min-h-11 rounded-md px-0 py-2 text-sm font-medium text-stone-700 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
                type="submit"
              >
                No, for real →
              </button>
            </form>
          ) : null}
        </div>

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

function SlotPanel({
  invite,
  onPreviewSubmit,
  previewMode,
  previewNotice,
  slotConfirmationReady,
  slotState,
  slotValue
}: {
  invite: Invite;
  onPreviewSubmit: (event: FormEvent<HTMLFormElement>) => boolean;
  previewMode: boolean;
  previewNotice: boolean;
  slotConfirmationReady: boolean;
  slotState: SlotState;
  slotValue: (typeof unbotheredSlotSequence)[number];
}) {
  const landed = slotState === "landed";

  return (
    <div
      aria-labelledby="unbothered-slot-heading"
      className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-4"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h3
            className="text-base font-semibold text-stone-950"
            id="unbothered-slot-heading"
          >
            Rigged fate machine
          </h3>
          {previewMode ? (
            <span className="rounded border border-stone-300 px-2 py-1 text-xs font-semibold text-stone-700">
              PREVIEW
            </span>
          ) : null}
        </div>
        <p className="text-sm text-stone-700">
          This machine is absolutely not impartial.
        </p>
      </div>
      <div
        aria-live="polite"
        className="rounded-md border border-stone-300 bg-white px-4 py-5 text-center text-4xl font-semibold text-stone-950"
      >
        {slotValue}
      </div>
      {landed ? (
        <p aria-live="polite" className="text-sm text-stone-700">
          The fates have decided: {unbotheredSlotFinalResult}
        </p>
      ) : null}
      {slotConfirmationReady ? (
        <div className="space-y-3">
          <p className="text-base text-stone-800">
            The totally unbiased machine has spoken: YES.
          </p>
          <form action={respondToInviteAction} onSubmit={onPreviewSubmit}>
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
              {unbotheredSlotConfirmationLabel}
            </button>
          </form>
          {previewNotice ? (
            <p className="text-sm text-stone-700" role="status">
              Preview mode blocked saving that response.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ResponseForm({
  ariaLabel,
  label,
  onPreviewSubmit,
  previewMode,
  response,
  slug,
  variant
}: {
  ariaLabel: string;
  label: string;
  onPreviewSubmit: (event: FormEvent<HTMLFormElement>) => boolean;
  previewMode: boolean;
  response: "yes";
  slug: string;
  variant: "secondary" | "understated";
}) {
  const className =
    variant === "secondary"
      ? "min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
      : "min-h-11 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2";

  return (
    <form action={respondToInviteAction} onSubmit={onPreviewSubmit}>
      <input name="slug" type="hidden" value={slug} />
      <input
        name="previewMode"
        type="hidden"
        value={previewMode ? "true" : "false"}
      />
      <input name="response" type="hidden" value={response} />
      <button aria-label={ariaLabel} className={className} type="submit">
        {label}
      </button>
    </form>
  );
}
