"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScoredPR } from "@/lib/types";
import PRCard from "./PRCard";

export default function Queue() {
  const [prs, setPrs] = useState<ScoredPR[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/prs");
      if (!r.ok) throw new Error(`Couldn't load the queue (server responded ${r.status})`);
      const d = await r.json();
      if (d.prs) {
        setPrs(d.prs);
        setError(null);
      } else {
        setError(d.error ?? "load failed");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Couldn't reach the server";
      setError(
        /json|token/i.test(message)
          ? "Couldn't load the queue — server returned an unexpected response."
          : message
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
    }, 15000);
    return () => window.clearInterval(id);
  }, [load]);

  const handleResolved = useCallback((prNumber: number) => {
    setPrs((prev) => (prev ? prev.filter((p) => p.pr.number !== prNumber) : prev));
  }, []);

  if (error) {
    return (
      <div className="rounded-md border border-[#da3633]/50 bg-[#da3633]/10 px-4 py-3 text-sm text-[#f85149]">
        <p className="text-sm font-medium">Couldn&apos;t load the queue</p>
        <p className="mt-1 text-xs opacity-80">{error}</p>
        <button
          type="button"
          className="mc-btn-secondary mt-3"
          onClick={() => {
            setError(null);
            setPrs(null);
            void load();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!prs) {
    return (
      <div className="flex items-center gap-2 py-8 text-ctrl-dim" role="status">
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ctrl-line border-t-ctrl-dim"
          aria-hidden
        />
        <div className="flex flex-col">
          <span className="text-sm">Fetching PRs and scoring diffs with the risk model…</span>
          <span className="text-xs text-ctrl-dim">first load scores each open PR — cached after that</span>
        </div>
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
