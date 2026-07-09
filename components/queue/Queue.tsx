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
      <p className="rounded-md border border-[#da3633]/50 bg-[#da3633]/10 px-4 py-3 text-sm text-[#f85149]">
        {error}
      </p>
    );
  }

  if (!prs) {
    return (
      <div className="flex items-center gap-2 py-8 text-ctrl-dim" role="status">
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ctrl-line border-t-ctrl-dim"
          aria-hidden
        />
        <span className="text-sm">Loading pull requests…</span>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className="mc-card px-4 py-8 text-center">
        <p className="text-sm text-ctrl-dim">No open pull requests in the queue.</p>
      </div>
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
