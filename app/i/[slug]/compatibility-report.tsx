import type { ModePresentationConfig } from "@/lib/mode-engine";

export function CompatibilityReport({
  presentation
}: {
  presentation: ModePresentationConfig;
}) {
  return (
    <section
      aria-labelledby="compatibility-report-heading"
      className="space-y-3 border-t border-wink-border pt-5"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase text-wink-text-secondary">
          Fixed comedic score
        </p>
        <h2
          className="text-lg font-semibold text-wink-text"
          id="compatibility-report-heading"
        >
          {presentation.compatibilityReport.heading}
        </h2>
      </div>
      <p className="font-display text-4xl text-wink-text">
        {presentation.compatibilityReport.score}
      </p>
      <p className="text-base leading-7 text-wink-text">
        {presentation.compatibilityReport.copy}
      </p>
      <p className="text-sm text-wink-text-secondary">
        {presentation.compatibilityReport.disclaimer}
      </p>
    </section>
  );
}
