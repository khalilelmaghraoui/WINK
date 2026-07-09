import { PostalStamp } from "./postal-stamp";
import { Postmark } from "./postmark";
import { WaxSeal } from "./wax-seal";

interface CinematicEnvelopeProps {
  className?: string;
  interactive?: boolean;
  open?: boolean;
  recipient?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-36 max-w-[260px]",
  md: "h-52 max-w-[360px]",
  lg: "h-64 max-w-[520px]"
};

export function CinematicEnvelope({
  className = "",
  interactive = false,
  open = false,
  recipient = "Maya",
  size = "lg"
}: CinematicEnvelopeProps) {
  return (
    <div
      className={[
        "wink-envelope paper-grain relative mx-auto w-full min-w-0 rounded-lg border border-wink-border bg-wink-surface",
        "shadow-[0_4px_10px_rgba(24,21,18,0.12),0_28px_70px_rgba(24,21,18,0.12)]",
        "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
        interactive ? "hover:-translate-y-1 hover:rotate-[1.5deg]" : "",
        open ? "is-open" : "",
        sizeClasses[size],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-hidden="true"
        className="absolute inset-2 rounded-md border border-dashed border-wink-primary/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-[repeating-linear-gradient(135deg,#8F2438_0_8px,#FFFCF7_8px_16px,#0F5E5D_16px_24px,#FFFCF7_24px_32px)] opacity-80"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1.5 rounded-b-lg bg-[repeating-linear-gradient(135deg,#8F2438_0_8px,#FFFCF7_8px_16px,#0F5E5D_16px_24px,#FFFCF7_24px_32px)] opacity-80"
      />
      <div
        aria-hidden="true"
        className={[
          "absolute left-0 right-0 top-0 h-1/2 origin-top rounded-t-lg border-b border-wink-border",
          "bg-[linear-gradient(150deg,rgba(255,252,247,0.95),rgba(239,231,218,0.9))]",
          "shadow-[0_14px_18px_rgba(24,21,18,0.08)]",
          open
            ? "motion-safe:-rotate-x-180 motion-safe:opacity-70"
            : "motion-safe:rotate-x-0"
        ].join(" ")}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-3/5 w-1/2 rounded-bl-lg border-r border-wink-border bg-[linear-gradient(35deg,rgba(239,231,218,0.82),rgba(255,252,247,0.72))]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-3/5 w-1/2 rounded-br-lg border-l border-wink-border bg-[linear-gradient(325deg,rgba(239,231,218,0.82),rgba(255,252,247,0.72))]"
      />

      <div className="absolute left-6 top-7 sm:left-8 sm:top-8">
        <PostalStamp label="PAR AVION" />
      </div>
      <Postmark className="absolute right-6 top-8 opacity-70 sm:right-9" />

      <div className="absolute inset-x-7 bottom-9 z-10 space-y-1 text-center">
        <p className="text-[0.66rem] font-semibold uppercase text-wink-text-secondary">
          For
        </p>
        <p className="break-words font-display text-2xl font-semibold text-wink-text sm:text-3xl">
          {recipient}
        </p>
      </div>

      <WaxSeal
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        cracked={open}
        size={size === "sm" ? "sm" : "md"}
      />
    </div>
  );
}
