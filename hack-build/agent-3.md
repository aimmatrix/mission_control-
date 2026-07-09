# Agent 3 — Approve/reject action route

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** harden the action endpoint — the one route that touches the real world (merges/closes on GitHub) and writes the audit trail. Correctness and honest error messages matter more than features.

## Files you OWN (create/edit only these)
- `app/api/action/route.ts` (a working stub exists — replace the body; the HTTP contract is locked)

## NEVER touch
- `lib/**` (you CALL `mergePR`/`closePR`/`insertAudit`, you don't edit them), `app/api/prs/**`, `app/api/audit/**`, `components/**`, `fixtures/**`, `lib/types.ts`, `package.json`

## Contract (locked)
- `POST /api/action`, JSON body `ActionRequest` from `lib/types.ts`:
  `{ pr_number, pr_title, risk_level, score, reasons, action: "approved" | "rejected" }`
- `"approved"` → `mergePR(pr_number)`; `"rejected"` → `closePR(pr_number)` (both from `@/lib/adapters/github`).
- On `result.ok`, `await insertAudit({...})` (from `@/lib/db`) with the request fields.
- Respond `{ ok, message }` — 200 on success, 400 on malformed body, 502 when GitHub refuses.

## Hardening to add
- Validate the body strictly (numbers are numbers, action is one of two values, reasons is a string array — coerce/default safely).
- Wrap the GitHub call in try/catch — network throw must become `{ ok:false, message }`, never a 500 HTML page.
- If the audit write itself fails, still return ok:true but include "audit write failed" in the message (the merge already happened — never lie about it).
- Add a simple idempotency guard: module-level `Set` of in-flight `pr_number`s → second concurrent tap returns 409 `{ ok:false, message:"action already in progress" }`.

## Build against fallbacks
With no env vars, `mergePR`/`closePR` return simulated success and the audit store is in-memory — the full loop is testable locally with curl.

## Definition of Done
- `curl -X POST localhost:3000/api/action -H 'content-type: application/json' -d '{"pr_number":101,"pr_title":"t","risk_level":"low","score":6,"reasons":[],"action":"approved"}'` → `{"ok":true,...}` and the entry appears in `GET /api/audit`.
- Malformed body → 400 JSON, never a crash.
- Smoke test: `npm run build` passes + the curl above.

## If you need a change to a locked/shared file
STOP and ask the human. Do not edit `lib/types.ts`, `package.json`, or another agent's files.
