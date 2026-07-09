"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import {
  CinematicEnvelope,
  CopyControl,
  FlightPathMap,
  KindReplySuggestions,
  ModeBadge,
  MotionSpecTable,
  PaperLetter,
  PostalStamp,
  Postmark,
  PrimaryButton,
  PrivateLinkNotice,
  SecondaryButton,
  StatusCard,
  StepIndicator,
  WaxSeal
} from "../ui";

type PrototypeScreen =
  | "landing"
  | "create"
  | "share"
  | "recipient-sealed"
  | "recipient-open"
  | "recipient-lawyer"
  | "recipient-unbothered"
  | "recipient-lawyer-no"
  | "recipient-accepted"
  | "recipient-raincheck"
  | "recipient-declined"
  | "recipient-unknown"
  | "recipient-expired"
  | "recipient-cancelled"
  | "recipient-not-found"
  | "sender-pending"
  | "sender-opened"
  | "sender-accepted"
  | "sender-raincheck"
  | "sender-declined"
  | "sender-flagged"
  | "motion";

const screens: Array<{ group: string; id: PrototypeScreen; label: string }> = [
  { group: "Route /", id: "landing", label: "Landing" },
  { group: "Route /create", id: "create", label: "Create" },
  { group: "Route /create", id: "share", label: "Seal and send" },
  { group: "Route /i/[slug]", id: "recipient-sealed", label: "Sealed" },
  { group: "Route /i/[slug]", id: "recipient-open", label: "Open" },
  { group: "Route /i/[slug]", id: "recipient-lawyer", label: "Lawyer" },
  { group: "Route /i/[slug]", id: "recipient-unbothered", label: "Unbothered" },
  { group: "Route /i/[slug]", id: "recipient-lawyer-no", label: "No recess" },
  { group: "Route /i/[slug]", id: "recipient-accepted", label: "Accepted" },
  { group: "Route /i/[slug]", id: "recipient-raincheck", label: "Raincheck" },
  { group: "Route /i/[slug]", id: "recipient-declined", label: "Declined" },
  { group: "Route /i/[slug]", id: "recipient-unknown", label: "Unknown sender" },
  { group: "Route /i/[slug]", id: "recipient-expired", label: "Expired" },
  { group: "Route /i/[slug]", id: "recipient-cancelled", label: "Cancelled" },
  { group: "Route /i/[slug]", id: "recipient-not-found", label: "Not found" },
  { group: "Route /s/[token]", id: "sender-pending", label: "Pending" },
  { group: "Route /s/[token]", id: "sender-opened", label: "Opened" },
  { group: "Route /s/[token]", id: "sender-accepted", label: "Accepted" },
  { group: "Route /s/[token]", id: "sender-raincheck", label: "Raincheck" },
  { group: "Route /s/[token]", id: "sender-declined", label: "Declined" },
  { group: "Route /s/[token]", id: "sender-flagged", label: "Flagged" },
  { group: "Spec", id: "motion", label: "Motion" }
];

const groups = Array.from(new Set(screens.map((screen) => screen.group)));

export function NocturnalPostalPrototype() {
  const [screen, setScreen] = useState<PrototypeScreen>("landing");

  const activeLabel = useMemo(
    () => screens.find((item) => item.id === screen)?.label ?? "Landing",
    [screen]
  );

  return (
    <main className="paper-grain min-h-screen overflow-x-hidden bg-wink-background text-wink-text">
      <PrototypeSwitcher
        activeLabel={activeLabel}
        screen={screen}
        setScreen={setScreen}
      />
      <div className="pt-[132px] sm:pt-[112px]">
        {screen === "landing" ? (
          <LandingPrototype onSample={() => setScreen("recipient-open")} />
        ) : null}
        {screen === "create" ? <CreatePrototype /> : null}
        {screen === "share" ? <SharePrototype /> : null}
        {screen.startsWith("recipient-") ? (
          <RecipientPrototype screen={screen} setScreen={setScreen} />
        ) : null}
        {screen.startsWith("sender-") ? <SenderPrototype screen={screen} /> : null}
        {screen === "motion" ? <MotionPrototype /> : null}
      </div>
    </main>
  );
}

