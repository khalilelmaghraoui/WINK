import type { ReactNode } from "react";

interface PostalStampProps {
  children?: ReactNode;
  className?: string;
  label?: ReactNode;
  tone?: "accent" | "primary" | "success" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<PostalStampProps["tone"]>, string> = {
  accent: "border-wink-accent text-wink-text",
  danger: "border-wink-danger text-wink-danger",
  primary: "border-wink-primary text-wink-primary",
  success: "border-wink-success text-wink-success",
  warning: "border-wink-warning text-wink-warning"
};

export function PostalStamp({
  children,
  className = "",
  label = "PRIVATE POST",
  tone = "accent"
}: PostalStampProps) {
  return (
    <span
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-[4px] border border-dashed",
        "bg-wink-surface/80 px-3 py-2 text-center text-[0.68rem] font-semibold uppercase leading-4",
        "shadow-[inset_0_0_0_1px_rgba(255,252,247,0.7)]",
        toneClasses[tone],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children ?? label}
    </span>
  );
}
