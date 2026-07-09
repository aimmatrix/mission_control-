// ─── SPINE STUB — SIGNATURE LOCKED, BODY OWNED BY AGENT 1 ────────────
// Agent 1 replaces the bodies below with real GitHub REST calls.
// The exported signatures must NOT change; every other stream calls them.
// Fixture fallback (no GITHUB_TOKEN / GITHUB_TARGET_REPO) must keep working.
import type { ActionResult, PullRequest } from "@/lib/types";
import { FIXTURE_PRS } from "@/fixtures/prs";

export const MAX_DIFF_CHARS = 50_000;

export function githubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_TARGET_REPO);
}

/**
 * Open PRs on GITHUB_TARGET_REPO, each including its unified diff
 * (truncated to MAX_DIFF_CHARS). Falls back to fixtures when unconfigured.
 */
export async function listOpenPRs(): Promise<PullRequest[]> {
  if (!githubConfigured()) return FIXTURE_PRS;
  // TODO(Agent 1): GET /repos/{repo}/pulls?state=open, then per-PR diff via
  // Accept: application/vnd.github.v3.diff and files via /pulls/{n}/files.
  // Handle 403 rate limits by returning what you have + console.warn.
  return FIXTURE_PRS;
}

/** Merge the PR. Returns ok:false with a human-readable message on failure. */
export async function mergePR(prNumber: number): Promise<ActionResult> {
  if (!githubConfigured())
    return { ok: true, message: `Merge simulated for PR #${prNumber} (no GitHub token).` };
  // TODO(Agent 1): PUT /repos/{repo}/pulls/{n}/merge
  return { ok: true, message: `Merge simulated for PR #${prNumber}.` };
}

/** Close the PR without merging. */
export async function closePR(prNumber: number): Promise<ActionResult> {
  if (!githubConfigured())
    return { ok: true, message: `Close simulated for PR #${prNumber} (no GitHub token).` };
  // TODO(Agent 1): PATCH /repos/{repo}/pulls/{n} { state: "closed" }
  return { ok: true, message: `Close simulated for PR #${prNumber}.` };
}
