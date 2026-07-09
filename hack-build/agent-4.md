# Agent 4 — Audit trail page

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** the `/audit` page — the oversight trail that closes the demo ("every autonomous action, scored, explained, and logged"). Make it feel like a flight recorder.

## Files you OWN (create/edit only these)
- `app/audit/**` (a stub page exists — replace it)
- `app/api/audit/route.ts` (working stub — keep the contract)
- `components/audit/**` (create as needed)

## NEVER touch
- `lib/**` (you CALL `listAudit` from `@/lib/db`), `app/page.tsx`, `app/layout.tsx`, `components/queue/**`, `components/landing/**`, `fixtures/**`, `lib/types.ts`, `package.json`

## Contracts (locked)
- `GET /api/audit` → `{ entries: AuditEntry[] }` newest first, where `AuditEntry` (lib/types.ts) =
  `{ id, pr_number, pr_title, risk_level, score, action: "approved"|"rejected", reasons: string[], created_at }`
- The page is already linked from the header nav (`/audit`) — the shell handles layout/header; render only page content.

## UX requirements
- Dark control-room aesthetic using existing tokens (`bg-ctrl-panel`, `border-ctrl-line`, `text-ctrl-dim`, `text-risk-low/medium/high`).
- Each row: risk-colored dot/badge, `#pr_number pr_title`, action (approved ✓ merged / rejected ✕ closed), score, relative timestamp ("2m ago"), expandable `reasons`.
- Empty state that still demos well: "No autonomous actions yet — the queue is waiting."
- Poll or `router.refresh()` every ~5s so an approval made on the queue appears without a manual reload.
- Mobile-first, single column.

## Build against fallbacks
With no env vars the audit store is in-memory. To get test data: `curl -X POST localhost:3000/api/action -H 'content-type: application/json' -d '{"pr_number":101,"pr_title":"Fix typo","risk_level":"low","score":6,"reasons":["copy change"],"action":"approved"}'`

## Definition of Done
- After the curl above, `/audit` shows the entry with correct color, action, and timestamp; a second action appears within ~5s without reload.
- Smoke test: `npm run build` passes; page renders on a 390px viewport.

## If you need a change to a locked/shared file
STOP and ask the human. Do not edit `lib/types.ts`, `package.json`, or another agent's files.
