import type { ReactNode } from "react";

interface PrivateLinkNoticeProps {
  children: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
}

export function PrivateLinkNotice({
  children,
  className = "",
  eyebrow = "Private link"
}: PrivateLinkNoticeProps) {
  return (
    <aside
      className={[
        "border-y border-wink-accent py-5 text-wink-text",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-xs font-semibold uppercase text-wink-text-secondary">
        {eyebrow}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-wink-text-secondary">
        {children}
      </div>
    </aside>
  );
}
