import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export function PrimaryButton({
  children,
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled}
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-md",
        "bg-wink-primary px-5 py-2.5 text-sm font-semibold text-wink-surface",
        "transition duration-200 hover:-translate-y-0.5 hover:bg-wink-primary-hover active:translate-y-px",
        "active:bg-wink-primary-hover active:shadow-[inset_0_1px_0_rgba(24,21,18,0.28)] motion-reduce:transform-none motion-reduce:transition-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background",
        "disabled:cursor-not-allowed disabled:bg-wink-surface-muted disabled:text-wink-text-secondary disabled:hover:bg-wink-surface-muted",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      type={type}
    >
      <span className="inline-flex min-w-0 items-center justify-center gap-2">
        {loading ? (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70"
          />
        ) : null}
        <span>{children}</span>
      </span>
    </button>
  );
}

