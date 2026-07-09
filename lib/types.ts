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
