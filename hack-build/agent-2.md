# Agent 2 — Review queue UI (the demo centerpiece)

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** build the risk-colored review queue. This is what's on screen for 60% of the demo — it must look like a calm, dark control room and work perfectly on a phone.

## Files you OWN (create/edit only these)
- `components/queue/**` (replace the stub `Queue.tsx`; add `PRCard.tsx`, `RiskGate.tsx`, etc. as you like)

## NEVER touch
- `app/**` (pages, layout, API routes), `lib/**`, `fixtures/**`, `package.json`, `tailwind.config.ts`, `components/landing/**`, `components/audit/**`

## Contracts you implement (committed in the spine — do not change)
- `Queue.tsx`: **default export, no props** — `app/page.tsx` already mounts it; don't edit that file.
- Data in: `GET /api/prs` → `{ prs: ScoredPR[] }` (already works, returns 4 fixture PRs: 2 low, 1 medium `#102`, 1 high `#103` with DROP TABLE / RLS reasons).
- Actions out: `POST /api/action` with JSON body `ActionRequest`:
```ts
{ pr_number, pr_title, risk_level, score, reasons, action: "approved" | "rejected" }
```
→ returns `{ ok: boolean; message: string }`. Types in `lib/types.ts` — import them.

## UX requirements
- One card per PR. Risk color is the primary visual language (tokens exist: `border-risk-low`, `text-risk-medium`, `bg-ctrl-panel`, `border-ctrl-line`, `text-ctrl-dim` …).
- **Low (green):** big one-tap Approve button (min 48px touch target) + smaller Reject.
- **Medium (amber):** expandable summary — collapsed shows `one_line_summary` + score; expanded shows `reasons`, `blast_radius`, changed files. Approve/Reject beneath.
- **High (red):** Approve is locked behind an explicit confirmation gate — show the `reasons` list prominently, require a checkbox/hold "I understand the risk" before the Approve button enables.
- After an action: optimistic UI (card marks itself approved/rejected or slides out), disable buttons while in flight, show the returned `message` on failure.
- Show score number and a `cached` indicator subtly. Sort order comes from the API (riskiest first) — keep it.
- Mobile-first: single column, comfortable spacing, no hover-only affordances.

## Build against fallbacks
The API already serves fixture PRs with zero env vars — build entirely against `npm run dev` + fixtures. Do not wait on GitHub/LLM being live.

## Definition of Done
- All 4 fixture PRs render with correct colors; high-risk `#103` cannot be approved without the explicit gate.
- Tapping Approve on `#101` POSTs to `/api/action` and the UI reflects success.
- Smoke test: `npm run dev`, open `localhost:3000` at 390px width — queue is fully usable.

## If you need a change to a locked/shared file
STOP and ask the human. Do not edit `lib/types.ts`, `package.json`, `app/page.tsx`, or another agent's files.
