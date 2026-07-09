// ─── SPINE STUB — SIGNATURE LOCKED, BODY OWNED BY CLAUDE ─────────────
// Claude (main session) implements the real LLM call. No Cursor agent
// touches this file. Fixture fallback works without LLM_API_KEY.
import type { PullRequest, RiskScore } from "@/lib/types";
import { FIXTURE_SCORES } from "@/fixtures/scores";

export function llmConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY);
}

/** Risk-score a PR via the LLM using prompts/risk-scorer.md. */
export async function scorePR(pr: PullRequest): Promise<RiskScore> {
  return (
    FIXTURE_SCORES[pr.number] ?? {
      risk_level: "medium",
      score: 50,
      reasons: ["Scorer stub: no fixture for this PR"],
      blast_radius: "Unknown — stub score.",
      requires_human: true,
      one_line_summary: pr.title,
    }
  );
}
