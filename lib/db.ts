// ─── SPINE STUB — SIGNATURE LOCKED, BODY OWNED BY AGENT 6 ────────────
// Agent 6 replaces the bodies with @supabase/supabase-js calls against
// supabase/schema.sql. Signatures must NOT change. The in-memory fallback
// (no SUPABASE_URL) must keep working so local dev never blocks.
import type { AuditEntry, RiskScore } from "@/lib/types";

export function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

// In-memory fallback (fine locally; on Vercel, Supabase env is set).
// Stored on globalThis so every route bundle shares one store in dev.
const g = globalThis as unknown as {
  __mcScores?: Map<string, RiskScore>;
  __mcAudit?: AuditEntry[];
};
const memScores = (g.__mcScores ??= new Map<string, RiskScore>());
const memAudit = (g.__mcAudit ??= []);

/** Cached score for (pr_number, head_sha), or null. */
export async function getCachedScore(
  prNumber: number,
  headSha: string
): Promise<RiskScore | null> {
  // TODO(Agent 6): select from score_cache
  return memScores.get(`${prNumber}:${headSha}`) ?? null;
}

export async function setCachedScore(
  prNumber: number,
  headSha: string,
  score: RiskScore
): Promise<void> {
  // TODO(Agent 6): upsert into score_cache
  memScores.set(`${prNumber}:${headSha}`, score);
}

export async function insertAudit(
  entry: Omit<AuditEntry, "id" | "created_at">
): Promise<void> {
  // TODO(Agent 6): insert into audit_log
  memAudit.unshift({
    ...entry,
    id: `mem-${memAudit.length + 1}`,
    created_at: new Date().toISOString(),
  });
}

/** Audit entries, newest first. */
export async function listAudit(): Promise<AuditEntry[]> {
  // TODO(Agent 6): select from audit_log order by created_at desc
  return memAudit;
}
