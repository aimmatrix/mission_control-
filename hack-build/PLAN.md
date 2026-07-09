# Mission Control — hack-build plan

**Demo goal:** live Vercel URL on a phone: fetch real PRs → LLM risk scores → green/amber/red queue → one-tap approve merges on GitHub → audit trail.
**Streams:** Claude + 9 Cursor agents. (More than 9 would start sharing files — 9 is the collision-free max for this scope.)
**Spine commit:** `20a628d` — every contract below is already committed and builds. Agents can start immediately, in any order.

## File ownership matrix

| Stream | Owns | Never touches |
|--------|------|---------------|
| **Claude** (risk-scoring pipeline — the product) | `lib/adapters/llm.ts` (real impl, signature locked), `app/api/prs/route.ts`, `prompts/risk-scorer.md` tuning | everything else |
| **Agent 1** (GitHub adapter) | `lib/adapters/github.ts` (real impl body, signatures locked) | all other files |
| **Agent 2** (review queue UI) | `components/queue/**` | API routes, lib/, other components |
| **Agent 3** (approve/reject action route) | `app/api/action/route.ts` (body; contract locked) | UI, adapters, db |
| **Agent 4** (audit trail) | `app/audit/**`, `app/api/audit/route.ts` (body), `components/audit/**` | queue, landing, adapters |
| **Agent 5** (landing/hero) | `components/landing/**` | queue, API routes |
| **Agent 6** (Supabase persistence) | `lib/db.ts` (real impl body, signatures locked) | schema.sql (locked), adapters, UI |
| **Agent 7** (demo PR seeder) | `scripts/seed-prs.mjs` | the entire app |
| **Agent 8** (theme & mobile polish) | `app/globals.css`, `app/manifest.ts`, `public/**` | components, routes, tailwind.config.ts |
| **Agent 9** (README + demo collateral) | `README.md`, `docs/**` | all code |

## Locked shared contracts (the spine — edited by NO stream)

- `lib/types.ts` — RiskScore, PullRequest, ScoredPR, AuditEntry, ActionRequest, ActionResult + the three API contracts.
- `package.json` / lockfile — all deps added in the spine commit (`@supabase/supabase-js` is in). **No stream adds a dependency.**
- `fixtures/prs.ts`, `fixtures/scores.ts` — 4 seeded PRs (2 low, 1 medium, 1 high) + canned scores. Every UI renders from these with zero env vars.
- `supabase/schema.sql` — `audit_log` + `score_cache`. Run once in the Supabase SQL editor.
- `tailwind.config.ts` — design tokens: `ctrl-bg/panel/line/fg/dim`, `risk-low/medium/high`.
- `app/layout.tsx`, `app/page.tsx` — the shell that mounts Landing + Queue and pins the data flow (Queue self-fetches `/api/prs`; no props between streams).

**Locked file vs locked signature:** `lib/adapters/github.ts` and `lib/db.ts` are spine *stubs* whose **bodies** are owned by Agents 1 and 6 — those commits are expected, not violations. What can never change: exported signatures, `lib/types.ts`, `package.json`, schema columns.

## Build order / dependencies

1. Spine — **done, committed.**
2. All 9 agents + Claude are independent — launch simultaneously. Everything works against fixtures/mocks until real keys flow.
3. Suggested priority if launching in waves: 1, 2, 6 (live data path) → 3, 4 (actions) → 5, 7, 8, 9 (polish/collateral).

## Integration checklist (end of sprint)

- [ ] `GET /api/prs` returns real PRs with real LLM scores (not `cached: false` fixtures)
- [ ] one-tap approve on a low PR merges on GitHub and appears in `/audit`
- [ ] high-risk PR shows reasons + confirmation gate
- [ ] full demo path on the live Vercel URL from the phone
- [ ] `git log --stat` — no stream edited a locked file
- [ ] cut list if behind: GitHub write actions → landing → audit page. **Never cut fetch → score → queue.**
