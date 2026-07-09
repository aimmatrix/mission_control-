# Mission Control — Agent Context

Mission Control is a mobile-first web app for safely supervising autonomous coding agents from a phone.

## Stack

- Next.js 14 App Router + Tailwind
- Vercel
- Supabase
- GitHub REST API
- LLM (Anthropic or Grok)

## Environment variables

Already configured on Vercel (never invent names):

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | GitHub API auth for PR fetch / approve / reject |
| `GITHUB_TARGET_REPO` | Repo to supervise (`owner/repo`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side) |
| `LLM_API_KEY` | Anthropic or Grok API key for risk scoring |

## Core flow

1. Fetch open PRs from `GITHUB_TARGET_REPO`
2. LLM risk-score each PR (prompt: `prompts/risk-scorer.md`)
3. Mobile review queue — green / amber / red
4. Approve or reject via GitHub + write `audit_log` in Supabase
5. `/audit` page for history

## Design

- Dark control-room aesthetic
- Big touch targets
- Risk color as primary language
- Header: **"Mission Control — every agent supervised."**
- No auth — single-operator demo

## Constraints

- Ship fetch → score → display first
- Cache scores in Supabase
- Handle GitHub rate limits
- Never invent env var names
