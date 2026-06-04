"use client";

import { useState } from "react";

import {
  getKindReplyIntro,
  kindReplyOptions
} from "@/lib/invite-page";
import type { Invite } from "@/lib/invite-store";

export function KindReplyAssistant({ invite }: { invite: Invite }) {
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
      className="space-y-4 rounded-lg border border-stone-300 bg-white p-5"
    >
      <div className="space-y-2">
        <h2
          className="text-lg font-semibold text-stone-950"
          id="kind-reply-heading"
        >
          Need to let them down gently?
        </h2>
        <p className="text-base text-stone-700">
          Here&apos;s something kind you could send.
        </p>
        <p className="text-sm text-stone-600">{getKindReplyIntro(invite)}</p>
      </div>

      <div className="space-y-3">
        {kindReplyOptions.map((reply, index) => (
          <article
            className="space-y-3 rounded-md border border-stone-200 bg-stone-50 p-4"
            key={reply}
          >
            <p className="text-base leading-7 text-stone-900">{reply}</p>
            <button
              aria-label={`Copy kind reply option ${index + 1}`}
              className="min-h-11 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
              onClick={() => copyReply(reply, index)}
              type="button"
            >
              {copiedIndex === index ? "Copied ✓" : "Copy reply"}
            </button>
            {fallbackIndex === index ? (
              <label className="block space-y-2 text-sm text-stone-700">
                <span>Copy this text manually:</span>
                <textarea
                  className="min-h-24 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base text-stone-950"
                  readOnly
                  value={reply}
                />
              </label>
            ) : null}
          </article>
        ))}
      </div>

      <button
        className="min-h-11 rounded-md px-0 py-2 text-sm font-medium text-stone-700 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-2"
        onClick={() => setHidden(true)}
        type="button"
      >
        Hide suggestions
      </button>
    </section>
  );
}
