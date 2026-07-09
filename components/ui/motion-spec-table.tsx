const motionRows = [
  ["landing map fade", "page load", "500ms", "cubic-bezier(0.16, 1, 0.3, 1)", "opacity", "final map fades in", "one paint, then static"],
  ["route draw", "after map", "1.2s", "cubic-bezier(0.16, 1, 0.3, 1)", "stroke dash offset", "route appears complete", "svg stroke only"],
  ["envelope travel", "after route starts", "1.8s", "cubic-bezier(0.16, 1, 0.3, 1)", "transform", "hidden", "transform only"],
  ["arrival zoom", "route end", "800ms", "cubic-bezier(0.16, 1, 0.3, 1)", "transform and opacity", "final envelope fades in", "no layout shift"],
  ["idle envelope float", "rest state", "4s loop", "sine-like ease", "transform", "disabled", "transform only"],
  ["hover tilt", "pointer hover", "200ms", "cubic-bezier(0.16, 1, 0.3, 1)", "transform", "disabled", "no layout shift"],
  ["seal crack", "seal action", "400ms", "cubic-bezier(0.7, 0, 0.84, 0)", "transform and opacity", "crossfade", "small layer count"],
  ["flap open", "after crack", "500ms", "cubic-bezier(0.16, 1, 0.3, 1)", "transform", "open state appears", "transform origin top"],
  ["letter slide and unfold", "after flap", "600ms", "cubic-bezier(0.16, 1, 0.3, 1)", "transform and opacity", "letter fades in", "transform only"],
  ["letterpress ink reveal", "open letter", "under 1.2s", "cubic-bezier(0.16, 1, 0.3, 1)", "opacity and blur", "sharp text appears", "text layers only"],
  ["lawyer stamp thud", "lawyer state", "300ms", "cubic-bezier(0.7, 0, 0.84, 0)", "transform", "stamp appears", "single element"],
  ["signature rule draw", "lawyer state", "500ms", "cubic-bezier(0.16, 1, 0.3, 1)", "scaleX", "full rule appears", "transform only"],
  ["button hover and press", "button action", "150-250ms", "cubic-bezier(0.16, 1, 0.3, 1)", "transform and color", "color only", "small transform"],
  ["Yes seal slam", "accepted", "250ms", "cubic-bezier(0.7, 0, 0.84, 0)", "transform", "seal fades in", "no page reflow"],
  ["wax and gold burst", "accepted impact", "1.5s", "cubic-bezier(0.16, 1, 0.3, 1)", "transform and opacity", "disabled", "particle cap"],
  ["accepted stamp", "accepted", "300ms", "cubic-bezier(0.16, 1, 0.3, 1)", "opacity and transform", "stamp appears", "single element"],
  ["Raincheck moon draw", "raincheck", "600ms", "cubic-bezier(0.16, 1, 0.3, 1)", "stroke dash offset", "moon appears complete", "svg stroke only"],
  ["Declined fold close", "declined", "600ms", "cubic-bezier(0.16, 1, 0.3, 1)", "transform", "closed letter fades in", "transform only"],
  ["page state transitions", "state switch", "300ms", "cubic-bezier(0.16, 1, 0.3, 1)", "opacity", "instant content", "no layout dependency"]
] as const;

export function MotionSpecTable() {
  return (
    <section aria-labelledby="motion-spec-heading" className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-wink-text-secondary">
          Prototype motion table
        </p>
        <h2
          className="font-display text-3xl leading-tight text-wink-text"
          id="motion-spec-heading"
        >
          Movement belongs to arrival, reveal, and yes.
        </h2>
      </div>
      <div className="overflow-x-auto rounded-lg border border-wink-border bg-wink-surface">
        <table className="min-w-[920px] text-left text-sm">
          <thead className="bg-wink-surface-muted text-xs uppercase text-wink-text-secondary">
            <tr>
              {[
                "Animation",
                "Trigger",
                "Duration",
                "Easing",
                "Properties",
                "Reduced motion",
                "Performance"
              ].map((heading) => (
                <th className="px-3 py-3 font-semibold" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-wink-border">
            {motionRows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td className="px-3 py-3 align-top text-wink-text" key={cell}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
