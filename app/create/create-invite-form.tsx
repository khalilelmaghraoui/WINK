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
import {
  FormField,
  InviteCard,
  PageShell,
  PrimaryButton,
  PrivateLinkNotice,
  SecondaryButton,
  SectionDivider,
  StepIndicator
} from "../../components/ui";

const initialState: CreateInviteActionState = {
  errors: {}
};

const steps = [
  "Recipient and sender",
  "Message and mode",
  "Date plan and place"
] as const;

const stepDescriptions = [
  "Who is making the ask, and who gets the private invitation?",
  "Write the line they will read first, then choose the personality.",
  "Set the when and where with native date and time controls."
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
      <PageShell className="flex items-center py-8 sm:py-12" maxWidth="form">
        <InviteCard
          eyebrow="Invite created"
          title="Save these links carefully"
          titleId="create-success-heading"
          variant="live"
        >
          <p className="text-base leading-7 text-wink-text-secondary">
            The recipient gets one link. You keep the private sender link.
          </p>

          <section className="space-y-4 border-t border-wink-border pt-5">
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
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text transition-colors duration-200 hover:border-wink-primary hover:text-wink-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background motion-reduce:transition-none sm:w-auto"
              href={recipientPath}
            >
              View invite
            </Link>
          </section>

          <section className="space-y-4 border-t border-wink-border pt-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-wink-text-secondary">
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
            </div>
            <CopyPrivateSenderLinkControl senderPath={senderPath} />
            <PrivateLinkNotice eyebrow="Private sender link">
              Anyone with this link can view the sender page. Save it now -
              WINK cannot recover it later.
            </PrivateLinkNotice>
          </section>

          <p className="border-t border-wink-border pt-4 text-sm leading-6 text-wink-text-secondary">
            Send only the recipient link. Keep the sender link somewhere
            private.
          </p>
        </InviteCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="py-8 sm:py-12" maxWidth="form">
      <form
        action={formAction}
        className="space-y-8 rounded-lg border border-wink-border bg-wink-surface p-8 shadow-[0_14px_36px_rgba(24,21,18,0.06)] sm:p-10"
        noValidate
      >
        <header className="space-y-4">
          <StepIndicator
            currentStep={stepIndex + 1}
            label={steps[stepIndex]}
            totalSteps={steps.length}
          />
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-wink-text-secondary">
              WINK private invitation
            </p>
            <h1 className="font-display text-3xl leading-tight text-wink-text sm:text-4xl">
              {steps[stepIndex]}
            </h1>
            <p className="text-base leading-7 text-wink-text-secondary">
              {stepDescriptions[stepIndex]}
            </p>
          </div>
          {currentStepHasErrors ? (
            <p className="text-sm font-semibold text-wink-danger" role="status">
              Fix the highlighted fields before continuing.
            </p>
          ) : null}
          {state.serviceError ? (
            <p className="text-sm font-semibold text-wink-danger" role="status">
              {state.serviceError}
            </p>
          ) : null}
        </header>

        <SectionDivider variant="accent" />

        <section hidden={stepIndex !== 0} className="space-y-6">
          <TextField
            error={state.errors.senderName}
            id="senderName"
            label="Your name"
            name="senderName"
            helperText="This appears inside the invitation content, not metadata."
            required
          />
          <TextField
            error={state.errors.recipientName}
            id="recipientName"
            label="Recipient name"
            name="recipientName"
            helperText="Use the name they will recognize when the private link opens."
            required
          />
        </section>

        <section hidden={stepIndex !== 1} className="space-y-6">
          <TextAreaField
            error={state.errors.message}
            id="message"
            label="Message"
            name="message"
            helperText="This is the line they will read first."
            required
          />
          <SelectField
            error={state.errors.tone}
            id="tone"
            label="Tone"
            name="tone"
            helperText="Tone changes the framing, not the consent mechanics."
            options={[
              { label: "Cute", value: "cute" },
              { label: "Funny", value: "funny" },
              { label: "Romantic", value: "romantic" },
              { label: "Bold", value: "bold" }
            ]}
            required
          />
          <ModeChoiceField
            error={state.errors.mode}
          />
        </section>

        <section hidden={stepIndex !== 2} className="space-y-6">
          <SelectField
            error={state.errors.dateType}
            id="dateType"
            label="Date type"
            name="dateType"
            helperText="Pick the kind of moment this invitation is setting up."
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
            helperText="Native date input, so the browser handles the picker."
            required
            type="date"
          />
          <TextField
            error={state.errors.time}
            id="time"
            label="Time"
            name="time"
            helperText="Native time input; no custom picker added."
            required
            type="time"
          />
          <TextField
            error={state.errors.placeName}
            id="placeName"
            label="Place name"
            name="placeName"
            helperText="Restaurant, cafe, venue, or wherever the plan starts."
            required
          />
          <TextField
            error={state.errors.placeAddress}
            id="placeAddress"
            label="Place address"
            name="placeAddress"
            helperText="Used later for the accepted plan view."
            required
          />
        </section>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          {stepIndex > 0 ? (
            <SecondaryButton
              className="w-full sm:w-auto"
              type="button"
              onClick={() => setStepIndex((current) => current - 1)}
            >
              Back
            </SecondaryButton>
          ) : null}
          {stepIndex < steps.length - 1 ? (
            <PrimaryButton
              className="w-full sm:w-auto"
              type="button"
              onClick={() => setStepIndex((current) => current + 1)}
            >
              Continue
            </PrimaryButton>
          ) : (
            <SubmitButton />
          )}
        </div>
      </form>
    </PageShell>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <PrimaryButton
      className="w-full sm:w-auto"
      type="submit"
      disabled={pending}
      loading={pending}
    >
      {pending ? "Creating..." : "Create invite"}
    </PrimaryButton>
  );
}