function PrototypeSwitcher({
  activeLabel,
  screen,
  setScreen
}: {
  activeLabel: string;
  screen: PrototypeScreen;
  setScreen: (screen: PrototypeScreen) => void;
}) {
  return (
    <nav
      aria-label="Prototype-only state switcher"
      className="fixed inset-x-0 top-0 z-50 border-b border-wink-border bg-wink-surface/95 px-4 py-3 shadow-[0_8px_24px_rgba(24,21,18,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase text-wink-primary">
            Prototype only - {activeLabel}
          </p>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-wink-border bg-wink-surface px-3 py-2 text-sm font-semibold text-wink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
            href="/create"
          >
            Use real create flow
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {groups.map((group) => (
            <div className="flex shrink-0 items-center gap-2" key={group}>
              <span className="text-[0.66rem] font-semibold uppercase text-wink-text-secondary">
                {group}
              </span>
              {screens
                .filter((item) => item.group === group)
                .map((item) => (
                  <button
                    aria-pressed={screen === item.id}
                    className={[
                      "min-h-11 rounded-full border px-3 py-2 text-xs font-semibold",
                      "transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background motion-reduce:transition-none",
                      screen === item.id
                        ? "border-wink-primary bg-wink-primary text-wink-surface"
                        : "border-wink-border bg-wink-surface text-wink-text hover:bg-wink-surface-muted"
                    ].join(" ")}
                    key={item.id}
                    onClick={() => setScreen(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

function LandingPrototype({ onSample }: { onSample: () => void }) {
  return (
    <>
      <section className="relative min-h-[calc(100vh-132px)] overflow-hidden">
        <FlightPathMap className="absolute inset-0 min-h-full border-y-0" />
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-132px)] w-full max-w-[1120px] items-start gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(320px,0.8fr)] lg:px-12 lg:py-14">
          <div className="max-w-[620px] space-y-6">
            <p className="text-xs font-semibold uppercase text-wink-primary">
              WINK PRIVATE INVITATIONS
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-wink-text sm:text-6xl">
              Some questions deserve better than a text.
            </h1>
            <p className="max-w-[560px] text-base leading-7 text-wink-text-secondary sm:text-lg sm:leading-8">
              WINK turns &quot;are you free Thursday?&quot; into a letter worth answering.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-wink-primary px-5 py-3 text-sm font-semibold text-wink-surface transition duration-200 hover:-translate-y-0.5 hover:bg-wink-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background motion-reduce:transform-none motion-reduce:transition-none"
                href="/create"
              >
                Write yours
              </Link>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-wink-border bg-wink-surface px-5 py-3 text-sm font-semibold text-wink-text transition duration-200 hover:-translate-y-0.5 hover:bg-wink-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background motion-reduce:transform-none motion-reduce:transition-none"
                onClick={onSample}
                type="button"
              >
                See a sample letter
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1120px] space-y-16 px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          <PostalStep body="Write the name, message, mode, and plan." number="01" title="Write" />
          <PostalStep body="Send one private recipient link. Keep the sender link separate." number="02" title="Send" />
          <PostalStep body="They answer Yes, Raincheck, or No with equal reach." number="03" title="They answer" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ModeLetter
            mode="lawyer"
            sample="Clause 1: The undersigned proposes dinner this Thursday."
            stamp="EXHIBIT A"
          />
          <ModeLetter
            mode="unbothered"
            sample="There's a table Thursday. You're invited. No pressure, obviously."
            stamp="PRIVATE POST"
          />
        </div>

        <div className="border-t border-wink-border pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-wink-primary">
                The letter travels
              </p>
              <h2 className="mt-2 font-display text-3xl text-wink-text">
                Write yours.
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-wink-primary px-5 py-3 text-sm font-semibold text-wink-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
              href="/create"
            >
              Write yours
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function CreatePrototype() {
  const [recipient, setRecipient] = useState("Maya");
  const [sender, setSender] = useState("Alex");
  const [message, setMessage] = useState("Dinner Thursday. I have a small case to make.");
  const [mode, setMode] = useState<"lawyer" | "unbothered">("lawyer");

  return (
    <section className="mx-auto grid w-full max-w-[1120px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,560px)_minmax(320px,1fr)] lg:px-12">
      <div className="paper-grain rounded-lg border border-wink-border bg-wink-surface p-6 shadow-[0_3px_8px_rgba(24,21,18,0.1),0_24px_64px_rgba(24,21,18,0.1)] sm:p-8">
        <div className="space-y-6">
          <StepIndicator currentStep={2} label="Message and mode" totalSteps={3} />
          <div>
            <p className="text-xs font-semibold uppercase text-wink-primary">
              Write the letter
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-wink-text">
              Draft the invitation at the desk.
            </h1>
          </div>
          <div className="grid gap-5">
            <FormControl
              label="Recipient name"
              onChange={setRecipient}
              value={recipient}
            />
            <FormControl label="Sender name" onChange={setSender} value={sender} />
            <label className="space-y-2">
              <span className="block text-sm font-semibold text-wink-text">
                Message
              </span>
              <textarea
                className="min-h-32 w-full rounded-md border border-wink-border bg-wink-surface px-3 py-3 text-base text-wink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
                onChange={(event) => setMessage(event.target.value)}
                value={message}
              />
            </label>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-wink-text">
                Mode
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ModeSelectCard
                  checked={mode === "lawyer"}
                  mode="lawyer"
                  onSelect={() => setMode("lawyer")}
                  sample="EXHIBIT A, but charming."
                />
                <ModeSelectCard
                  checked={mode === "unbothered"}
                  mode="unbothered"
                  onSelect={() => setMode("unbothered")}
                  sample="dry, calm, unpressed."
                />
              </div>
            </fieldset>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <SecondaryButton>Back</SecondaryButton>
            <PrimaryButton>Continue</PrimaryButton>
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:sticky lg:top-36 lg:self-start">
        <CinematicEnvelope recipient={recipient || "Maya"} size="md" />
        <PaperLetter
          eyebrow={mode === "lawyer" ? "EXHIBIT A: THE ASK" : "private note"}
          title={`For ${recipient || "Maya"}`}
          variant={mode}
        >
          <p className="whitespace-pre-wrap font-display text-xl italic leading-relaxed">
            {message}
          </p>
          <div className="rounded-md border border-wink-border bg-wink-surface-muted px-4 py-3 text-sm">
            Thursday - 7:30 PM - The Corner Cafe
          </div>
          <p className="text-sm text-wink-text-secondary">
            From {sender || "Alex"}
          </p>
        </PaperLetter>
      </div>
    </section>
  );
}

function SharePrototype() {
  return (
    <section className="mx-auto grid w-full max-w-[1120px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(280px,420px)_minmax(0,560px)] lg:items-center lg:px-12">
      <CinematicEnvelope recipient="Maya" size="lg" />
      <PaperLetter eyebrow="Seal and send" title="Your letter is ready.">
        <p className="text-base leading-7 text-wink-text-secondary">
          Send this private link to the recipient. The sender link stays copy-only
          and separate.
        </p>
        <CopyControl
          copyButtonLabel="Copy recipient link"
          label="Recipient link"
          value="https://wink.example/invite/maya-letter"
        />
        <CopyControl
          copyButtonLabel="Copy private sender link"
          label="Private sender link"
          value="https://wink.example/private/post-office-receipt"
        />
        <PrivateLinkNotice eyebrow="Private link">
          Anyone with the link can view the invitation or status page. Keep each
          link in the right hands.
        </PrivateLinkNotice>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SecondaryButton>Open invitation preview</SecondaryButton>
          <PrimaryButton>Create another</PrimaryButton>
        </div>
      </PaperLetter>
    </section>
  );
}

function RecipientPrototype({
  screen,
  setScreen
}: {
  screen: PrototypeScreen;
  setScreen: (screen: PrototypeScreen) => void;
}) {
  if (screen === "recipient-sealed") {
    return (
      <CenteredInvite>
        <div className="space-y-6 text-center">
          <CinematicEnvelope open={false} recipient="Maya" size="lg" />
          <div className="mx-auto max-w-[520px] space-y-3">
            <h1 className="font-display text-4xl leading-tight text-wink-text">
              A letter traveled to reach you.
            </h1>
            <p className="text-wink-text-secondary">Break the seal.</p>
          </div>
          <PrimaryButton onClick={() => setScreen("recipient-open")}>
            Break the seal
          </PrimaryButton>
        </div>
      </CenteredInvite>
    );
  }

  if (screen === "recipient-accepted") {
    return (
      <CenteredInvite>
        <PaperLetter eyebrow="Accepted" title="It's a date." variant="accepted">
          <div className="relative min-h-28 overflow-hidden rounded-md border border-wink-border bg-wink-surface-muted">
            <div aria-hidden="true" className="wink-accepted-burst absolute inset-0 opacity-35 motion-safe:animate-wink-seal-slam" />
            <div className="relative flex items-center justify-center gap-4 p-6">
              <WaxSeal className="motion-safe:animate-wink-seal-slam" label="ACCEPTED" size="lg" />
            </div>
          </div>
          <div className="border-t border-wink-accent pt-4">
            <p className="font-display text-2xl text-wink-text">Thursday - 7:30 PM</p>
            <p className="text-wink-text-secondary">The Corner Cafe, 12 Main Street</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SecondaryButton>Add to calendar</SecondaryButton>
            <SecondaryButton>Open in maps</SecondaryButton>
          </div>
        </PaperLetter>
      </CenteredInvite>
    );
  }

  if (screen === "recipient-raincheck") {
    return (
      <CenteredInvite>
        <PaperLetter eyebrow="Filed under: soon" title="No pressure.">
          <MoonMark />
          <p className="text-base leading-7 text-wink-text-secondary">
            This can become another day, another place, or another vibe.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Different day", "Different place", "Keep it casual", "Send note"].map((label) => (
              <SecondaryButton key={label}>{label}</SecondaryButton>
            ))}
          </div>
        </PaperLetter>
      </CenteredInvite>
    );
  }

  if (screen === "recipient-declined") {
    return (
      <CenteredInvite>
        <PaperLetter eyebrow="Answered" title="Thanks for answering honestly.">
          <p className="text-base leading-7 text-wink-text-secondary">
            This invitation is closed.
          </p>
          <KindReplySuggestions />
        </PaperLetter>
      </CenteredInvite>
    );
  }

  if (screen === "recipient-unknown") {
    return (
      <CenteredInvite>
        <PaperLetter eyebrow="Safety" title="You're safe to close this.">
          <p className="text-base leading-7 text-wink-text-secondary">
            This invitation won&apos;t contact you through this link.
          </p>
          <SecondaryButton>Close invitation</SecondaryButton>
        </PaperLetter>
      </CenteredInvite>
    );
  }

  if (screen === "recipient-expired" || screen === "recipient-cancelled" || screen === "recipient-not-found") {
    const copy = {
      "recipient-cancelled": ["Cancelled", "This invitation was closed quietly."],
      "recipient-expired": ["Expired", "This invitation is no longer open."],
      "recipient-not-found": ["Returned mail", "This letter could not be found."]
    }[screen];
    return (
      <CenteredInvite>
        <PaperLetter eyebrow={copy[0]} title={copy[1]}>
          <PostalStamp label={copy[0].toUpperCase()} tone={screen === "recipient-expired" ? "warning" : "accent"} />
          <p className="text-wink-text-secondary">
            No private details are shown here.
          </p>
        </PaperLetter>
      </CenteredInvite>
    );
  }

  const variant =
    screen === "recipient-lawyer"
      ? "lawyer"
      : screen === "recipient-unbothered"
        ? "unbothered"
        : "default";

  return (
    <CenteredInvite>
      <div className="space-y-5">
        <CinematicEnvelope className="opacity-45 blur-[1px]" open recipient="Maya" size="md" />
        <PaperLetter
          eyebrow={variant === "lawyer" ? "EXHIBIT A" : "A private invitation"}
          title={
            variant === "unbothered"
              ? "There's a table Thursday."
              : "Maya, Alex has a small case to make."
          }
          variant={variant}
        >
          <div className="flex flex-wrap items-center gap-3">
            <ModeBadge mode={variant === "unbothered" ? "unbothered" : "lawyer"} />
            {variant === "lawyer" ? (
              <PostalStamp className="motion-safe:animate-wink-stamp-thud" label="EXHIBIT A" />
            ) : null}
            <Postmark className="opacity-40" />
          </div>
          {screen === "recipient-lawyer-no" ? (
            <div className="rounded-md border border-wink-border bg-wink-surface-muted px-4 py-4">
              <p className="font-display text-2xl text-wink-text">
                Counsel requests a brief recess. Sustained?
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SecondaryButton>Final answer: No</SecondaryButton>
                <SecondaryButton>Reconsidering</SecondaryButton>
              </div>
            </div>
          ) : (
            <>
              <p className="font-display text-xl italic leading-relaxed text-wink-text">
                {variant === "unbothered"
                  ? "There's a table Thursday. You're invited. No pressure, obviously."
                  : "Clause 1: The undersigned proposes dinner this Thursday. Clause 2: The respondent may accept, raincheck, or decline without penalty."}
              </p>
              <dl className="grid gap-3 rounded-md border border-wink-border bg-wink-surface-muted p-4 text-sm sm:grid-cols-2">
                <Detail label="When" value="Thursday - 7:30 PM" />
                <Detail label="Where" value="The Corner Cafe" />
                <Detail label="From" value="Alex" />
                <Detail label="Mode" value={variant === "unbothered" ? "Unbothered" : "Lawyer"} />
              </dl>
              <ResponseChoices />
            </>
          )}
          <button
            className="min-h-11 w-full rounded-md border border-wink-danger/50 bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
            type="button"
          >
            I don&apos;t know this person
          </button>
        </PaperLetter>
      </div>
    </CenteredInvite>
  );
}

function SenderPrototype({ screen }: { screen: PrototypeScreen }) {
  const statusMap = {
    "sender-accepted": {
      description: "It's a date. The plan is now the keepsake.",
      status: "accepted",
      title: "Accepted."
    },
    "sender-declined": {
      description: "They answered honestly. No additional pressure belongs here.",
      quote: "Thank you, but not this time.",
      status: "declined",
      title: "Declined."
    },
    "sender-flagged": {
      description: "Safety state. This page does not reveal more recipient context.",
      status: "flagged",
      title: "Unavailable."
    },
    "sender-opened": {
      description: "The letter was opened.",
      status: "opened",
      title: "Opened."
    },
    "sender-pending": {
      description: "Still out for delivery.",
      status: "pending",
      title: "Pending."
    },
    "sender-raincheck": {
      description: "They asked for another version of the plan.",
      status: "rainchecked",
      title: "Rainchecked."
    }
  } as const;
  const copy = statusMap[screen as keyof typeof statusMap] ?? statusMap["sender-pending"];

  return (
    <section className="mx-auto w-full max-w-[680px] space-y-5 px-5 py-8 sm:px-8">
      <PrivateLinkNotice eyebrow="Private post office receipt">
        Anyone with this link can see this page. Keep it private.
      </PrivateLinkNotice>
      <StatusCard
        description={copy.description}
        quotedMessage={"quote" in copy ? copy.quote : undefined}
        status={copy.status}
        title={copy.title}
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="Recipient" value="Maya" />
          <Detail label="Plan" value="Thursday - The Corner Cafe" />
          <Detail label="Mode" value="Lawyer" />
          <Detail label="Link type" value="Private sender link" />
        </dl>
        <CopyControl
          copyButtonLabel="Copy recipient link"
          label="Recipient link"
          value="https://wink.example/invite/maya-letter"
        />
        {screen === "sender-pending" || screen === "sender-opened" ? (
          <SecondaryButton className="w-full">Cancel invitation</SecondaryButton>
        ) : null}
      </StatusCard>
    </section>
  );
}

function MotionPrototype() {
  return (
    <section className="mx-auto w-full max-w-[1120px] space-y-8 px-5 py-8 sm:px-8 lg:px-12">
      <div className="grid gap-5 md:grid-cols-3">
        <CinematicEnvelope interactive recipient="Maya" size="md" />
        <PaperLetter eyebrow="Component" title="Paper letter">
          <p className="text-sm leading-6 text-wink-text-secondary">
            Deckled edge, brass rule, paper grain, and contact shadow.
          </p>
        </PaperLetter>
        <div className="paper-grain flex items-center justify-center rounded-lg border border-wink-border bg-wink-surface p-8">
          <WaxSeal size="lg" />
        </div>
      </div>
      <MotionSpecTable />
    </section>
  );
}

function CenteredInvite({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-[calc(100vh-132px)] bg-wink-surface-muted px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[680px]">{children}</div>
    </section>
  );
}

function ResponseChoices() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase text-wink-text-secondary">
        Your move
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <PrimaryButton>Yes</PrimaryButton>
        <SecondaryButton>Raincheck</SecondaryButton>
        <SecondaryButton>No</SecondaryButton>
      </div>
    </div>
  );
}

function PostalStep({
  body,
  number,
  title
}: {
  body: string;
  number: string;
  title: string;
}) {
  return (
    <article className="border-t border-wink-border pt-5">
      <p className="font-display text-3xl text-wink-accent">{number}</p>
      <h2 className="mt-3 font-display text-2xl text-wink-text">{title}</h2>
      <p className="mt-2 leading-7 text-wink-text-secondary">{body}</p>
    </article>
  );
}

function ModeLetter({
  mode,
  sample,
  stamp
}: {
  mode: "lawyer" | "unbothered";
  sample: string;
  stamp: string;
}) {
  return (
    <PaperLetter
      className="hover:-translate-y-1 motion-safe:transition-transform motion-safe:duration-200 motion-reduce:transform-none"
      eyebrow={`${mode} mode`}
      title={mode === "lawyer" ? "A small case." : "Cool. calm. sent."}
      variant={mode}
    >
      <div className="flex items-center justify-between gap-3">
        <ModeBadge mode={mode} />
        <PostalStamp label={stamp} />
      </div>
      <p className="font-display text-xl italic leading-relaxed text-wink-text">
        {sample}
      </p>
    </PaperLetter>
  );
}

function ModeSelectCard({
  checked,
  mode,
  onSelect,
  sample
}: {
  checked: boolean;
  mode: "lawyer" | "unbothered";
  onSelect: () => void;
  sample: string;
}) {
  return (
    <button
      aria-pressed={checked}
      className={[
        "min-h-28 rounded-md border bg-wink-surface p-4 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background motion-reduce:transition-none",
        checked
          ? "border-wink-primary bg-wink-surface-muted"
          : "border-wink-border hover:bg-wink-surface-muted"
      ].join(" ")}
      onClick={onSelect}
      type="button"
    >
      <span className="flex flex-wrap items-center gap-2">
        <ModeBadge mode={mode} />
        {checked ? (
          <span className="rounded-full border border-wink-primary px-2 py-0.5 text-xs font-semibold text-wink-primary">
            Selected
          </span>
        ) : null}
      </span>
      <span className="mt-3 block text-sm leading-6 text-wink-text-secondary">
        {sample}
      </span>
    </button>
  );
}

function FormControl({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-semibold text-wink-text">{label}</span>
      <input
        className="min-h-11 w-full rounded-md border border-wink-border bg-wink-surface px-3 py-2 text-base text-wink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-wink-text-secondary">{label}</dt>
      <dd className="break-words text-wink-text">{value}</dd>
    </div>
  );
}

function MoonMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-20 w-20 text-wink-warning"
      fill="none"
      viewBox="0 0 80 80"
    >
      <path
        className="motion-safe:animate-wink-route-draw"
        d="M52 12C39 16 30 28 30 42s9 26 22 30c-4 3-10 5-16 5C17 77 3 62 3 42S17 7 36 7c6 0 12 2 16 5Z"
        pathLength="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}
