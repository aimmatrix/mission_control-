import AuditTrail from "@/components/audit/AuditTrail";

export default function AuditPage() {
  return (
    <main className="py-6">
      <header className="mb-6 border-b border-ctrl-line pb-4">
        <h1 className="text-xl font-semibold text-ctrl-fg">Audit log</h1>
        <p className="mt-1 text-sm text-ctrl-dim">
          History of approve and reject actions on pull requests.
        </p>
      </header>
      <AuditTrail />
    </main>
  );
}
