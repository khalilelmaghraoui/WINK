import type { ComponentPropsWithoutRef } from "react";

type SectionDividerVariant = "default" | "accent";

const variantClasses: Record<SectionDividerVariant, string> = {
  default: "border-wink-border",
  accent: "border-wink-accent"
};

interface SectionDividerProps extends ComponentPropsWithoutRef<"hr"> {
  variant?: SectionDividerVariant;
}

export function SectionDivider({
  className = "",
  variant = "default",
  ...props
}: SectionDividerProps) {
  return (
    <hr
      {...props}
      className={[
        "h-px w-full border-0 border-t",
        variantClasses[variant],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

