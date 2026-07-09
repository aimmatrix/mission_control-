"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScoredPR } from "@/lib/types";
import PRCard from "./PRCard";

export default function Queue() {
  const [prs, setPrs] = useState<ScoredPR[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/prs")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.prs) setPrs(d.prs);
        else setError(d.error ?? "load failed");
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResolved = useCallback((prNumber: number) => {
    setPrs((prev) => (prev ? prev.filter((p) => p.pr.number !== prNumber) : prev));
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-risk-high/40 bg-risk-high/10 px-4 py-3 text-sm text-risk-high">
        {error}
      </p>
    );
  }

  if (!prs) {
    return (
      <div className="flex items-center gap-3 py-8 text-ctrl-dim" role="status">
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-risk-low"
          aria-hidden
        />
        <span className="text-sm">Scanning open PRs…</span>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <p className="rounded-lg border border-ctrl-line bg-ctrl-panel px-4 py-6 text-center text-sm text-ctrl-dim">
        Queue clear — every agent supervised.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {prs.map((item) => (
        <PRCard key={item.pr.number} item={item} onResolved={handleResolved} />
      ))}
    </ul>
  );
}
