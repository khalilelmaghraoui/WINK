import type { ButtonHTMLAttributes } from "react";

type ModeBadgeMode = "lawyer" | "unbothered";

interface ModeBadgeProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled"> {
  disabled?: boolean;
  mode: ModeBadgeMode;
  selectable?: boolean;
  selected?: boolean;
}

const modeLabels: Record<ModeBadgeMode, string> = {
  lawyer: "Lawyer",
  unbothered: "Unbothered"
};

const modeClasses: Record<ModeBadgeMode, string> = {
  lawyer: "border-wink-accent text-wink-text",
  unbothered: "border-wink-counter-accent text-wink-counter-accent"
};

const baseClasses = [
  "inline-flex items-center justify-center gap-2 rounded-full border",
  "bg-wink-surface-muted px-3 py-1 text-xs font-semibold uppercase",
  "transition-colors duration-200"
].join(" ");

export function ModeBadge({
  className = "",
  disabled = false,
  mode,
  selectable = false,
  selected = false,
  type = "button",
  ...props
}: ModeBadgeProps) {
  const selectedClasses = selected
    ? "border-wink-primary bg-wink-surface text-wink-primary"
    : modeClasses[mode];
  const classNames = [
    baseClasses,
    selectable ? "min-h-11 cursor-pointer focus:outline-none" : "",
    selectable
      ? "focus-visible:ring-2 focus-visible:ring-wink-focus focus-visible:ring-offset-2 focus-visible:ring-offset-wink-background"
      : "",
    selectable
      ? "disabled:cursor-not-allowed disabled:border-wink-border disabled:bg-wink-surface-muted disabled:text-wink-text-secondary"
      : "",
    selectedClasses,
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (selectable) {
    return (
      <button
        {...props}
        aria-pressed={selected}
        className={classNames}
        disabled={disabled}
        type={type}
      >
        {selected ? (
          <span aria-hidden="true" className="text-current">
            Selected
          </span>
        ) : null}
        <span>{modeLabels[mode]}</span>
      </button>
    );
  }

  return <span className={classNames}>{modeLabels[mode]}</span>;
}

