"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createInviteAction,
  type CreateInviteActionState
} from "./actions";
import { CopyPrivateSenderLinkControl } from "./copy-private-sender-link-control";
import { ShareRecipientLinkControl } from "./share-recipient-link-control";
import type { CreateInviteField } from "@/lib/create-invite-validation";

const initialState: CreateInviteActionState = {
  errors: {}
};

const steps = [
  "Recipient and sender",
  "Message and mode",
  "Date plan and place"
] as const;

const stepFields: CreateInviteField[][] = [
  ["senderName", "recipientName"],
  ["message", "tone", "mode"],
  ["dateType", "date", "time", "placeName", "placeAddress"]
];

export function CreateInviteForm() {
  const [state, formAction] = useActionState(createInviteAction, initialState);
  const [stepIndex, setStepIndex] = useState(0);

  const currentStepFields = stepFields[stepIndex];
  const currentStepHasErrors = useMemo(
    () => currentStepFields.some((field) => state.errors[field]),
    [currentStepFields, state.errors]
  );

  useEffect(() => {
    const firstErrorStep = stepFields.findIndex((fields) =>
      fields.some((field) => state.errors[field])
    );

    if (firstErrorStep >= 0) {
      setStepIndex(firstErrorStep);
    }
  }, [state.errors]);

  const recipientPath = state.recipientPath ?? state.invitePath;
  const senderPath = state.senderPath;

  if (recipientPath && senderPath) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center bg-wink-background px-5 py-10 text-wink-text">
        <div className="space-y-6 rounded-lg border border-wink-border bg-wink-surface p-5 shadow-[0_18px_50px_rgba(24,21,18,0.08)]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-wink-text-secondary">
              Invite created
            </p>
            <h1 className="font-display text-3xl font-semibold text-wink-text">
              Save these links carefully
            </h1>
            <p className="text-base leading-7 text-wink-text-secondary">
              The recipient gets one link. You keep the private sender link.
            </p>
          </div>

          <section className="space-y-4 rounded-lg border border-wink-primary bg-wink-surface p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-wink-primary">
                Recipient link
              </p>
              <h2 className="text-lg font-semibold text-wink-text">
                Share this with the recipient
              </h2>
              <p className="text-sm leading-6 text-wink-text-secondary">
                This opens the invitation and lets them respond.
              </p>
            </div>
            <ShareRecipientLinkControl recipientPath={recipientPath} />
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text transition-colors hover:border-wink-primary hover:text-wink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 sm:w-auto"
              href={recipientPath}
            >
              View invite
            </Link>
          </section>

          <section className="space-y-4 rounded-lg border border-wink-border bg-wink-surface-muted/40 p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-wink-danger">
                Private sender link
              </p>
              <h2 className="text-lg font-semibold text-wink-text">
                Keep this private link
              </h2>
              <p className="text-sm leading-6 text-wink-text-secondary">
                Use it to check the invitation status, copy the recipient link
                again, cancel before they answer, and read an optional declined
                message.
              </p>
              <p className="text-sm font-semibold leading-6 text-wink-danger">
                Anyone with this link can view the sender page. Save it now -
                WINK cannot recover it later.
              </p>
            </div>
            <CopyPrivateSenderLinkControl senderPath={senderPath} />
          </section>

          <p className="border-t border-wink-border pt-4 text-sm leading-6 text-wink-text-secondary">
            Send only the recipient link. Keep the sender link somewhere
            private.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8">
      <form action={formAction} className="space-y-6" noValidate>
        <header className="space-y-3">
          <p className="text-sm font-medium text-stone-600">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h1 className="text-2xl font-semibold text-stone-950">
            {steps[stepIndex]}
          </h1>
          {currentStepHasErrors ? (
            <p className="text-sm text-red-700" role="status">
              Fix the highlighted fields before continuing.
            </p>
          ) : null}
          {state.serviceError ? (
            <p className="text-sm text-red-700" role="status">
              {state.serviceError}
            </p>
          ) : null}
        </header>

        <section hidden={stepIndex !== 0} className="space-y-4">
          <TextField
            error={state.errors.senderName}
            id="senderName"
            label="Your name"
            name="senderName"
            required
          />
          <TextField
            error={state.errors.recipientName}
            id="recipientName"
            label="Recipient name"
            name="recipientName"
            required
          />
        </section>

        <section hidden={stepIndex !== 1} className="space-y-4">
          <TextAreaField
            error={state.errors.message}
            id="message"
            label="Message"
            name="message"
            required
          />
          <SelectField
            error={state.errors.tone}
            id="tone"
            label="Tone"
            name="tone"
            options={[
              { label: "Cute", value: "cute" },
              { label: "Funny", value: "funny" },
              { label: "Romantic", value: "romantic" },
              { label: "Bold", value: "bold" }
            ]}
            required
          />
          <SelectField
            error={state.errors.mode}
            id="mode"
            label="Mode"
            name="mode"
            options={[
              { label: "Lawyer", value: "lawyer" },
              { label: "Unbothered", value: "unbothered" }
            ]}
            required
          />
        </section>

        <section hidden={stepIndex !== 2} className="space-y-4">
          <SelectField
            error={state.errors.dateType}
            id="dateType"
            label="Date type"
            name="dateType"
            options={[
              { label: "Date", value: "date" },
              { label: "Apology", value: "apology" },
              { label: "Surprise", value: "surprise" },
              { label: "Romantic moment", value: "romantic_moment" }
            ]}
            required
          />
          <TextField
            error={state.errors.date}
            id="date"
            label="Date"
            name="date"
            required
            type="date"
          />
          <TextField
            error={state.errors.time}
            id="time"
            label="Time"
            name="time"
            required
            type="time"
          />
          <TextField
            error={state.errors.placeName}
            id="placeName"
            label="Place name"
            name="placeName"
            required
          />
          <TextField
            error={state.errors.placeAddress}
            id="placeAddress"
            label="Place address"
            name="placeAddress"
            required
          />
        </section>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="min-h-11 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-950"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              Back
            </button>
          ) : null}
          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              className="min-h-11 rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white"
              onClick={() => setStepIndex((current) => current + 1)}
            >
              Continue
            </button>
          ) : (
            <SubmitButton />
          )}
        </div>
      </form>
    </main>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="min-h-11 rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Creating..." : "Create invite"}
    </button>
  );
}

