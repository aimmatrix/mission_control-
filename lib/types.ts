// ─── LOCKED SPINE FILE ───────────────────────────────────────────────
// No stream may edit this file. If you need a type change, STOP and ask
// the human. Every module builds against these contracts.

export type RiskLevel = "low" | "medium" | "high";

/** Exact JSON shape returned by the risk-scorer LLM (prompts/risk-scorer.md). */
export interface RiskScore {
  risk_level: RiskLevel;
  score: number; // 0-100, higher = riskier
  reasons: string[];
  blast_radius: string;
  requires_human: boolean;
  one_line_summary: string;
}

export interface PullRequest {
  number: number;
  title: string;
  body: string;
  author: string;
  head_sha: string;
  url: string;
  updated_at: string; // ISO
  additions: number;
  deletions: number;
  changed_files: string[];
  diff: string; // unified diff, truncated to ~50KB by the adapter
}

export interface ScoredPR {
  pr: PullRequest;
  score: RiskScore;
  cached: boolean;
}

export type AuditAction = "approved" | "rejected";

export interface AuditEntry {
  id: string;
  pr_number: number;
  pr_title: string;
  risk_level: RiskLevel;
  score: number;
  action: AuditAction;
  reasons: string[];
  created_at: string; // ISO
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

// ─── API contracts ──────────────────────────────────────────────────
// GET  /api/prs    → { prs: ScoredPR[] }            (500 → { error })
// POST /api/action → body: ActionRequest → ActionResult; writes audit_log
// GET  /api/audit  → { entries: AuditEntry[] }

export interface ActionRequest {
  pr_number: number;
  pr_title: string;
  risk_level: RiskLevel;
  score: number;
  reasons: string[];
  action: AuditAction;
}

// ─── Problem tasks (operator-submitted, agents page) ─────────────────
// Server-backed (Supabase problem_tasks table, in-memory fallback) so the
// same task is visible from the Queue, the Audit trail, and the Agents
// fleet status — not just the page it was submitted from.

export type ProblemStatus = "pending" | "building" | "done" | "rejected";

export const PROBLEM_BUILD_STEPS = [
  "Queued for agent",
  "Analyzing codebase",
  "Writing fix",
  "Running tests",
] as const;

export const PROBLEM_STEP_MS = 1600;

export interface ProblemTask {
  id: string;
  text: string;
  status: ProblemStatus;
  step: number; // derived server-side from elapsed time since approvedAt
  createdAt: string; // ISO
  approvedAt: string | null; // ISO, set on approve
}

// GET   /api/problems      → { tasks: ProblemTask[] }
// POST  /api/problems      → body: { text: string } → { task: ProblemTask } (400 on empty text)
// PATCH /api/problems/:id  → body: { action: "approve" | "reject" } → { task: ProblemTask } (404/400)
