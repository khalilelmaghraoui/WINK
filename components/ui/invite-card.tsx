import type { ReactNode } from "react";

type InviteCardVariant = "preview" | "live" | "accepted" | "declined";

interface InviteCardProps {
  children?: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  message?: ReactNode;
  modeSlot?: ReactNode;
  showAccentDivider?: boolean;
  title: ReactNode;
  titleId?: string;
  variant?: InviteCardVariant;
}

const variantClasses: Record<InviteCardVariant, string> = {
  preview: "border-wink-border",
  live: "border-wink-accent",
  accepted: "border-wink-success",
  declined: "border-wink-border"
};

export function InviteCard({
  children,
  className = "",
  eyebrow,
  footer,
  message,
  modeSlot,
  showAccentDivider = true,
  title,
  titleId = "invite-card-title",
  variant = "preview"
}: InviteCardProps) {
  return (
    <article
      aria-labelledby={titleId}
      className={[
        "w-full overflow-hidden rounded-lg border bg-wink-surface",
        "p-8 text-wink-text shadow-[0_18px_50px_rgba(24,21,18,0.08)] sm:p-10",
        "break-words",
        variantClasses[variant],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div aria-live="polite" className="space-y-6">
        {(eyebrow || modeSlot) && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase text-wink-text-secondary">
                {eyebrow}
              </p>
            ) : (
              <span />
            )}
            {modeSlot}
          </div>
        )}

        <div className="space-y-3">
          <h2
            className="font-display text-3xl leading-tight text-wink-text sm:text-4xl"
            id={titleId}
          >
            {title}
          </h2>
          {message ? (
            <div className="font-display text-xl italic leading-relaxed text-wink-text">
              {message}
            </div>
          ) : null}
        </div>

        {showAccentDivider ? (
          <div aria-hidden="true" className="border-t border-wink-accent" />
        ) : null}

        {children ? <div className="space-y-4">{children}</div> : null}
        {footer ? (
          <footer className="border-t border-wink-border pt-5">{footer}</footer>
        ) : null}
      </div>
    </article>
  );
}
