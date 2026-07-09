# Agent 9 — README + demo collateral

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** the judge-facing paper trail — a README that sells the project in 30 seconds and a demo-day runbook. Docs only; you never touch code.

## Files you OWN (create/edit only these)
- `README.md` (rewrite)
- `docs/**` (new: `docs/demo-script.md`, `docs/architecture.md`)

## NEVER touch
- All code: `app/**`, `components/**`, `lib/**`, `fixtures/**`, `scripts/**`, `package.json`, `AGENTS.md`, `README-SECRETS.md`, `prompts/**`, `supabase/**`

## README.md must contain
- One-line pitch + hero framing: "Mission Control — every agent supervised. The review layer for the software factory: agents build, humans stay in command."
- The problem (agents get autonomy faster than we get oversight; origin story: a founder's agent once deleted his Git history).
- How it works, 4 bullets: fetch open PRs → LLM risk-scores each diff (prompt in `prompts/risk-scorer.md`) → green/amber/red one-tap queue with a confirmation gate on high risk → every action logged to a Supabase audit trail.
- Architecture sketch (text/mermaid): Next.js 14 App Router on Vercel · GitHub REST · LLM scorer · Supabase (`audit_log`, `score_cache`). Data flow: `/api/prs` → adapters → queue UI → `/api/action` → `/audit`.
- **Built BY the thing it supervises**: the meta-story that Cursor cloud agents built it in parallel under a locked-spine plan (`hack-build/PLAN.md`), directed from a phone.
- Setup: env var table (names only — copy from `AGENTS.md`; NEVER paste values), `supabase/schema.sql` one-liner, `npm i && npm run dev`.
- Judging criteria mapping table (autonomy, safety & oversight, technical execution, UX clarity, real-world applicability, best use of Cursor).

## docs/demo-script.md
The timed 2-minute script: (0:00) voice-brief footage → (0:20) the problem → (0:40) live queue: approve green PR, show real merge on GitHub; open red PR, show reasons + gate → (1:30) `/audit` page → (1:50) close line. Include a pre-demo checklist (re-run seeder, refresh scores, phone on venue Wi-Fi, screen recording on).

## Definition of Done
- A judge reading only README.md understands the product, the safety design, and the meta-story without opening code.
- Smoke test: markdown renders cleanly on GitHub (check headings/tables/mermaid).

## If you need a change to a locked/shared file
STOP and ask the human. You never need to touch code.
