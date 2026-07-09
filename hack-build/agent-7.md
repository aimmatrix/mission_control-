# Agent 7 — Demo PR seeder script

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** a script that opens realistic PRs (mixed risk levels) on the demo target repo, so the queue always has fresh, real PRs to score — including re-seeding live at the venue after we merge one during rehearsal.

## Files you OWN (create/edit only these)
- `scripts/seed-prs.mjs` (new file)
- `scripts/README.md` (usage notes, optional)

## NEVER touch
- Everything else in this repo — `app/**`, `components/**`, `lib/**`, `fixtures/**`, `package.json`, `lib/types.ts`. Your script talks to the GitHub API of ANOTHER repo (`GITHUB_TARGET_REPO`); it changes nothing here.

## What the script does
Run with `node scripts/seed-prs.mjs` (Node 18+, plain `fetch`, **zero npm deps**). Env: `GITHUB_TOKEN`, `GITHUB_TARGET_REPO` (`owner/repo`).

For each seed PR (skip any whose branch/PR already exists — idempotent):
1. Get the default branch's head sha (`GET /repos/{repo}` then `GET /git/ref/heads/{default}`).
2. Create a branch (`POST /git/refs`).
3. Create/update a file on it (`PUT /contents/{path}` with base64 content + branch).
4. Open the PR (`POST /pulls`) with a realistic agent-style title/body.

Seed these four (match the demo story):
- **Low:** `demo/fix-welcome-typo` — fix a typo in a copy string.
- **Low:** `demo/button-padding` — 4px padding tweak in a component.
- **Medium:** `demo/spending-trends` — add a new ~150-line React component file + edit a screen to import it.
- **High:** `demo/schema-cleanup` — add `migrations/20260709_cleanup.sql` containing `ALTER TABLE users DROP COLUMN legacy_plan;`, `DROP TABLE user_sessions_backup;`, and an `ALTER POLICY ... USING (true)` — titled innocently "Clean up unused user columns" (the scope-mismatch is the point: the scorer must catch it).

Print a summary table (number, title, url) at the end. On any API error, print the status + message and continue with the next PR.

## Definition of Done
- Running the script against the target repo yields 4 open PRs at the right risk mix; running it twice creates no duplicates.
- Smoke test: `node scripts/seed-prs.mjs` output shows 4 PR URLs (or "already exists" lines).

## If you need a change to a locked/shared file
STOP and ask the human. You should never need to touch app code at all.