interface FieldProps {
  error?: string;
  id: CreateInviteField;
  label: string;
  name: CreateInviteField;
  required?: boolean;
}

function TextField({
  error,
  id,
  label,
  name,
  required = false,
  type = "text"
}: FieldProps & { type?: "date" | "text" | "time" }) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-950" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/20"
        id={id}
        name={name}
        required={required}
        type={type}
      />
      <ErrorMessage error={error} id={errorId} />
    </div>
  );
}

function TextAreaField({
  error,
  id,
  label,
  name,
  required = false
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-950" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        className="min-h-32 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/20"
        id={id}
        name={name}
        required={required}
        rows={5}
      />
      <ErrorMessage error={error} id={errorId} />
    </div>
  );
}

function SelectField({
  error,
  id,
  label,
  name,
  options,
  required = false
}: FieldProps & { options: Array<{ label: string; value: string }> }) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-950" htmlFor={id}>
        {label}
      </label>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950 outline-none focus:border-stone-950 focus:ring-2 focus:ring-stone-950/20"
        defaultValue=""
        id={id}
        name={name}
        required={required}
      >
        <option disabled value="">
          Choose one
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorMessage error={error} id={errorId} />
    </div>
  );
}

function ErrorMessage({ error, id }: { error?: string; id: string }) {
  if (!error) {
    return null;
  }

  return (
    <p className="text-sm text-red-700" id={id}>
      {error}
    </p>
  );
}
