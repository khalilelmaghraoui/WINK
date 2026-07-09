import type { ReactNode } from "react";

type PageShellVariant = "default" | "dim";
type PageShellMaxWidth = "form" | "invite" | "landing";

const variantClasses: Record<PageShellVariant, string> = {
  default: "bg-wink-background",
  dim: "bg-wink-surface-muted"
};

const maxWidthClasses: Record<PageShellMaxWidth, string> = {
  form: "max-w-[560px]",
  invite: "max-w-[680px]",
  landing: "max-w-[1120px]"
};

interface PageShellProps {
  children: ReactNode;
  className?: string;
  maxWidth: PageShellMaxWidth;
  variant?: PageShellVariant;
}

export function PageShell({
  children,
  className = "",
  maxWidth,
  variant = "default"
}: PageShellProps) {
  return (
    <main
      className={[
        "paper-grain min-h-screen overflow-x-hidden text-wink-text",
        "px-5 py-10 sm:px-8 sm:py-12 lg:px-12",
        variantClasses[variant],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={["mx-auto w-full", maxWidthClasses[maxWidth]].join(" ")}>
        {children}
      </div>
    </main>
  );
}

