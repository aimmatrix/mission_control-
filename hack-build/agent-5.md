# Agent 5 — Landing / hero section

**Product (one line):** Mission Control — a mobile-first web app that risk-scores PRs from autonomous coding agents and lets a human approve/reject them from a phone.
**Your mission:** the marketing top section above the live queue. It sets the story for the judges in the first 5 seconds.

## Files you OWN (create/edit only these)
- `components/landing/**` (replace the stub `Landing.tsx`)

## NEVER touch
- `app/**` (the shell already mounts you), `components/queue/**`, `components/audit/**`, `lib/**`, `fixtures/**`, `lib/types.ts`, `package.json`, `tailwind.config.ts`

## Contract (locked)
- `Landing.tsx`: **default export, no props.** `app/page.tsx` renders `<Landing />` directly above the queue section (whose anchor is `#queue`).

## Content & UX
- Hero: problem statement — "Coding agents are fast. Unsupervised merges are how you lose a weekend of work."
- One-line origin story: built by a solo founder whose agent once deleted his Git history.
- Three feature cards: **Risk-scored diffs** · **One-tap safe approvals** · **Full audit trail** — short one-liner each.
- A "Live queue ↓" button that smooth-scrolls to `#queue` (plain `<a href="#queue">` is fine).
- Dark, calm, control-room aesthetic with the existing tokens (`bg-ctrl-panel`, `border-ctrl-line`, `text-ctrl-dim`, `text-risk-low/medium/high`). Subtle green "systems nominal" accents welcome; no heavy animation libraries (**no new deps**).
- Mobile-first: it must look great at 390px; keep the hero short enough that the queue is one thumb-scroll away.

## Build against fallbacks
No data needed — pure presentational. `npm run dev` and build in isolation.

## Definition of Done
- Landing renders above the queue on `/`, all three cards present, CTA scrolls to the queue.
- Smoke test: `npm run build` passes; check `localhost:3000` at 390px width.

## If you need a change to a locked/shared file
STOP and ask the human. Do not edit `app/page.tsx`, `lib/types.ts`, `package.json`, or another agent's files.
