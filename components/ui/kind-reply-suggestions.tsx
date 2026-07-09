interface KindReplySuggestionsProps {
  suggestions?: string[];
}

const defaultSuggestions = [
  "That's really sweet, but I don't see it that way.",
  "I appreciate it, but I'm not available for dating right now.",
  "I'd rather keep things friendly, but this was genuinely cute."
];

export function KindReplySuggestions({
  suggestions = defaultSuggestions
}: KindReplySuggestionsProps) {
  return (
    <section aria-labelledby="kind-reply-suggestions-heading" className="space-y-3">
      <h3
        className="text-xs font-semibold uppercase text-wink-text-secondary"
        id="kind-reply-suggestions-heading"
      >
        Optional kind reply ideas
      </h3>
      <div className="grid gap-3">
        {suggestions.map((suggestion) => (
          <p
            className="paper-grain rounded-md border border-wink-border bg-wink-surface px-4 py-3 text-sm leading-6 text-wink-text"
            key={suggestion}
          >
            {suggestion}
          </p>
        ))}
      </div>
    </section>
  );
}
