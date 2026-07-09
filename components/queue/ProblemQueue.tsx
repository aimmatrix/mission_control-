"use client";
// Submitted-problem tasks, shown alongside the GitHub PR queue so an
// operator-reported problem is reviewable from here too, not just the
// Agents page it was submitted from. Renders nothing until a task exists.
import { useEffect, useState } from "react";
import type { ProblemTask } from "@/lib/types";
import ProblemTaskCard from "@/components/tasks/ProblemTaskCard";

const POLL_MS = 2000;

export default function ProblemQueue() {
  const [tasks, setTasks] = useState<ProblemTask[]>([]);

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

  function handleChange(updated: ProblemTask) {
    setTasks((t) => t.map((x) => (x.id === updated.id ? updated : x)));
  }

  if (tasks.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-1 text-lg font-semibold">Submitted problems</h2>
      <p className="mb-4 text-sm text-ctrl-dim">
        Reported from the Agents page — approve to start the fix.
      </p>
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <ProblemTaskCard key={task.id} task={task} onChange={handleChange} variant="compact" />
        ))}
      </ul>
    </section>
  );
}
