// ─── LOCKED SPINE FILE ── seed data so every UI stream renders without
// GitHub or the LLM existing. Do not edit; do not wait on the live pipeline.
import type { PullRequest } from "@/lib/types";

export const FIXTURE_PRS: PullRequest[] = [
  {
    number: 900101,
    title: "Fix typo in onboarding copy",
    body: "Corrects 'recieve' → 'receive' on the welcome screen.",
    author: "cursor-agent",
    head_sha: "fix-typo-sha",
    url: "https://github.com/demo/stash-ai/pull/101",
    updated_at: "2026-07-09T09:12:00Z",
    additions: 1,
    deletions: 1,
    changed_files: ["src/screens/Welcome.tsx"],
    diff: `--- a/src/screens/Welcome.tsx
+++ b/src/screens/Welcome.tsx
@@ -12,7 +12,7 @@
-      <Text>You will recieve a summary each week.</Text>
+      <Text>You will receive a summary each week.</Text>`,
  },
  {
    number: 900102,
    title: "Add SpendingTrends chart component",
    body: "New recharts-based trends component on the insights tab.",
    author: "cursor-agent",
    head_sha: "trends-sha",
    url: "https://github.com/demo/stash-ai/pull/102",
    updated_at: "2026-07-09T09:40:00Z",
    additions: 214,
    deletions: 3,
    changed_files: [
      "src/components/SpendingTrends.tsx",
      "src/screens/Insights.tsx",
      "package.json",
    ],
    diff: `--- /dev/null
+++ b/src/components/SpendingTrends.tsx
@@ -0,0 +1,180 @@
+import { LineChart } from "recharts";
+export function SpendingTrends({ data }: { data: TrendPoint[] }) {
+  // ... renders 6-month category spend lines
+}
--- a/package.json
+++ b/package.json
@@ -21,6 +21,7 @@
+    "recharts": "^2.12.0",`,
  },
  {
    number: 900103,
    title: "Clean up unused user columns",
    body: "Minor schema tidy-up.",
    author: "cursor-agent",
    head_sha: "migration-sha",
    url: "https://github.com/demo/stash-ai/pull/103",
    updated_at: "2026-07-09T10:05:00Z",
    additions: 22,
    deletions: 4,
    changed_files: [
      "supabase/migrations/20260709_cleanup.sql",
      "src/lib/auth.ts",
    ],
    diff: `--- /dev/null
+++ b/supabase/migrations/20260709_cleanup.sql
@@ -0,0 +1,9 @@
+ALTER TABLE users DROP COLUMN legacy_plan;
+DROP TABLE user_sessions_backup;
+ALTER POLICY "Users can view own data" ON transactions
+  USING (true);
--- a/src/lib/auth.ts
+++ b/src/lib/auth.ts
@@ -44,8 +44,6 @@
-  if (!session?.user) throw new UnauthorizedError();
-  return session.user;
+  return session?.user ?? anonymousUser();`,
  },
  {
    number: 900104,
    title: "Bump tailwind + tweak button spacing",
    body: "Dependency bump and 4px padding fix on primary buttons.",
    author: "cursor-agent",
    head_sha: "css-sha",
    url: "https://github.com/demo/stash-ai/pull/104",
    updated_at: "2026-07-09T10:22:00Z",
    additions: 6,
    deletions: 6,
    changed_files: ["package.json", "src/components/Button.tsx"],
    diff: `--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -8,7 +8,7 @@
-  className="px-3 py-2 rounded-lg"
+  className="px-4 py-2 rounded-lg"`,
  },
];
