// ─── SPINE STUB — SIGNATURE LOCKED, BODY OWNED BY AGENT 6 ────────────
// Agent 6 replaces the bodies with @supabase/supabase-js calls against
// supabase/schema.sql. Signatures must NOT change. The in-memory fallback
// (no SUPABASE_URL) must keep working so local dev never blocks.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuditEntry, RiskScore } from "@/lib/types";

export function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

// Lazy memoized client — only created when env is present.
let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  return _client;
}

// In-memory fallback (fine locally; on Vercel, Supabase env is set).
// Stored on globalThis so every route bundle shares one store in dev.
const g = globalThis as unknown as {
  __mcScores?: Map<string, RiskScore>;
  __mcAudit?: AuditEntry[];
};
const memScores = (g.__mcScores ??= new Map<string, RiskScore>());
const memAudit = (g.__mcAudit ??= []);

function cacheKey(prNumber: number, headSha: string): string {
  return `${prNumber}:${headSha}`;
}

/** Cached score for (pr_number, head_sha), or null. */
export async function getCachedScore(
  prNumber: number,
  headSha: string
): Promise<RiskScore | null> {
  const client = getClient();
  if (!client) {
    return memScores.get(cacheKey(prNumber, headSha)) ?? null;
  }

  try {
    const { data, error } = await client
      .from("score_cache")
      .select("score")
      .eq("pr_number", prNumber)
      .eq("head_sha", headSha)
      .maybeSingle();

    if (error) {
      console.warn("[db] getCachedScore:", error.message);
      return memScores.get(cacheKey(prNumber, headSha)) ?? null;
    }

    return (data?.score as RiskScore | undefined) ?? null;
  } catch (err) {
    console.warn("[db] getCachedScore:", err);
    return memScores.get(cacheKey(prNumber, headSha)) ?? null;
  }
}

export async function setCachedScore(
  prNumber: number,
  headSha: string,
  score: RiskScore
): Promise<void> {
  // Always keep memory warm for same-process hits / degrade path.
  memScores.set(cacheKey(prNumber, headSha), score);

  const client = getClient();
  if (!client) return;

  try {
    const { error } = await client.from("score_cache").upsert(
      {
        pr_number: prNumber,
        head_sha: headSha,
        score,
      },
      { onConflict: "pr_number,head_sha" }
    );

    if (error) {
      console.warn("[db] setCachedScore:", error.message);
    }
  } catch (err) {
    console.warn("[db] setCachedScore:", err);
  }
}

export async function insertAudit(
  entry: Omit<AuditEntry, "id" | "created_at">
): Promise<void> {
  const client = getClient();
  if (!client) {
    memAudit.unshift({
      ...entry,
      id: `mem-${memAudit.length + 1}`,
      created_at: new Date().toISOString(),
    });
    return;
  }

  try {
    const { error } = await client.from("audit_log").insert({
      pr_number: entry.pr_number,
      pr_title: entry.pr_title,
      risk_level: entry.risk_level,
      score: entry.score,
      action: entry.action,
      reasons: entry.reasons,
    });

    if (error) {
      console.warn("[db] insertAudit:", error.message);
      memAudit.unshift({
        ...entry,
        id: `mem-${memAudit.length + 1}`,
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("[db] insertAudit:", err);
    memAudit.unshift({
      ...entry,
      id: `mem-${memAudit.length + 1}`,
      created_at: new Date().toISOString(),
    });
  }
}

/** Audit entries, newest first. */
export async function listAudit(): Promise<AuditEntry[]> {
  const client = getClient();
  if (!client) {
    return memAudit;
  }

  try {
    const { data, error } = await client
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.warn("[db] listAudit:", error.message);
      return memAudit;
    }

    return (data ?? []).map((row) => ({
      id: String(row.id),
      pr_number: row.pr_number as number,
      pr_title: row.pr_title as string,
      risk_level: row.risk_level as AuditEntry["risk_level"],
      score: row.score as number,
      action: row.action as AuditEntry["action"],
      reasons: (row.reasons as string[]) ?? [],
      created_at: row.created_at as string,
    }));
  } catch (err) {
    console.warn("[db] listAudit:", err);
    return memAudit;
  }
}
