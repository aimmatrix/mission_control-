const FEATURES = [
  {
    title: "Risk-scored diffs",
    blurb: "Every PR is scored before you review it.",
  },
  {
    title: "Mobile approvals",
    blurb: "Approve or reject from your phone with large tap targets.",
  },
  {
    title: "Audit trail",
    blurb: "Every decision is logged with context and timestamps.",
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
        Supervise autonomous coding agents. Review risk-scored pull requests and
        approve or reject from anywhere.
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
