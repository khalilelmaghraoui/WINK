import type { ReactNode } from "react";

interface ResponseButtonGroupProps {
  children: ReactNode;
  className?: string;
  label?: ReactNode;
}

export function ResponseButtonGroup({
  children,
  className = "",
  label = "Your move"
}: ResponseButtonGroupProps) {
  return (
    <div
      className={["space-y-3", className].filter(Boolean).join(" ")}
      data-response-button-group
    >
      {label ? (
        <p className="text-xs font-semibold uppercase text-wink-text-secondary">
          {label}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}
