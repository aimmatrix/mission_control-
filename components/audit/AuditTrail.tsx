"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuditEntry } from "@/lib/types";
import AuditRow from "./AuditRow";

const POLL_MS = 5000;

export default function AuditTrail() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/audit", { signal, cache: "no-store" });
      if (!res.ok) throw new Error(`Audit fetch failed (${res.status})`);
      const data = (await res.json()) as { entries?: AuditEntry[]; error?: string };
      if (!data.entries) throw new Error(data.error ?? "Invalid audit response");
      setEntries(data.entries);
      setError(null);
      setNow(Date.now());
    } catch (e) {
      if (signal?.aborted) return;
      setError(e instanceof Error ? e.message : "Failed to load audit trail");
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void load(ac.signal);

    const id = window.setInterval(() => {
      void load();
    }, POLL_MS);

    return () => {
      ac.abort();
      window.clearInterval(id);
    };
  }, [load]);

  if (error && !entries) {
    return (
      <p className="rounded-lg border border-risk-high/40 bg-risk-high/10 px-4 py-3 text-sm text-risk-high">
        {error}
      </p>
    );
  }

  if (entries === null) {
    return (
      <div className="flex items-center gap-3 py-8 text-ctrl-dim" role="status">
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-risk-low"
          aria-hidden
        />
        <span className="text-sm">Replaying flight recorder…</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ctrl-line bg-ctrl-panel/60 px-4 py-10 text-center">
        <p className="text-sm text-ctrl-dim">
          No autonomous actions yet — the queue is waiting.
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ctrl-dim/60">
          recorder armed
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ctrl-dim">
          {entries.length === 1 ? "1 event logged" : `${entries.length} events logged`}
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[11px] text-ctrl-dim">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-risk-low"
            aria-hidden
          />
          live
        </p>
      </div>

      {/* Timeline spine */}
      <ul className="relative space-y-3 before:absolute before:bottom-3 before:left-[4px] before:top-3 before:w-px before:bg-ctrl-line">
        {entries.map((entry) => (
          <AuditRow key={entry.id} entry={entry} now={now} />
        ))}
      </ul>
    </div>
  );
}
