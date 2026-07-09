"use client";
// STUB — Agent 2 owns components/queue/** and replaces this file.
// Contract: default export, no props. Fetches GET /api/prs → { prs: ScoredPR[] }
// and renders the risk-colored review queue. Actions POST /api/action with an
// ActionRequest body (see lib/types.ts).
import { useEffect, useState } from "react";
import type { ScoredPR } from "@/lib/types";

export default function Queue() {
  const [prs, setPrs] = useState<ScoredPR[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prs")
      .then((r) => r.json())
      .then((d) => (d.prs ? setPrs(d.prs) : setError(d.error ?? "load failed")))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="text-risk-high">{error}</p>;
  if (!prs) return <p className="text-ctrl-dim">Scanning open PRs…</p>;

  return (
    <ul className="space-y-3">
      {prs.map(({ pr, score }) => (
        <li
          key={pr.number}
          className={`rounded-xl border bg-ctrl-panel p-4 ${
            score.risk_level === "high"
              ? "border-risk-high"
              : score.risk_level === "medium"
                ? "border-risk-medium"
                : "border-risk-low"
          }`}
        >
          <p className="font-medium">
            #{pr.number} {pr.title}
          </p>
          <p className="mt-1 text-sm text-ctrl-dim">{score.one_line_summary}</p>
        </li>
      ))}
    </ul>
  );
}
