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
      <p className="rounded-md border border-[#da3633]/50 bg-[#da3633]/10 px-4 py-3 text-sm text-[#f85149]">
        {error}
      </p>
    );
  }

  if (entries === null) {
    return (
      <div className="flex items-center gap-2 py-8 text-ctrl-dim" role="status">
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ctrl-line border-t-ctrl-dim"
          aria-hidden
        />
        <span className="text-sm">Loading audit log…</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mc-card px-4 py-10 text-center">
        <p className="text-sm text-ctrl-dim">No audit entries yet.</p>
        <p className="mt-1 text-xs text-ctrl-dim">
          Actions from the review queue will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-ctrl-dim">
        {entries.length === 1 ? "1 entry" : `${entries.length} entries`} · refreshes
        every 5s
      </p>

      <ul className="divide-y divide-ctrl-line rounded-md border border-ctrl-line bg-ctrl-panel">
        {entries.map((entry) => (
          <AuditRow key={entry.id} entry={entry} now={now} />
        ))}
      </ul>
    </div>
  );
}
