import AuditTrail from "@/components/audit/AuditTrail";

export default function AuditPage() {
  return (
    <main className="py-8">
      <header className="mb-6">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ctrl-dim">
          Flight recorder
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-ctrl-fg">
          Audit trail
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ctrl-dim">
          Every autonomous action, scored, explained, and logged.
        </p>
      </header>
      <AuditTrail />
    </main>
  );
}
