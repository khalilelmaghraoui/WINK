type WaxSealSize = "sm" | "md" | "lg";

interface WaxSealProps {
  className?: string;
  cracked?: boolean;
  label?: string;
  size?: WaxSealSize;
}

const sizeClasses: Record<WaxSealSize, string> = {
  sm: "h-12 w-12 text-xl",
  md: "h-16 w-16 text-2xl",
  lg: "h-24 w-24 text-4xl"
};

export function WaxSeal({
  className = "",
  cracked = false,
  label = "W",
  size = "md"
}: WaxSealProps) {
  return (
    <span
      aria-label={`${label} wax seal`}
      className={[
        "relative inline-flex shrink-0 items-center justify-center",
        "rounded-[48%_53%_46%_55%/54%_45%_56%_47%]",
        "bg-wink-primary font-display font-semibold text-wink-surface",
        "shadow-[inset_-8px_-10px_16px_rgba(24,21,18,0.24),inset_6px_6px_14px_rgba(255,252,247,0.18),0_10px_20px_rgba(24,21,18,0.22)]",
        cracked ? "after:absolute after:inset-y-3 after:left-1/2 after:w-px after:-rotate-12 after:bg-wink-surface/55" : "",
        sizeClasses[size],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden="true"
        className="absolute left-3 top-2 h-3 w-5 rounded-full bg-wink-surface/20 blur-[1px]"
      />
      <span className="relative drop-shadow-[0_1px_0_rgba(24,21,18,0.42)]">
        {label}
      </span>
    </span>
  );
}
