interface PostmarkProps {
  className?: string;
  label?: string;
}

export function Postmark({
  className = "",
  label = "WINK PRIVATE POST"
}: PostmarkProps) {
  return (
    <span
      aria-label={label}
      className={[
        "inline-flex h-20 w-20 rotate-[-10deg] items-center justify-center rounded-full border border-wink-text-secondary/35",
        "text-center text-[0.58rem] font-semibold uppercase leading-3 text-wink-text-secondary/70",
        "shadow-[inset_0_0_0_4px_rgba(111,102,93,0.05)]",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="max-w-14">{label}</span>
    </span>
  );
}
