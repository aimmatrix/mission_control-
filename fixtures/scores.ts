// ─── LOCKED SPINE FILE ── canned risk scores keyed by PR number, used as
// the offline fallback when LLM_API_KEY is unset. Do not edit.
import type { RiskScore } from "@/lib/types";

export const FIXTURE_SCORES: Record<number, RiskScore> = {
  101: {
    risk_level: "low",
    score: 6,
    reasons: ["Single-line copy change in Welcome.tsx", "No logic touched"],
    blast_radius: "One onboarding screen string; trivially revertable.",
    requires_human: false,
    one_line_summary: "Fixes a typo in the welcome screen copy.",
  },
  102: {
    risk_level: "medium",
    score: 44,
    reasons: [
      "New dependency added (recharts) in package.json",
      "214 added lines of new component logic",
      "Touches shared Insights screen",
    ],
    blast_radius: "Insights tab plus the dependency tree; revertable but sizeable.",
    requires_human: true,
    one_line_summary: "Adds a new spending-trends chart component and dependency.",
  },
  103: {
    risk_level: "high",
    score: 91,
    reasons: [
      "DROP TABLE user_sessions_backup — irreversible data loss",
      "ALTER POLICY on transactions relaxes RLS to USING (true)",
      "auth.ts removes the UnauthorizedError guard, allowing anonymous fallthrough",
      "Diff far exceeds the stated 'minor schema tidy-up'",
    ],
    blast_radius: "Database schema, row-level security, and auth path — mutates production data and permissions.",
    requires_human: true,
    one_line_summary: "Destructive migration that also weakens RLS and auth checks.",
  },
  104: {
    risk_level: "low",
    score: 18,
    reasons: ["4px padding tweak", "Patch-level dependency bump"],
    blast_radius: "Button spacing app-wide; trivially revertable.",
    requires_human: false,
    one_line_summary: "Bumps tailwind and adjusts primary button padding.",
  },
};
