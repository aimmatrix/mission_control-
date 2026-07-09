// STUB — Agent 4 owns app/audit/** (+ /api/audit body) and replaces this.
// Contract: server or client page that renders GET /api/audit → { entries }.
import { listAudit } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const entries = await listAudit();
  return (
    <main className="py-8">
      <h1 className="text-2xl font-bold">Audit trail</h1>
      <p className="mb-6 text-sm text-ctrl-dim">
        Every autonomous action, scored, explained, and logged.
      </p>
      {entries.length === 0 ? (
        <p className="text-ctrl-dim">No actions logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg border border-ctrl-line bg-ctrl-panel p-3 text-sm">
              #{e.pr_number} {e.pr_title} — {e.action} ({e.risk_level}, {e.score})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
