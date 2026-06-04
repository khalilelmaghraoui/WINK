"use client";

import { useId, useState } from "react";
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

  if (!open) {
    return (
      <button
        aria-controls={panelId}
        aria-expanded="false"
        className="min-h-11 w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
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
      className="space-y-4 rounded-lg border border-stone-300 bg-stone-50 p-4"
      id={panelId}
    >
      <div className="space-y-1">
        <h3
          className="text-lg font-semibold text-stone-950"
          id={`${panelId}-heading`}
        >
          Bad timing?
        </h3>
        <p className="text-sm text-stone-700">
          No pressure. Want to suggest something that works better?
        </p>
        {previewMode ? (
          <p className="text-sm text-stone-700">
            Preview mode is on. Rainchecks will not be saved.
          </p>
        ) : null}
      </div>

      <form action={respondToInviteAction} className="space-y-4" onSubmit={handleSubmit}>
        <input name="slug" type="hidden" value={slug} />
        <input
          name="previewMode"
          type="hidden"
          value={previewMode ? "true" : "false"}
        />
        <input name="response" type="hidden" value="raincheck" />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-stone-950">
            Pick a quick option
          </legend>
          <div className="grid gap-2">
            {raincheckQuickOptions.map((option) => (
              <label
                className={`flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-stone-950 focus-within:ring-offset-2 ${
                  selectedOption === option.value
                    ? "border-stone-950 bg-white text-stone-950"
                    : "border-stone-300 bg-stone-50 text-stone-800"
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
            className="block text-sm font-medium text-stone-950"
            htmlFor={`${panelId}-note`}
          >
            Want to add a note?
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/20"
            id={`${panelId}-note`}
            maxLength={raincheckNoteMaxLength}
            name="counterOfferMessage"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Maybe next week? Or somewhere more chill?"
            rows={3}
            value={note}
          />
          <p className="text-sm text-stone-600">
            {raincheckNoteMaxLength - note.length} characters remaining
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-stone-950"
            htmlFor={`${panelId}-suggested-date`}
          >
            Suggested day
          </label>
          <input
            className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/20"
            id={`${panelId}-suggested-date`}
            name="suggestedDate"
            type="date"
          />
        </div>

        {previewNotice ? (
          <p className="text-sm text-stone-700" role="status">
            Preview mode blocked saving that raincheck.
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="min-h-11 rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
            type="submit"
          >
            Send raincheck
          </button>
          <button
            className="min-h-11 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
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
