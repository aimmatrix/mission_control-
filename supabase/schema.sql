-- ─── LOCKED SPINE FILE ── run once in the Supabase SQL editor.
-- Agent 6 implements lib/db.ts against these tables. Do not rename columns.

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  pr_number int not null,
  pr_title text not null,
  risk_level text not null check (risk_level in ('low','medium','high')),
  score int not null,
  action text not null check (action in ('approved','rejected')),
  reasons jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists score_cache (
  pr_number int not null,
  head_sha text not null,
  score jsonb not null,
  created_at timestamptz not null default now(),
  primary key (pr_number, head_sha)
);
