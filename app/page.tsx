// ─── LOCKED SPINE FILE ── home shell. Mounts Landing (Agent 5) above the
// Queue (Agent 2). Streams edit their own components, never this file.
import Landing from "@/components/landing/Landing";
import Queue from "@/components/queue/Queue";

export default function Home() {
  return (
    <main>
      <Landing />
      <section id="queue" className="scroll-mt-16 pt-6">
        <h2 className="mb-1 text-lg font-semibold">Live queue</h2>
        <p className="mb-4 text-sm text-ctrl-dim">
          Every agent supervised — approve nothing you haven&apos;t seen scored.
        </p>
        <Queue />
      </section>
    </main>
  );
}
