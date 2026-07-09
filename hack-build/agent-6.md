# Agent 6 — Supabase persistence (score cache + audit log)

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** replace the in-memory stubs in `lib/db.ts` with real Supabase reads/writes so scores are cached (instant refreshes) and the audit trail survives serverless cold starts. On Vercel, in-memory = data loss — you make persistence real.

## Files you OWN (create/edit only these)
- `lib/db.ts` — **body only; exported signatures are locked**

## NEVER touch
- `supabase/schema.sql` (locked — the tables are the contract; run it in the Supabase SQL editor, don't edit it)
- `lib/types.ts`, `package.json` (`@supabase/supabase-js` is ALREADY installed), `lib/adapters/**`, `app/**`, `components/**`, `fixtures/**`

## Contracts you implement (committed in the spine — do not change)
```ts
export function supabaseConfigured(): boolean; // SUPABASE_URL && SUPABASE_SERVICE_KEY
export async function getCachedScore(prNumber: number, headSha: string): Promise<RiskScore | null>;
export async function setCachedScore(prNumber: number, headSha: string, score: RiskScore): Promise<void>;
export async function insertAudit(entry: Omit<AuditEntry, "id" | "created_at">): Promise<void>;
export async function listAudit(): Promise<AuditEntry[]>; // newest first
```
Tables (already defined in `supabase/schema.sql`):
- `score_cache(pr_number int, head_sha text, score jsonb, created_at, PK (pr_number, head_sha))`
- `audit_log(id uuid default, pr_number, pr_title, risk_level, score int, action, reasons jsonb, created_at)`

## Implementation notes
- `createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)` from `@supabase/supabase-js` — server-side only (this file is only imported by API routes). Create the client lazily/memoized at module scope.
- **Keep the in-memory fallback**: when `!supabaseConfigured()`, use the existing Map/array path so local dev without keys still works.
- Never throw out of these functions on Supabase errors — `console.warn` and degrade (return null / skip cache / fall back to memory). A dead cache must not kill the demo.
- `setCachedScore`: upsert on the composite key. `listAudit`: `order("created_at", { ascending: false }).limit(100)`.

## Definition of Done
- With Supabase env vars set: approving a PR inserts a row in `audit_log` (visible in the Supabase table editor), and a second `GET /api/prs` returns `"cached": true` for every PR.
- Without env vars: everything still works in memory.
- Smoke test: `npm run build` passes; hit `/api/prs` twice and confirm `cached: true` on the second call.

## If you need a change to a locked/shared file
STOP and ask the human. Do not edit `lib/types.ts`, `supabase/schema.sql`, `package.json`, or another agent's files.
