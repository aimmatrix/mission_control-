"use client";
// Report-a-problem → approve → simulated agent build pipeline. Client-only
// demo state (localStorage), no backend — the point is the interaction, not
// a real orchestration layer. "Open in Cursor" is a real deep link though.
import { useEffect, useState } from "react";

type Status = "pending" | "building" | "done" | "rejected";

interface Task {
  id: string;
  text: string;
  status: Status;
  step: number;
}

const STEPS = ["Queued for agent", "Analyzing codebase", "Writing fix", "Running tests"];
const STORAGE_KEY = "mc_tasks_v1";
const STEP_MS = 1600;

function cursorPrompt(problem: string): string {
  return [
    "Fix this issue in the Mission Control repo (aimmatrix/mission_control-).",
    "",
    "Problem:",
    problem,
    "",
    "Context:",
    "- Stack: Next.js 14 App Router + Tailwind, deployed on Vercel, Supabase for persistence.",
    "- Relevant surface: app/ (routes + API), components/ (UI), lib/ (adapters + shared types), fixtures/ (demo data).",
    "- Design tokens live in tailwind.config.ts (ctrl-bg/panel/line/fg/dim, risk-low/medium/high) — reuse them, don't hardcode colors.",
    "",
    "Definition of done:",
    "- Root cause identified, not just the symptom patched.",
    "- Minimal, targeted diff — no unrelated refactors.",
    "- `npm run build` passes (typecheck + lint clean).",
    "- If the behavior is user-visible, verify it in the running app before calling it done.",
    "",
    "Report back with: root cause, the fix, and how you verified it.",
  ].join("\n");
}

function cursorDeepLink(problem: string): string {
  return `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(cursorPrompt(problem))}`;
}

export default function ProblemTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      // ignore corrupt/missing storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // storage full/unavailable — demo state just won't persist
    }
  }, [tasks, hydrated]);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    setTasks((t) => [{ id: crypto.randomUUID(), text, status: "pending", step: 0 }, ...t]);
    setDraft("");
  }

  function reject(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, status: "rejected" } : x)));
  }

  function approve(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, status: "building", step: 0 } : x)));
    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setTasks((t) =>
          t.map((x) => (x.id === id && x.status === "building" ? { ...x, step: i } : x))
        );
      }, (i + 1) * STEP_MS);
    });
    setTimeout(() => {
      setTasks((t) =>
        t.map((x) => (x.id === id && x.status === "building" ? { ...x, status: "done" } : x))
      );
    }, (STEPS.length + 1) * STEP_MS);
  }

  return (
    <div className="rounded-xl border border-ctrl-line bg-ctrl-panel p-4">
      <h3 className="mb-1 text-sm font-semibold">Report a problem</h3>
      <p className="mb-3 text-xs text-ctrl-dim">
        Describe a bug or task. Approve it and an agent starts building the fix.
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="e.g. The approve button doesn't disable while the merge is in flight"
        rows={3}
        className="w-full rounded-lg border border-ctrl-line bg-ctrl-bg p-3 text-sm text-ctrl-fg placeholder:text-ctrl-dim focus:outline-none focus:ring-1 focus:ring-risk-low"
      />
      <button
        onClick={submit}
        disabled={!draft.trim()}
        className="mt-2 rounded-lg bg-risk-low px-4 py-2 text-sm font-medium text-ctrl-bg disabled:opacity-40"
      >
        Submit problem
      </button>

      {tasks.length > 0 && (
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-lg border border-ctrl-line bg-ctrl-bg p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm">{task.text}</p>
                <StatusBadge status={task.status} />
              </div>

              {task.status === "pending" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => approve(task.id)}
                    className="rounded-md bg-risk-low px-3 py-1.5 text-xs font-medium text-ctrl-bg"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(task.id)}
                    className="rounded-md border border-ctrl-line px-3 py-1.5 text-xs text-ctrl-dim"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => toggleExpanded(task.id)}
                    className="rounded-md border border-ctrl-line px-3 py-1.5 text-xs text-ctrl-dim hover:text-ctrl-fg"
                  >
                    {expanded.has(task.id) ? "Hide detail" : "More detail"}
                  </button>
                  <a
                    href={cursorDeepLink(task.text)}
                    className="ml-auto rounded-md border border-ctrl-line px-3 py-1.5 text-xs text-ctrl-dim hover:text-ctrl-fg"
                  >
                    Open in Cursor ↗
                  </a>
                </div>
              )}

              {task.status === "pending" && expanded.has(task.id) && (
                <div className="mt-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-ctrl-dim">
                    Prompt sent to Cursor
                  </p>
                  <pre className="whitespace-pre-wrap rounded-lg border border-ctrl-line bg-ctrl-panel p-3 font-mono text-xs text-ctrl-fg">
                    {cursorPrompt(task.text)}
                  </pre>
                </div>
              )}

              {task.status === "building" && (
                <p className="mt-2 text-xs text-risk-medium">{STEPS[task.step]}…</p>
              )}

              {task.status === "done" && (
                <p className="mt-2 text-xs text-risk-low">
                  Fix shipped — tests passing, merged to main.
                </p>
              )}

              {task.status === "rejected" && (
                <p className="mt-2 text-xs text-ctrl-dim">Dismissed.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    pending: "text-ctrl-dim border-ctrl-line",
    building: "text-risk-medium border-risk-medium",
    done: "text-risk-low border-risk-low",
    rejected: "text-ctrl-dim border-ctrl-line",
  };
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase ${map[status]}`}>
      {status}
    </span>
  );
}
