"use client";
// Fleet status: what the other agents are building right now, distinct
// from the tasks the operator submits in ProblemTracker. Demo flavor —
// fixed initial roster, progress advances client-side after mount only,
// so there's no SSR/CSR hydration mismatch.
import { useEffect, useState } from "react";

type FleetStatus = "building" | "testing" | "done";

interface FleetAgent {
  id: string;
  label: string;
  task: string;
  status: FleetStatus;
  progress: number;
  step: number;
}

const INITIAL: FleetAgent[] = [
  { id: "a2", label: "Agent 2", task: "Extra risk-gate copy pass on high-risk PRs", status: "testing", progress: 82, step: 2 },
  { id: "a3", label: "Agent 3", task: "Hardening /api/action idempotency guard", status: "building", progress: 46, step: 1 },
  { id: "a6", label: "Agent 6", task: "Adding row-level security policies to Supabase", status: "building", progress: 21, step: 0 },
  { id: "a8", label: "Agent 8", task: "Polishing mobile safe-area padding on Queue", status: "done", progress: 100, step: 3 },
];

const BUILD_STEPS = ["Analyzing", "Writing fix", "Running tests", "Opening PR"];

export default function AgentFleet() {
  const [agents, setAgents] = useState<FleetAgent[]>(INITIAL);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.status === "done") return a;
          const drift = 3 + (a.id.charCodeAt(1) % 4);
          const progress = Math.min(100, a.progress + drift);
          const status: FleetStatus =
            progress >= 100 ? "done" : progress >= 70 ? "testing" : "building";
          const step = Math.min(
            BUILD_STEPS.length - 1,
            Math.floor((progress / 100) * BUILD_STEPS.length)
          );
          return { ...a, progress, status, step };
        })
      );
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-ctrl-line bg-ctrl-panel p-4">
      <h3 className="mb-1 text-sm font-semibold">Other agents building right now</h3>
      <p className="mb-3 text-xs text-ctrl-dim">
        Live view of everything else in flight across the fleet.
      </p>
      <ul className="space-y-3">
        {agents.map((a) => (
          <li key={a.id} className="rounded-lg border border-ctrl-line bg-ctrl-bg p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{a.label}</p>
                <p className="text-xs text-ctrl-dim">{a.task}</p>
              </div>
              <FleetBadge status={a.status} />
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ctrl-line">
              <div
                className="h-full rounded-full bg-risk-low transition-all duration-700"
                style={{ width: `${a.progress}%` }}
              />
            </div>
            {a.status !== "done" && (
              <p className="mt-1 text-[11px] text-ctrl-dim">{BUILD_STEPS[a.step]}…</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FleetBadge({ status }: { status: FleetStatus }) {
  const map: Record<FleetStatus, string> = {
    building: "text-risk-medium border-risk-medium",
    testing: "text-risk-medium border-risk-medium",
    done: "text-risk-low border-risk-low",
  };
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase ${map[status]}`}>
      {status}
    </span>
  );
}
