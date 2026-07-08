"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  sendRecipientMessageAction,
  type RecipientMessageActionState
} from "./actions";
import {
  getKindReplyIntro,
  kindReplyOptions
} from "@/lib/invite-page";
import type { Invite } from "@/lib/invite-store";
import { recipientMessageMaxLength } from "@/lib/recipient-message";

const initialRecipientMessageActionState: RecipientMessageActionState = {
  status: "idle"
};

export function KindReplyAssistant({ invite }: { invite: Invite }) {
  if (invite.hasSenderAccess) {
    return <RealKindReplyComposer invite={invite} />;
  }

  return <LegacyKindReplyIdeas invite={invite} />;
}

function RealKindReplyComposer({ invite }: { invite: Invite }) {
  const [state, formAction] = useActionState(
    sendRecipientMessageAction,
    initialRecipientMessageActionState
  );
  const [message, setMessage] = useState(invite.recipientMessage ?? "");
  const sent =
    state.status === "success" || invite.recipientMessageSentAt !== null;
  const remaining = recipientMessageMaxLength - message.length;

  if (sent) {
    return (
      <section
        aria-labelledby="kind-reply-heading"
        className="space-y-3 border-t border-wink-border pt-5"
      >
        <p className="text-xs font-semibold uppercase text-wink-text-secondary">
          Optional message
        </p>
        <h2
          className="text-lg font-semibold text-wink-text"
          id="kind-reply-heading"
        >
          Message saved.
        </h2>
        <p className="text-base text-wink-text-secondary">
          The sender can read it from their private WINK link. No notification
          was sent.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="kind-reply-heading"
      className="space-y-4 border-t border-wink-border pt-5"
    >
      <div className="space-y-2">
        <h2
          className="text-lg font-semibold text-wink-text"
          id="kind-reply-heading"
        >
          Want to leave a kind message?
        </h2>
        <p className="text-base text-wink-text-secondary">
          This is optional. The sender can read it from their private WINK link.
          WINK does not send a notification.
        </p>
        <p className="text-sm font-semibold text-wink-text-secondary">
          You do not owe anyone an explanation.
        </p>
        <p className="text-sm text-wink-text-secondary">
          {getKindReplyIntro(invite)}
        </p>
      </div>

      <div className="grid gap-3">
        {kindReplyOptions.map((reply, index) => (
          <article
            className="space-y-3 border-t border-wink-border pt-3 first:border-t-0 first:pt-0"
            key={reply}
          >
            <p className="text-base leading-7 text-wink-text">{reply}</p>
            <button
              aria-label={`Use kind message option ${index + 1}`}
              className="min-h-11 rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
              onClick={() => setMessage(reply)}
              type="button"
            >
              Use this message
            </button>
          </article>
        ))}
      </div>

      <form action={formAction} className="space-y-3">
        <input name="slug" type="hidden" value={invite.slug} />
        <input name="previewMode" type="hidden" value="false" />
        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-wink-text"
            htmlFor="recipient-kind-message"
          >
            Your optional message
          </label>
          <textarea
            aria-describedby="recipient-kind-message-help"
            className="min-h-32 w-full rounded-md border border-wink-border bg-wink-surface px-3 py-2 text-base text-wink-text outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
            id="recipient-kind-message"
            maxLength={recipientMessageMaxLength}
            name="message"
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            value={message}
          />
          <p
            className="text-sm text-wink-text-secondary"
            id="recipient-kind-message-help"
          >
            {remaining} characters remaining
          </p>
        </div>

        <RecipientMessageStatus state={state} />
        <SendMessageButton />
      </form>
    </section>
  );
}

function RecipientMessageStatus({
  state
}: {
  state: RecipientMessageActionState;
}) {
  if (state.status === "idle") {
    return null;
  }

  const message =
    state.status === "validation_error"
      ? state.error
      : state.status === "already_sent"
        ? "A message was already saved for this invitation."
        : state.status === "storage_unavailable"
          ? "Message service is temporarily unavailable. Please try again later."
          : state.status === "unavailable"
            ? "This message could not be saved."
            : null;

  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-wink-danger" role="status">
      {message}
    </p>
  );
}

function SendMessageButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-11 rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving..." : "Send through WINK"}
    </button>
  );
}

function LegacyKindReplyIdeas({ invite }: { invite: Invite }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [fallbackIndex, setFallbackIndex] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return null;
  }

  async function copyReply(reply: string, index: number) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(reply);
        setFallbackIndex(null);
        setCopiedIndex(index);
        window.setTimeout(() => {
          setCopiedIndex((current) => (current === index ? null : current));
        }, 2000);
        return;
      } catch {
        // Fall through to the manual-copy surface below.
      }
    }

    setCopiedIndex(null);
    setFallbackIndex(index);
  }

  return (
    <section
      aria-labelledby="kind-reply-heading"
      className="space-y-4 border-t border-wink-border pt-5"
    >
      <div className="space-y-2">
        <h2
          className="text-lg font-semibold text-wink-text"
          id="kind-reply-heading"
        >
          Optional message ideas
        </h2>
        <p className="text-base text-wink-text-secondary">
          This older invitation has no private sender link. You can copy a
          message and send it yourself.
        </p>
        <p className="text-sm text-wink-text-secondary">
          {getKindReplyIntro(invite)}
        </p>
      </div>

      <div className="space-y-3">
        {kindReplyOptions.map((reply, index) => (
          <article
            className="space-y-3 rounded-md border border-wink-border bg-wink-background p-4"
            key={reply}
          >
            <p className="text-base leading-7 text-wink-text">{reply}</p>
            <button
              aria-label={`Copy kind reply option ${index + 1}`}
              className="min-h-11 rounded-md border border-wink-border bg-wink-surface px-4 py-2 text-sm font-semibold text-wink-text focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
              onClick={() => copyReply(reply, index)}
              type="button"
            >
              {copiedIndex === index ? "Copied" : "Copy message"}
            </button>
            {fallbackIndex === index ? (
              <label className="block space-y-2 text-sm text-wink-text-secondary">
                <span>Copy this text manually:</span>
                <textarea
                  className="min-h-24 w-full rounded-md border border-wink-border bg-wink-surface px-3 py-2 text-base text-wink-text"
                  readOnly
                  value={reply}
                />
              </label>
            ) : null}
          </article>
        ))}
      </div>

      <p aria-live="polite" className="text-sm text-wink-text-secondary">
        {copiedIndex !== null
          ? "Copied. Paste it into your messaging app."
          : "Clipboard copy stays on your device."}
      </p>

      <button
        className="min-h-11 rounded-md px-0 py-2 text-sm font-semibold text-wink-text-secondary underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
        onClick={() => setHidden(true)}
        type="button"
      >
        Hide suggestions
      </button>
    </section>
  );
}
