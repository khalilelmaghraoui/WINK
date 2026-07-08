interface StepIndicatorProps {
  className?: string;
  currentStep: number;
  label: string;
  totalSteps: number;
}

export function StepIndicator({
  className = "",
  currentStep,
  label,
  totalSteps
}: StepIndicatorProps) {
  const normalizedTotal = Math.max(1, totalSteps);
  const normalizedCurrent = Math.min(
    Math.max(1, currentStep),
    normalizedTotal
  );
  const segments = Array.from({ length: normalizedTotal }, (_, index) => {
    const stepNumber = index + 1;

    return (
      <span
        aria-hidden="true"
        className={[
          "h-px flex-1 rounded-full",
          stepNumber <= normalizedCurrent
            ? "bg-wink-primary"
            : "bg-wink-border"
        ].join(" ")}
        key={stepNumber}
      />
    );
  });

  return (
    <div
      aria-label={`Step ${normalizedCurrent} of ${normalizedTotal}: ${label}`}
      className={["space-y-2", className].filter(Boolean).join(" ")}
    >
      <p className="text-xs font-semibold uppercase text-wink-text-secondary">
        Step {normalizedCurrent} of {normalizedTotal}
      </p>
      <div aria-hidden="true" className="flex gap-2">
        {segments}
      </div>
    </div>
  );
}

