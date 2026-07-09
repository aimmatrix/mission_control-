# Mission Control scripts

## `seed-prs.mjs`

Seeds four demo pull requests on the supervised target repository so Mission Control always has a mixed-risk queue to score.

### Requirements

- Node.js 18+
- `GITHUB_TOKEN` — personal access token or fine-grained token with `contents` and `pull_requests` write on the target repo
- `GITHUB_TARGET_REPO` — `owner/repo` (the repo Mission Control supervises, not this app repo)

### Usage

```bash
export GITHUB_TOKEN=ghp_...
export GITHUB_TARGET_REPO=owner/repo
node scripts/seed-prs.mjs
```

Or load from `.env.local`:

```bash
set -a && source .env.local && set +a && node scripts/seed-prs.mjs
```

### What it creates

| Branch | Risk | PR |
|--------|------|-----|
| `demo/fix-welcome-typo` | Low | Typo fix in welcome copy |
| `demo/button-padding` | Low | 4px button padding tweak |
| `demo/spending-trends` | Medium | ~150-line `SpendingTrends` component + insights screen import |
| `demo/schema-cleanup` | High | `migrations/20260709_cleanup.sql` with destructive DDL (innocent title) |

### Idempotency

The script skips a seed when:

1. An **open** PR already exists for that branch, or
2. The branch ref already exists (e.g. from a prior run)

Running twice does not create duplicates. After merging a demo PR during rehearsal, delete the merged `demo/*` branch on GitHub (or via `gh api`) before re-seeding that slot.

### Errors

API failures print `status + message` and the script continues with the next PR. A summary table of numbers, titles, and URLs is printed at the end.
