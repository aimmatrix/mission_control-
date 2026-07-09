// ─── SPINE STUB — SIGNATURE LOCKED, BODY OWNED BY AGENT 1 ────────────
// Agent 1 replaces the bodies below with real GitHub REST calls.
// The exported signatures must NOT change; every other stream calls them.
// Fixture fallback (no GITHUB_TOKEN / GITHUB_TARGET_REPO) must keep working.
import type { ActionResult, PullRequest } from "@/lib/types";
import { FIXTURE_PRS } from "@/fixtures/prs";

export const MAX_DIFF_CHARS = 50_000;

const API_VERSION = "2022-11-28";

type GhPull = {
  number: number;
  title: string;
  body: string | null;
  user: { login: string } | null;
  head: { sha: string };
  html_url: string;
  updated_at: string;
  additions?: number;
  deletions?: number;
};

type GhFile = {
  filename: string;
  additions: number;
  deletions: number;
};

function token(): string {
  return process.env.GITHUB_TOKEN!;
}

function repo(): string {
  return process.env.GITHUB_TARGET_REPO!;
}

function baseHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    Authorization: `Bearer ${token()}`,
    "X-GitHub-Api-Version": API_VERSION,
    Accept: "application/vnd.github+json",
    ...extra,
  };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string };
    if (data.message) return data.message;
  } catch {
    // ignore parse errors
  }
  return res.statusText || `GitHub HTTP ${res.status}`;
}

export function githubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_TARGET_REPO);
}

/**
 * Open PRs on GITHUB_TARGET_REPO, each including its unified diff
 * (truncated to MAX_DIFF_CHARS). Falls back to fixtures when unconfigured.
 */
export async function listOpenPRs(): Promise<PullRequest[]> {
  if (!githubConfigured()) return FIXTURE_PRS;

  try {
    const listRes = await fetch(
      `https://api.github.com/repos/${repo()}/pulls?state=open&per_page=30`,
      { headers: baseHeaders(), cache: "no-store" },
    );

    if (listRes.status === 403) {
      console.warn(
        "[github] listOpenPRs rate-limited or forbidden (403); falling back to fixtures",
      );
      return FIXTURE_PRS;
    }

    if (!listRes.ok) {
      console.warn(
        `[github] listOpenPRs failed: ${listRes.status} ${await readErrorMessage(listRes)}; falling back to fixtures`,
      );
      return FIXTURE_PRS;
    }

    const pulls = (await listRes.json()) as GhPull[];
    const results: PullRequest[] = [];

    for (const pull of pulls) {
      try {
        const [diffRes, filesRes] = await Promise.all([
          fetch(
            `https://api.github.com/repos/${repo()}/pulls/${pull.number}`,
            {
              headers: baseHeaders({
                Accept: "application/vnd.github.v3.diff",
              }),
              cache: "no-store",
            },
          ),
          fetch(
            `https://api.github.com/repos/${repo()}/pulls/${pull.number}/files?per_page=100`,
            { headers: baseHeaders(), cache: "no-store" },
          ),
        ]);

        if (diffRes.status === 403 || filesRes.status === 403) {
          console.warn(
            `[github] rate-limited fetching PR #${pull.number}; keeping PR with degraded data`,
          );
          results.push({
            number: pull.number,
            title: pull.title,
            body: pull.body ?? "",
            author: pull.user?.login ?? "unknown",
            head_sha: pull.head.sha,
            url: pull.html_url,
            updated_at: pull.updated_at,
            additions: 0,
            deletions: 0,
            changed_files: [],
            diff: "",
          });
          continue;
        }

        let diff = "";
        if (diffRes.ok) {
          diff = await diffRes.text();
          if (diff.length > MAX_DIFF_CHARS) {
            diff = diff.slice(0, MAX_DIFF_CHARS);
          }
        } else {
          console.warn(
            `[github] diff fetch failed for PR #${pull.number}: ${diffRes.status}`,
          );
        }

        let changed_files: string[] = [];
        let additions = 0;
        let deletions = 0;

        if (filesRes.ok) {
          const files = (await filesRes.json()) as GhFile[];
          changed_files = files.map((f) => f.filename);
          additions = files.reduce((sum, f) => sum + f.additions, 0);
          deletions = files.reduce((sum, f) => sum + f.deletions, 0);
        } else {
          console.warn(
            `[github] files fetch failed for PR #${pull.number}: ${filesRes.status}`,
          );
        }

        results.push({
          number: pull.number,
          title: pull.title,
          body: pull.body ?? "",
          author: pull.user?.login ?? "unknown",
          head_sha: pull.head.sha,
          url: pull.html_url,
          updated_at: pull.updated_at,
          additions,
          deletions,
          changed_files,
          diff,
        });
      } catch (err) {
        console.warn(
          `[github] failed to enrich PR #${pull.number}:`,
          err,
        );
      }
    }

    return results;
  } catch (err) {
    console.warn("[github] listOpenPRs network failure; falling back to fixtures:", err);
    return FIXTURE_PRS;
  }
}

/** Merge the PR. Returns ok:false with a human-readable message on failure. */
export async function mergePR(prNumber: number): Promise<ActionResult> {
  if (prNumber >= 900000)
    return { ok: true, message: `Merge simulated for demo PR #${prNumber}.` };
  if (!githubConfigured())
    return { ok: true, message: `Merge simulated for PR #${prNumber} (no GitHub token).` };

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo()}/pulls/${prNumber}/merge`,
      {
        method: "PUT",
        headers: baseHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({}),
      },
    );

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        sha?: string;
      };
      return {
        ok: true,
        message: data.message ?? `Merged PR #${prNumber}.`,
      };
    }

    return {
      ok: false,
      message: await readErrorMessage(res),
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : `Network error merging PR #${prNumber}`,
    };
  }
}

/** Close the PR without merging. */
export async function closePR(prNumber: number): Promise<ActionResult> {
  if (prNumber >= 900000)
    return { ok: true, message: `Close simulated for demo PR #${prNumber}.` };
  if (!githubConfigured())
    return { ok: true, message: `Close simulated for PR #${prNumber} (no GitHub token).` };

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo()}/pulls/${prNumber}`,
      {
        method: "PATCH",
        headers: baseHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ state: "closed" }),
      },
    );

    if (res.ok) {
      return { ok: true, message: `Closed PR #${prNumber}.` };
    }

    return {
      ok: false,
      message: await readErrorMessage(res),
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : `Network error closing PR #${prNumber}`,
    };
  }
}
