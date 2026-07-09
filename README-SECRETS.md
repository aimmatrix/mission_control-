# Secrets & environment variables

Paste real values into **Vercel** project settings and local **`.env.local`** only. Never commit real secrets.

| Variable | Purpose | Placeholder |
|---|---|---|
| `GITHUB_TOKEN` | GitHub API auth for PR fetch / approve / reject | `ghp_xxxxxxxx` |
| `GITHUB_TARGET_REPO` | Repo to supervise (`owner/repo`) | `owner/repo` |
| `SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side) | `eyJhbGciOi...` |
| `LLM_API_KEY` | Anthropic or Grok API key for risk scoring | `sk-ant-...` or `xai-...` |

Copy `.env.example` → `.env.local` and fill in values for local development.
