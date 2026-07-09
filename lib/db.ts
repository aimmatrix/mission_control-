// ─── SPINE STUB — SIGNATURE LOCKED, BODY OWNED BY AGENT 6 ────────────
// Agent 6 replaces the bodies with @supabase/supabase-js calls against
// supabase/schema.sql. Signatures must NOT change. The in-memory fallback
// (no SUPABASE_URL) must keep working so local dev never blocks.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  PROBLEM_BUILD_STEPS,
  PROBLEM_STEP_MS,
  type AuditEntry,
  type ProblemTask,
  type RiskScore,
} from "@/lib/types";

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
  __mcProblems?: ProblemTask[];
};
const memScores = (g.__mcScores ??= new Map<string, RiskScore>());
const memAudit = (g.__mcAudit ??= []);
const memProblems = (g.__mcProblems ??= []);

function computeStep(approvedAt: string | null): number {
  if (!approvedAt) return 0;
  const elapsed = Date.now() - new Date(approvedAt).getTime();
  return Math.min(PROBLEM_BUILD_STEPS.length - 1, Math.floor(elapsed / PROBLEM_STEP_MS));
}

function isBuildElapsed(approvedAt: string | null): boolean {
  if (!approvedAt) return false;
  const elapsed = Date.now() - new Date(approvedAt).getTime();
  return elapsed >= (PROBLEM_BUILD_STEPS.length + 1) * PROBLEM_STEP_MS;
}

/** Deterministic negative pr_number so problem-task audit rows are visually
 *  distinct from real (always-positive) GitHub PR numbers. */
function syntheticPrNumber(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return -(Math.abs(h) % 900000) - 1;
}

export async function createProblemTask(text: string): Promise<ProblemTask> {
  const now = new Date().toISOString();
  const client = getClient();
  if (!client) {
    const task: ProblemTask = {
      id: crypto.randomUUID(),
      text,
      status: "pending",
      step: 0,
      createdAt: now,
      approvedAt: null,
    };
    memProblems.unshift(task);
    return task;
  }

  try {
    const { data, error } = await client
      .from("problem_tasks")
      .insert({ text, status: "pending" })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      text: data.text,
      status: data.status,
      step: 0,
      createdAt: data.created_at,
      approvedAt: data.approved_at,
    };
  } catch (err) {
    console.warn("[db] createProblemTask:", err);
    const task: ProblemTask = {
      id: crypto.randomUUID(),
      text,
      status: "pending",
      step: 0,
      createdAt: now,
      approvedAt: null,
    };
    memProblems.unshift(task);
    return task;
  }
}

async function patchProblemTask(
  id: string,
  patch: { status: ProblemTask["status"]; approvedAt?: string }
): Promise<ProblemTask | null> {
  const client = getClient();
  if (!client) {
    const task = memProblems.find((p) => p.id === id);
    if (!task) return null;
    task.status = patch.status;
    if (patch.approvedAt !== undefined) task.approvedAt = patch.approvedAt;
    return task;
  }

  try {
    const updatePayload: Record<string, unknown> = { status: patch.status };
    if (patch.approvedAt !== undefined) updatePayload.approved_at = patch.approvedAt;
    const { data, error } = await client
      .from("problem_tasks")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      text: data.text,
      status: data.status,
      step: 0,
      createdAt: data.created_at,
      approvedAt: data.approved_at,
    };
  } catch (err) {
    console.warn("[db] patchProblemTask:", err);
    const task = memProblems.find((p) => p.id === id);
    if (!task) return null;
    task.status = patch.status;
    if (patch.approvedAt !== undefined) task.approvedAt = patch.approvedAt;
    return task;
  }
}

export async function approveProblemTask(id: string): Promise<ProblemTask | null> {
  const task = await patchProblemTask(id, {
    status: "building",
    approvedAt: new Date().toISOString(),
  });
  if (task) task.step = computeStep(task.approvedAt);
  return task;
}

export async function rejectProblemTask(id: string): Promise<ProblemTask | null> {
  const task = await patchProblemTask(id, { status: "rejected" });
  if (!task) return null;
  await insertAudit({
    pr_number: syntheticPrNumber(task.id),
    pr_title: `Problem: ${task.text}`,
    risk_level: "low",
    score: 0,
    action: "rejected",
    reasons: ["Operator-submitted task, dismissed"],
  });
  return task;
}

async function rawListProblemTasks(): Promise<ProblemTask[]> {
  const client = getClient();
  if (!client) {
    return [...memProblems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  try {
    const { data, error } = await client
      .from("problem_tasks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      text: row.text as string,
      status: row.status as ProblemTask["status"],
      step: 0,
      createdAt: row.created_at as string,
      approvedAt: row.approved_at as string | null,
    }));
  } catch (err) {
    console.warn("[db] listProblemTasks:", err);
    return [...memProblems];
  }
}

/** Lists problem tasks, finalizing (status → done + audit entry) any whose
 *  simulated build time has elapsed since it was approved. */
export async function listProblemTasks(): Promise<ProblemTask[]> {
  const tasks = await rawListProblemTasks();
  const result: ProblemTask[] = [];
  for (const task of tasks) {
    if (task.status === "building" && isBuildElapsed(task.approvedAt)) {
      const updated = await patchProblemTask(task.id, { status: "done" });
      await insertAudit({
        pr_number: syntheticPrNumber(task.id),
        pr_title: `Problem: ${task.text}`,
        risk_level: "low",
        score: 0,
        action: "approved",
        reasons: ["Operator-submitted task, fix shipped"],
      });
      result.push(updated ?? { ...task, status: "done", step: 0 });
    } else if (task.status === "building") {
      result.push({ ...task, step: computeStep(task.approvedAt) });
    } else {
      result.push(task);
    }
  }
  return result;
}

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
