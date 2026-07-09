import type { ReactNode } from "react";

type StatusCardStatus =
  | "pending"
  | "opened"
  | "accepted"
  | "rainchecked"
  | "declined"
  | "cancelled"
  | "expired"
  | "flagged";

interface StatusCardProps {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  quoteAttribution?: ReactNode;
  quotedMessage?: ReactNode;
  status: StatusCardStatus;
  title: ReactNode;
}

const statusToneClasses: Record<StatusCardStatus, string> = {
  pending: "border-l-wink-border",
  opened: "border-l-wink-accent",
  accepted: "border-l-wink-success",
  rainchecked: "border-l-wink-warning",
  declined: "border-l-wink-border",
  cancelled: "border-l-wink-danger",
  expired: "border-l-wink-warning",
  flagged: "border-l-wink-danger"
};

export function StatusCard({
  children,
  className = "",
  description,
  quoteAttribution = "Recipient",
  quotedMessage,
  status,
  title
}: StatusCardProps) {
  return (
    <article
      className={[
        "paper-grain w-full rounded-lg border border-l-4 border-wink-border bg-wink-surface",
        "p-8 text-wink-text shadow-[0_3px_8px_rgba(24,21,18,0.1),0_20px_54px_rgba(24,21,18,0.08)] sm:p-10",
        "break-words",
        statusToneClasses[status],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-wink-text-secondary">
            Status
          </p>
          <h1 className="font-display text-3xl leading-tight text-wink-text sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="text-base leading-relaxed text-wink-text-secondary">
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="space-y-4">{children}</div> : null}

        {quotedMessage ? (
          <figure className="border-t border-wink-border pt-5">
            <blockquote className="font-display text-xl italic leading-relaxed text-wink-text">
              {quotedMessage}
            </blockquote>
            <figcaption className="mt-3 text-sm font-semibold uppercase text-wink-text-secondary">
              {quoteAttribution}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </article>
  );
}
