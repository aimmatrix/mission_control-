"use client";
// Shared card for a server-backed ProblemTask — used on the Agents page
// (variant="full", with the Cursor prompt preview) and on the Queue
// (variant="compact") so the same submitted problem is reviewable from
// both places instead of being locked to one page's local state.
import { useState } from "react";
import { PROBLEM_BUILD_STEPS, type ProblemTask } from "@/lib/types";

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

interface ProblemTaskCardProps {
  task: ProblemTask;
  onChange: (task: ProblemTask) => void;
  variant?: "full" | "compact";
}

export default function ProblemTaskCard({
  task,
  onChange,
  variant = "full",
}: ProblemTaskCardProps) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function act(action: "approve" | "reject") {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/problems/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.task) onChange(data.task);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg border border-ctrl-line bg-ctrl-bg p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 break-words text-sm">{task.text}</p>
        <StatusBadge status={task.status} />
      </div>

      {task.status === "pending" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => act("approve")}
            disabled={busy}
            className="min-h-[40px] rounded-md bg-risk-low px-3.5 py-2 text-xs font-medium text-ctrl-bg hover:bg-risk-low/90 disabled:opacity-40"
          >
            Approve
          </button>
          <button
            onClick={() => act("reject")}
            disabled={busy}
            className="min-h-[40px] rounded-md border border-ctrl-line px-3.5 py-2 text-xs text-ctrl-dim disabled:opacity-40"
          >
            Reject
          </button>
          {variant === "full" && (
            <>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="min-h-[40px] rounded-md border border-ctrl-line px-3.5 py-2 text-xs text-ctrl-dim hover:text-ctrl-fg"
              >
                {expanded ? "Hide detail" : "More detail"}
              </button>
              <a
                href={cursorDeepLink(task.text)}
                className="ml-auto min-h-[40px] rounded-md border border-ctrl-line px-3.5 py-2 text-xs text-ctrl-dim hover:text-ctrl-fg"
              >
                Open in Cursor ↗
              </a>
            </>
          )}
        </div>
      )}

      {variant === "full" && task.status === "pending" && expanded && (
        <div className="mt-3">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-ctrl-dim">
            Prompt sent to Cursor
          </p>
          <pre className="whitespace-pre-wrap break-words rounded-lg border border-ctrl-line bg-ctrl-panel p-3 font-mono text-xs text-ctrl-fg">
            {cursorPrompt(task.text)}
          </pre>
        </div>
      )}

      {task.status === "building" && (
        <p className="mt-2 text-xs text-risk-medium">{PROBLEM_BUILD_STEPS[task.step]}…</p>
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
  );
}

function StatusBadge({ status }: { status: ProblemTask["status"] }) {
  const map: Record<ProblemTask["status"], string> = {
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
