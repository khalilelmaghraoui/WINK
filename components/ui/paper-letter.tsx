import type { ReactNode } from "react";

interface PaperLetterProps {
  children?: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  title: ReactNode;
  variant?: "default" | "lawyer" | "unbothered" | "accepted";
}

const variantClasses = {
  accepted: "rotate-0 border-wink-success",
  default: "rotate-0 border-wink-border",
  lawyer: "rotate-0 border-wink-accent",
  unbothered: "rotate-[-1deg] border-wink-border"
};

export function PaperLetter({
  children,
  className = "",
  eyebrow,
  footer,
  title,
  variant = "default"
}: PaperLetterProps) {
  return (
    <article
      className={[
        "paper-grain relative overflow-hidden rounded-lg border bg-wink-surface p-7 text-wink-text",
        "shadow-[0_3px_8px_rgba(24,21,18,0.12),0_24px_60px_rgba(24,21,18,0.1)] sm:p-9",
        "before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-[radial-gradient(circle_at_4px_7px,#F8F3EA_0_3px,transparent_3px)] before:bg-[length:12px_8px]",
        "motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none",
        variantClasses[variant],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative space-y-5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase text-wink-text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl leading-tight text-wink-text sm:text-4xl">
          {title}
        </h2>
        <div aria-hidden="true" className="h-px bg-wink-accent" />
        {children ? <div className="space-y-4">{children}</div> : null}
        {footer ? <footer className="border-t border-wink-border pt-4">{footer}</footer> : null}
      </div>
    </article>
  );
}
