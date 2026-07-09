const FEATURES = [
  {
    title: "Risk-scored diffs",
    blurb:
      "An LLM triages every diff for destructive ops, auth surface, and blast radius before you see it.",
  },
  {
    title: "Mobile approvals",
    blurb:
      "One-tap approve or reject — high-risk PRs demand an extra confirmation, so nothing dangerous merges by accident.",
  },
  {
    title: "Audit trail",
    blurb: "Every decision lands in an immutable log with score, reasons, and timestamp.",
  },
] as const;

export default function Landing() {
  return (
    <section
      aria-label="Mission Control overview"
      className="border-b border-ctrl-line pb-8 pt-6"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-ctrl-fg sm:text-[1.75rem]">
        Mission Control
      </h1>
      <p className="mt-2 max-w-prose text-ctrl-dim">
        Agents open PRs at machine speed. Mission Control scores every diff —
        green, amber, red — so you approve or reject from your phone, with a
        confirmation gate on anything dangerous.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="mc-card px-4 py-3">
            <p className="text-sm font-medium text-ctrl-fg">{feature.title}</p>
            <p className="mt-1 text-sm leading-snug text-ctrl-dim">
              {feature.blurb}
            </p>
          </li>
        ))}
      </ul>

      <a href="#queue" className="mc-btn-primary mt-6 w-full sm:w-auto">
        View queue
      </a>
    </section>
  );
}
