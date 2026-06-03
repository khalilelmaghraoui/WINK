import type { ModePresentationConfig } from "@/lib/mode-engine";

export function CompatibilityReport({
  presentation
}: {
  presentation: ModePresentationConfig;
}) {
  return (
    <section
      aria-labelledby="compatibility-report-heading"
      className="space-y-3 rounded-lg border border-stone-300 bg-white p-5"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-stone-600">
          Fixed comedic score
        </p>
        <h2
          className="text-lg font-semibold text-stone-950"
          id="compatibility-report-heading"
        >
          {presentation.compatibilityReport.heading}
        </h2>
      </div>
      <p className="text-4xl font-semibold text-stone-950">
        {presentation.compatibilityReport.score}
      </p>
      <p className="text-base leading-7 text-stone-800">
        {presentation.compatibilityReport.copy}
      </p>
      <p className="text-sm text-stone-600">
        {presentation.compatibilityReport.disclaimer}
      </p>
    </section>
  );
}
