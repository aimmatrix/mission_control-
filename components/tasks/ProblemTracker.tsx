"use client";
// Report-a-problem → approve → agent build pipeline. Server-backed via
// /api/problems (lib/db.ts) so the same task is also visible from the
// Queue and the Audit trail — not just this page. Progress is derived
// from elapsed time server-side, so polling (not client timers) is what
// advances the UI.
import { useEffect, useState } from "react";
import type { ProblemTask } from "@/lib/types";
import ProblemTaskCard from "./ProblemTaskCard";

const POLL_MS = 2000;

export default function ProblemTracker() {
  const [tasks, setTasks] = useState<ProblemTask[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/problems");
        const data = await res.json();
        if (!cancelled && data.tasks) setTasks(data.tasks);
      } catch {
        // keep last known state on a transient failure
      }
    }
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function submit() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.task) setTasks((t) => [data.task, ...t]);
    } catch {
      // best effort — the next poll will reconcile
    }
  }

  function handleChange(updated: ProblemTask) {
    setTasks((t) => t.map((x) => (x.id === updated.id ? updated : x)));
  }

  return (
    <div className="rounded-xl border border-ctrl-line bg-ctrl-panel p-4">
      <h3 className="mb-1 text-sm font-semibold">Report a problem</h3>
      <p className="mb-3 text-xs text-ctrl-dim">
        Describe a bug or task. Approve it and an agent starts building the fix — it
        also shows up in the queue, the fleet status below, and the audit trail once
        it ships.
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="e.g. The approve button doesn't disable while the merge is in flight"
        rows={3}
        className="w-full rounded-lg border border-ctrl-line bg-ctrl-bg p-3 text-base text-ctrl-fg placeholder:text-ctrl-dim focus:outline-none focus:ring-1 focus:ring-risk-low"
      />
      <button
        onClick={submit}
        disabled={!draft.trim()}
        className="mt-2 min-h-[44px] rounded-lg bg-risk-low px-4 py-2 text-sm font-medium text-ctrl-bg hover:bg-risk-low/90 disabled:opacity-40"
      >
        Submit problem
      </button>

      {tasks.length > 0 && (
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => (
            <ProblemTaskCard key={task.id} task={task} onChange={handleChange} variant="full" />
          ))}
        </ul>
      )}
    </div>
  );
}
