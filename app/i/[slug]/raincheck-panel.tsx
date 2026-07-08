"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import { respondToInviteAction } from "./actions";
import {
  raincheckNoteMaxLength,
  raincheckQuickOptions
} from "@/lib/invite-page";
import type { RaincheckOption } from "@/lib/invite-store";

export function RaincheckPanel({
  previewMode,
  slug,
  triggerLabel
}: {
  previewMode: boolean;
  slug: string;
  triggerLabel: string;
}) {
  const panelId = useId();
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [selectedOption, setSelectedOption] =
    useState<RaincheckOption>("different_day");
  const [previewNotice, setPreviewNotice] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!previewMode) {
      return;
    }

    event.preventDefault();
    setPreviewNotice(true);
  }

  useEffect(() => {
    if (open) {
      panelHeadingRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return (
      <button
        aria-controls={panelId}
        aria-expanded="false"
        className="min-h-11 w-full rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
        onClick={() => {
          setOpen(true);
          setPreviewNotice(false);
        }}
        type="button"
      >
        {triggerLabel}
      </button>
    );
  }

  return (
    <section
      aria-labelledby={`${panelId}-heading`}
      className="space-y-4 rounded-md border border-wink-border bg-wink-background p-4"
      id={panelId}
    >
      <div className="space-y-1">
        <h3
          className="text-lg font-semibold text-wink-text"
          id={`${panelId}-heading`}
          ref={panelHeadingRef}
          tabIndex={-1}
        >
          Bad timing?
        </h3>
        <p className="text-sm text-wink-text-secondary">
          No pressure. Want to suggest something that works better?
        </p>
        <p className="text-sm text-wink-text-secondary">
          This does not commit you to anything.
        </p>
        {previewMode ? (
          <p className="text-sm text-wink-text-secondary">
            Preview mode is on. Rainchecks will not be saved.
          </p>
        ) : null}
      </div>

      <form
        action={respondToInviteAction}
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <input name="slug" type="hidden" value={slug} />
        <input
          name="previewMode"
          type="hidden"
          value={previewMode ? "true" : "false"}
        />
        <input name="response" type="hidden" value="raincheck" />

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-wink-text">
            Pick a quick option
          </legend>
          <div className="grid gap-2">
            {raincheckQuickOptions.map((option) => (
              <label
                className={`flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm font-semibold focus-within:ring-2 focus-within:ring-wink-focus focus-within:ring-offset-2 focus-within:ring-offset-wink-background ${
                  selectedOption === option.value
                    ? "border-wink-primary bg-wink-surface text-wink-primary"
                    : "border-wink-border bg-wink-background text-wink-text"
                }`}
                key={option.value}
              >
                <input
                  checked={selectedOption === option.value}
                  className="h-4 w-4"
                  name="raincheckOption"
                  onChange={() => setSelectedOption(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-wink-text"
            htmlFor={`${panelId}-note`}
          >
            Want to add a note?
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-wink-border bg-wink-surface px-3 py-2 text-base text-wink-text outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
            id={`${panelId}-note`}
            maxLength={raincheckNoteMaxLength}
            name="counterOfferMessage"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Maybe next week? Or somewhere more chill?"
            rows={3}
            value={note}
          />
          <p className="text-sm text-wink-text-secondary">
            {raincheckNoteMaxLength - note.length} characters remaining
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-wink-text"
            htmlFor={`${panelId}-suggested-date`}
          >
            Suggested day
          </label>
          <input
            className="min-h-11 w-full rounded-md border border-wink-border bg-wink-surface px-3 py-2 text-base text-wink-text outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
            id={`${panelId}-suggested-date`}
            name="suggestedDate"
            type="date"
          />
        </div>

        {previewNotice ? (
          <p className="text-sm text-wink-text-secondary" role="status">
            Preview mode blocked saving that raincheck.
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="min-h-11 rounded-md bg-wink-primary px-4 py-2 text-sm font-semibold text-wink-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
            type="submit"
          >
            Send raincheck
          </button>
          <button
            className="min-h-11 rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
            onClick={() => {
              setOpen(false);
              setPreviewNotice(false);
            }}
            type="button"
          >
            Back
          </button>
        </div>
      </form>
    </section>
  );
}
