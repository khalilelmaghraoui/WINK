import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function SecondaryButton({
  children,
  className = "",
  disabled = false,
  type = "button",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      {...props}
      aria-disabled={disabled}
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-md border",
        "border-wink-border bg-wink-surface px-5 py-2.5 text-sm font-semibold text-wink-text",
        "transition duration-200 hover:-translate-y-0.5 hover:border-wink-primary hover:bg-wink-surface-muted active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background",
        "disabled:cursor-not-allowed disabled:border-wink-border disabled:bg-wink-surface-muted disabled:text-wink-text-secondary disabled:hover:border-wink-border",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

