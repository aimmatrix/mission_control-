# Demo-day runbook — Mission Control

Timed **2-minute** judge pitch. Practice once with the live Vercel URL on the phone before you walk in.

---

## Pre-demo checklist

Do these in order, ~10 minutes before showtime:

- [ ] **Re-run the seeder** — `node scripts/seed-prs.mjs` (or the project’s documented seed command) so the supervised repo has a fresh green PR and a fresh red PR.
- [ ] **Refresh scores** — open the live app (or hit `/api/prs`) so the LLM path + `score_cache` are warm; confirm green / amber / red cards appear.
- [ ] **Phone on venue Wi-Fi** — load the production Vercel URL; kill VPN; brightness up; Do Not Disturb on.
- [ ] **GitHub tab ready** — signed in to the supervised repo’s PR list in a second browser tab (or desktop) for the merge proof.
- [ ] **Screen recording on** — start recording *before* the voice-brief clip so the whole 2:00 is one take.
- [ ] **Backup** — if live GitHub flakes, fall back to fixtures / a pre-scored queue and narrate the merge as “would land here” — never freeze on a spinner.

---

## Timed script (2:00)

### 0:00 — Voice-brief footage

Play the short founder voice-brief (or speak it live):

> “Mission Control — every agent supervised. Agents build. Humans stay in command.”

Hold the phone so judges see the dark control-room UI and the header. No scrolling yet.

### 0:20 — The problem

> “Agents get autonomy faster than we get oversight. A founder’s agent once deleted his Git history. Merge without a review layer is unsupervised write access.”

One beat. Then:

> “This is the review layer — on a phone.”

### 0:40 — Live queue

**Approve a green PR**

1. Open the queue. Point at a **green** card.
2. One-tap **Approve**.
3. Flip to GitHub — show the PR **merged** (or merge commit / closed-as-merged). Say: “Real repo. Real merge.”

**Open a red PR**

1. Back to the phone. Open a **red** card.
2. Show the **risk reasons** from the scorer.
3. Tap Approve — show the **confirmation gate**. Do *not* confirm (or reject instead). Say: “High risk never one-taps through.”

### 1:30 — `/audit`

Navigate to **`/audit`**.

> “Every approve and reject is written to Supabase. Paper trail for the software factory.”

Scroll once so judges see timestamps, risk levels, and actions.

### 1:50 — Close line

> “Built by Cursor cloud agents under a locked-spine plan — directed from a phone. Mission Control: every agent supervised.”

Stop recording. Hand the phone to a judge if they want to tap.

---

## Timing cheat sheet

| Clock | Beat |
|------:|------|
| 0:00 | Voice-brief + hero UI |
| 0:20 | Problem / origin story |
| 0:40 | Green approve → live GitHub merge |
| ~1:05 | Red PR → reasons + confirmation gate |
| 1:30 | `/audit` trail |
| 1:50 | Meta-story close |

---

## If something breaks mid-demo

| Failure | Recovery |
|---|---|
| Queue empty / scores pending | Narrate fixtures; “scores cache in Supabase — refresh path is `/api/prs`.” |
| Approve doesn’t merge | Show GitHub permissions / rate limit; still show the audit write if it landed. |
| Red gate missing | Verbally state the safety rule; open `/audit` early and close on oversight. |
| Venue Wi-Fi dies | Switch to hotspot *or* pre-recorded screen capture of the same path. |

Never apologize longer than one sentence. Return to the close line.