interface FieldProps {
  error?: string;
  helperText?: string;
  id: CreateInviteField;
  label: string;
  name: CreateInviteField;
  required?: boolean;
}

function TextField({
  error,
  helperText,
  id,
  label,
  name,
  required = false,
  type = "text"
}: FieldProps & { type?: "date" | "text" | "time" }) {
  return (
    <FormField
      errorText={error}
      helperText={helperText}
      id={id}
      label={label}
      name={name}
      required={required}
      type={type}
    />
  );
}

function TextAreaField({
  error,
  helperText,
  id,
  label,
  name,
  required = false
}: FieldProps) {
  return (
    <FormField
      errorText={error}
      helperText={helperText}
      id={id}
      label={label}
      name={name}
      required={required}
      rows={5}
      type="textarea"
    />
  );
}

function SelectField({
  error,
  helperText,
  id,
  label,
  name,
  options,
  required = false
}: FieldProps & { options: Array<{ label: string; value: string }> }) {
  return (
    <FormField
      defaultValue=""
      errorText={error}
      helperText={helperText}
      id={id}
      label={label}
      name={name}
      options={options}
      placeholder="Choose one"
      required={required}
      type="select"
    />
  );
}

function ModeChoiceField({ error }: { error?: string }) {
  const errorId = error ? "mode-error" : undefined;
  const helperId = "mode-helper";

  return (
    <fieldset
      aria-describedby={[helperId, errorId].filter(Boolean).join(" ")}
      className="space-y-3"
    >
      <legend className="text-sm font-semibold text-wink-text">
        Mode
        <span className="ml-2 text-wink-danger" aria-hidden="true">
          Required
        </span>
      </legend>
      <p className="text-sm leading-6 text-wink-text-secondary" id={helperId}>
        Choose the invitation personality. The submitted values stay exactly
        lawyer or unbothered.
      </p>
      <div className="grid gap-3">
        <ModeOption
          description="Mock-formal, structured, and charmingly persuasive."
          label="Lawyer"
          value="lawyer"
        />
        <ModeOption
          description="Cool, low-pressure, dry, and restrained."
          label="Unbothered"
          value="unbothered"
        />
      </div>
      {error ? (
        <p className="text-sm font-semibold leading-6 text-wink-danger" id={errorId}>
          Error: {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function ModeOption({
  description,
  label,
  value
}: {
  description: string;
  label: string;
  value: "lawyer" | "unbothered";
}) {
  return (
    <label className="group block cursor-pointer">
      <input
        className="peer sr-only"
        name="mode"
        required
        type="radio"
        value={value}
      />
      <span className="flex min-h-11 items-start gap-3 rounded-md border border-wink-border bg-wink-surface px-3 py-3 text-wink-text transition-colors duration-200 peer-checked:border-wink-primary peer-checked:bg-wink-surface-muted peer-focus-visible:ring-2 peer-focus-visible:ring-wink-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-wink-background motion-reduce:transition-none">
        <span
          aria-hidden="true"
          className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-wink-border bg-wink-surface group-has-[:checked]:border-wink-primary"
        >
          <span className="hidden h-2 w-2 rounded-full bg-wink-primary group-has-[:checked]:block" />
        </span>
        <span className="min-w-0 space-y-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{label}</span>
            <span
              className="hidden rounded-full border border-wink-primary px-2 py-0.5 text-xs font-semibold text-wink-primary group-has-[:checked]:inline-flex"
            >
              Selected
            </span>
          </span>
          <span className="block text-sm leading-6 text-wink-text-secondary">
            {description}
          </span>
        </span>
      </span>
    </label>
  );
}
