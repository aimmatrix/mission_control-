import ContributionGraph from "@/components/activity/ContributionGraph";
import ProblemTracker from "@/components/tasks/ProblemTracker";

export default function AgentsPage() {
  return (
    <main className="space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-sm text-ctrl-dim">
          What the autonomous build agents have been doing, and where to point them next.
        </p>
      </div>
      <ContributionGraph />
      <ProblemTracker />
    </main>
  );
}
