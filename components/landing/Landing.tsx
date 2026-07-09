const FEATURES = [
  {
    title: "Risk-scored diffs",
    blurb: "Every PR lands green, amber, or red before you touch it.",
    accent: "text-risk-low",
    border: "border-risk-low/30",
  },
  {
    title: "One-tap safe approvals",
    blurb: "Approve or reject from your phone — big targets, no desktop required.",
    accent: "text-risk-medium",
    border: "border-risk-medium/30",
  },
  {
    title: "Full audit trail",
    blurb: "Every decision logged. Replay who approved what, and why.",
    accent: "text-risk-high",
    border: "border-risk-high/30",
  },
] as const;

export default function Landing() {
  return (
    <section
      aria-label="Mission Control overview"
      className="relative overflow-hidden border-b border-ctrl-line pb-8 pt-6"
    >
      {/* Soft control-room glow — no animation libs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-risk-low/[0.07] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-24 h-36 w-36 rounded-full bg-risk-low/[0.04] blur-3xl"
      />

      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border border-risk-low/25 bg-risk-low/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-risk-low">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low" />
          Systems nominal
        </p>

        <h1 className="mt-4 text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl">
          Mission Control —{" "}
          <span className="text-ctrl-dim">every agent supervised.</span>
        </h1>

        <p className="mt-3 max-w-prose text-base leading-snug text-ctrl-fg/90">
          Coding agents are fast. Unsupervised merges are how you lose a weekend
          of work.
        </p>

        <p className="mt-2 max-w-prose text-sm leading-snug text-ctrl-dim">
          Built by a solo founder whose agent once deleted his Git history.
        </p>

        <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className={`rounded-xl border bg-ctrl-panel px-3.5 py-3 ${feature.border}`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${feature.accent}`}
              >
                {feature.title}
              </p>
              <p className="mt-1.5 text-sm leading-snug text-ctrl-dim">
                {feature.blurb}
              </p>
            </li>
          ))}
        </ul>

        <a
          href="#queue"
          className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-risk-low/40 bg-risk-low/15 px-4 text-base font-semibold text-risk-low transition-colors hover:bg-risk-low/25 sm:w-auto sm:px-6"
        >
          Live queue ↓
        </a>
      </div>
    </section>
  );
}
