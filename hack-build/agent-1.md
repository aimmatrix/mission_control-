# Agent 1 — GitHub adapter (real PR fetch + merge/close)

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** replace the stub bodies in the GitHub adapter with real GitHub REST calls. You are the live-data path — without you the demo runs on fixtures.

## Files you OWN (create/edit only these)
- `lib/adapters/github.ts` — **body only; the exported signatures are locked**

## NEVER touch
- `lib/types.ts`, `package.json`, lockfiles, `fixtures/**`, `tailwind.config.ts`, `supabase/schema.sql`
- `app/**`, `components/**`, `lib/db.ts`, `lib/adapters/llm.ts`, `scripts/**`

## Contracts you implement (committed in the spine — do not change)
```ts
export function githubConfigured(): boolean; // GITHUB_TOKEN && GITHUB_TARGET_REPO
export async function listOpenPRs(): Promise<PullRequest[]>;
export async function mergePR(prNumber: number): Promise<ActionResult>;
export async function closePR(prNumber: number): Promise<ActionResult>;
// PullRequest / ActionResult are in lib/types.ts. head_sha = PR head sha.
// diff = unified diff string, truncate to MAX_DIFF_CHARS (50_000).
```

## Implementation notes
- Use plain `fetch` — **do not add any npm package.**
- `GET https://api.github.com/repos/${GITHUB_TARGET_REPO}/pulls?state=open` with headers `Authorization: Bearer ${GITHUB_TOKEN}`, `X-GitHub-Api-Version: 2022-11-28`.
- Per PR, fetch the diff: same URL per PR with header `Accept: application/vnd.github.v3.diff`; changed files via `GET /pulls/{n}/files` (map to filename list); additions/deletions from the files or PR payload.
- Merge: `PUT /repos/{repo}/pulls/{n}/merge` → 200 ok; surface GitHub's `message` on failure (405 not mergeable etc.).
- Close: `PATCH /repos/{repo}/pulls/{n}` body `{"state":"closed"}`.
- Rate limits / errors: never throw out of `listOpenPRs` — on 403/network failure, `console.warn` and return the fixture PRs (`FIXTURE_PRS`) so the demo never white-screens.
- Keep the unconfigured fallback exactly as it is (fixtures / simulated ActionResult).

## Build against fallbacks
Without env vars everything must still work on fixtures — that behavior already exists; preserve it.

## Definition of Done
- With `GITHUB_TOKEN` + `GITHUB_TARGET_REPO` set: `curl localhost:3000/api/prs` returns the real open PRs of the target repo, each with a non-empty `diff`.
- Merge/close hit real GitHub and return honest `ActionResult`s.
- Smoke test: `npm run build` passes; `curl -s localhost:3000/api/prs | head -c 400` shows real PR titles.

## If you need a change to a locked/shared file
STOP and ask the human. Do not edit `lib/types.ts`, `package.json`, or another agent's files.
