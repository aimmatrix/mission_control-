#!/usr/bin/env node
/**
 * Seed demo PRs on GITHUB_TARGET_REPO for Mission Control rehearsals.
 * Node 18+, zero npm deps. Idempotent — skips branches/PRs that already exist.
 */

const API_VERSION = "2022-11-28";

const token = process.env.GITHUB_TOKEN;
const targetRepo = process.env.GITHUB_TARGET_REPO;

if (!token || !targetRepo) {
  console.error("Missing env: GITHUB_TOKEN and GITHUB_TARGET_REPO (owner/repo) are required.");
  process.exit(1);
}

const [owner, repo] = targetRepo.split("/");
if (!owner || !repo) {
  console.error(`Invalid GITHUB_TARGET_REPO: "${targetRepo}" (expected owner/repo)`);
  process.exit(1);
}

const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

function headers(extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": API_VERSION,
    Accept: "application/vnd.github+json",
    ...extra,
  };
}

async function readErrorMessage(res) {
  try {
    const data = await res.json();
    if (data?.message) return data.message;
  } catch {
    // ignore
  }
  return res.statusText || `HTTP ${res.status}`;
}

async function ghFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: headers(options.headers),
  });
  if (!res.ok) {
    const message = await readErrorMessage(res);
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

async function getDefaultBranchHead() {
  const meta = await ghFetch("");
  const defaultBranch = meta.default_branch;
  const ref = await ghFetch(`/git/ref/heads/${defaultBranch}`);
  return { defaultBranch, headSha: ref.object.sha };
}

async function branchExists(branch) {
  try {
    await ghFetch(`/git/ref/heads/${encodeURIComponent(branch)}`);
    return true;
  } catch (err) {
    if (err.status === 404) return false;
    throw err;
  }
}

async function findOpenPr(branch) {
  const pulls = await ghFetch(
    `/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}`,
  );
  return pulls[0] ?? null;
}

async function getFileContent(path, ref) {
  try {
    const data = await ghFetch(
      `/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`,
    );
    if (Array.isArray(data)) return null;
    const text = Buffer.from(data.content, data.encoding ?? "base64").toString("utf8");
    return { text, sha: data.sha };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function putFile(path, branch, content, message, existingSha) {
  const body = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch,
  };
  if (existingSha) body.sha = existingSha;
  await ghFetch(`/contents/${path.split("/").map(encodeURIComponent).join("/")}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function spendingTrendsComponent() {
  return `import { useMemo, useState } from "react";

export type TrendPoint = {
  month: string;
  groceries: number;
  dining: number;
  transport: number;
  shopping: number;
};

export type SpendingTrendsProps = {
  data: TrendPoint[];
  currency?: string;
  highlightCategory?: keyof Omit<TrendPoint, "month">;
  loading?: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  groceries: "#34d399",
  dining: "#fbbf24",
  transport: "#60a5fa",
  shopping: "#f472b6",
};

const CATEGORY_LABELS: Record<string, string> = {
  groceries: "Groceries",
  dining: "Dining out",
  transport: "Transport",
  shopping: "Shopping",
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function monthLabel(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleString("en-US", { month: "short" });
}

function buildPolyline(
  data: TrendPoint[],
  key: keyof Omit<TrendPoint, "month">,
  maxValue: number,
  width: number,
  height: number,
  padding: number,
) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return data
    .map((row, index) => {
      const x =
        padding +
        (data.length <= 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
      const y = padding + innerHeight - (row[key] / maxValue) * innerHeight;
      return \`\${x},\${y}\`;
    })
    .join(" ");
}

function computeDelta(data: TrendPoint[], key: keyof Omit<TrendPoint, "month">) {
  if (data.length < 2) return 0;
  const first = data[0][key];
  const last = data[data.length - 1][key];
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
}

export function SpendingTrends({
  data,
  currency = "USD",
  highlightCategory,
  loading = false,
}: SpendingTrendsProps) {
  const categories = useMemo(
    () => ["groceries", "dining", "transport", "shopping"] as const,
    [],
  );
  const [activeCategory, setActiveCategory] = useState<
    keyof Omit<TrendPoint, "month"> | null
  >(highlightCategory ?? null);

  const totals = useMemo(() => {
    return categories.map((key) => ({
      key,
      total: data.reduce((sum, row) => sum + row[key], 0),
      delta: computeDelta(data, key),
    }));
  }, [categories, data]);

  const maxValue = useMemo(() => {
    let max = 0;
    for (const row of data) {
      for (const key of categories) {
        max = Math.max(max, row[key]);
      }
    }
    return max || 1;
  }, [categories, data]);

  const width = 360;
  const height = 180;
  const padding = 28;

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="h-40 animate-pulse rounded-lg bg-slate-900" />
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
        No trend data yet.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Insights</p>
          <h2 className="text-lg font-semibold text-slate-100">Spending trends</h2>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-slate-400">
          {data.length} months
        </span>
      </header>

      <svg
        viewBox={\`0 0 \${width} \${height}\`}
        className="w-full"
        role="img"
        aria-label="Category spending trends over time"
      >
        {categories.map((key) => {
          const points = buildPolyline(data, key, maxValue, width, height, padding);
          const active = !activeCategory || activeCategory === key;
          return (
            <polyline
              key={key}
              fill="none"
              stroke={CATEGORY_COLORS[key]}
              strokeWidth={active ? 2.5 : 1.5}
              opacity={active ? 1 : 0.35}
              points={points}
            />
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[key] }}
            />
            {CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {totals.map(({ key, total, delta }) => (
          <li
            key={key}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2"
          >
            <span className="text-slate-400">{CATEGORY_LABELS[key]}</span>
            <div className="text-right">
              <span className="block font-medium text-slate-100">
                {formatCurrency(total, currency)}
              </span>
              <span className={delta >= 0 ? "text-amber-400" : "text-emerald-400"}>
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(1)}%
              </span>
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-3 flex gap-2 overflow-x-auto text-xs text-slate-500">
        {data.map((row) => (
          <span key={row.month} className="rounded bg-slate-900 px-2 py-1">
            {monthLabel(row.month)}
          </span>
        ))}
      </footer>
    </section>
  );
}
`;
}

function defaultWelcomeScreen() {
  return `export function Welcome() {
  return (
    <main className="p-6">
      <h1>Welcome to Stash</h1>
      <p>You will receive a summary each week.</p>
    </main>
  );
}
`;
}

function defaultButtonComponent() {
  return `type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
    >
      {children}
    </button>
  );
}
`;
}

function defaultInsightsScreen() {
  return `import { SpendingTrends } from "../components/SpendingTrends";

const SAMPLE_TRENDS = [
  { month: "2026-01", groceries: 420, dining: 180, transport: 95, shopping: 140 },
  { month: "2026-02", groceries: 390, dining: 210, transport: 110, shopping: 160 },
  { month: "2026-03", groceries: 455, dining: 195, transport: 88, shopping: 125 },
];

export function Insights() {
  return (
    <main className="p-6 space-y-6">
      <h1>Insights</h1>
      <SpendingTrends data={SAMPLE_TRENDS} />
    </main>
  );
}
`;
}

const SEEDS = [
  {
    branch: "demo/fix-welcome-typo",
    title: "Fix typo in onboarding copy",
    body: [
      "## Summary",
      "Corrects a spelling mistake on the welcome screen.",
      "",
      "## Agent notes",
      "- Single-line copy change in `src/screens/Welcome.tsx`",
      "- No logic or API surface touched",
      "",
      "Generated by Mission Control demo seeder.",
    ].join("\n"),
    async files(defaultBranch) {
      const path = "src/screens/Welcome.tsx";
      const existing = await getFileContent(path, defaultBranch);
      let content = existing?.text ?? defaultWelcomeScreen();
      if (content.includes("recieve")) {
        content = content.replaceAll("recieve", "receive");
      } else if (!content.includes("receive")) {
        content = content.replace(
          "</main>",
          '      <p>You will receive a summary each week.</p>\n    </main>',
        );
      }
      return [{ path, content, message: "fix: correct welcome screen typo" }];
    },
  },
  {
    branch: "demo/button-padding",
    title: "Bump tailwind + tweak button spacing",
    body: [
      "## Summary",
      "Dependency bump and 4px padding fix on primary buttons.",
      "",
      "## Agent notes",
      "- Adjusts horizontal padding on `Button` from `px-3` to `px-4`",
      "- Cosmetic only; no behavior change",
      "",
      "Generated by Mission Control demo seeder.",
    ].join("\n"),
    async files(defaultBranch) {
      const path = "src/components/Button.tsx";
      const existing = await getFileContent(path, defaultBranch);
      let content = existing?.text ?? defaultButtonComponent();
      if (content.includes("px-3")) {
        content = content.replaceAll("px-3", "px-4");
      } else if (!content.includes("px-4")) {
        content = content.replace(
          'className="',
          'className="px-4 ',
        );
      }
      return [{ path, content, message: "style: increase primary button horizontal padding" }];
    },
  },
  {
    branch: "demo/spending-trends",
    title: "Add SpendingTrends chart component",
    body: [
      "## Summary",
      "New trends component on the insights tab.",
      "",
      "## Agent notes",
      "- Adds `src/components/SpendingTrends.tsx`",
      "- Wires component into `src/screens/Insights.tsx`",
      "- UI-only feature work",
      "",
      "Generated by Mission Control demo seeder.",
    ].join("\n"),
    async files(defaultBranch) {
      const componentPath = "src/components/SpendingTrends.tsx";
      const screenPath = "src/screens/Insights.tsx";
      const existingScreen = await getFileContent(screenPath, defaultBranch);
      let screenContent = existingScreen?.text ?? defaultInsightsScreen();

      if (!screenContent.includes("SpendingTrends")) {
        if (screenContent.includes('from "')) {
          screenContent = `import { SpendingTrends } from "../components/SpendingTrends";\n${screenContent}`;
        } else {
          screenContent = defaultInsightsScreen();
        }
      }

      if (
        screenContent.includes("export function Insights") &&
        !screenContent.includes("<SpendingTrends")
      ) {
        const sampleData = `const SAMPLE_TRENDS = [
  { month: "2026-01", groceries: 420, dining: 180, transport: 95, shopping: 140 },
  { month: "2026-02", groceries: 390, dining: 210, transport: 110, shopping: 160 },
  { month: "2026-03", groceries: 455, dining: 195, transport: 88, shopping: 125 },
];
`;
        screenContent = screenContent.replace(
          /export function Insights\(\) \{\n/,
          `${sampleData}\nexport function Insights() {\n`,
        );
        screenContent = screenContent.replace(
          /(<main[^>]*>)/,
          "$1\n      <SpendingTrends data={SAMPLE_TRENDS} />",
        );
      }

      return [
        {
          path: componentPath,
          content: spendingTrendsComponent(),
          message: "feat: add SpendingTrends chart component",
        },
        {
          path: screenPath,
          content: screenContent,
          message: "feat: render SpendingTrends on insights screen",
        },
      ];
    },
  },
  {
    branch: "demo/schema-cleanup",
    title: "Clean up unused user columns",
    body: [
      "## Summary",
      "Minor schema tidy-up.",
      "",
      "## Agent notes",
      "- Drops unused legacy columns and backup tables",
      "- Intended as housekeeping before the next release",
      "",
      "Generated by Mission Control demo seeder.",
    ].join("\n"),
    async files() {
      const path = "migrations/20260709_cleanup.sql";
      const content = `-- Remove unused legacy plan column from users
ALTER TABLE users DROP COLUMN legacy_plan;

-- Drop stale backup table no longer referenced in app code
DROP TABLE user_sessions_backup;

-- Relax policy predicate while cleaning up related auth paths
ALTER POLICY "Users can view own data" ON transactions
  USING (true);
`;
      return [{ path, content, message: "chore: clean up unused user columns" }];
    },
  },
];

async function seedOne(seed, defaultBranch, headSha) {
  const existingPr = await findOpenPr(seed.branch);
  if (existingPr) {
    return {
      status: "exists",
      number: existingPr.number,
      title: existingPr.title,
      url: existingPr.html_url,
    };
  }

  if (await branchExists(seed.branch)) {
    return {
      status: "exists",
      number: "—",
      title: seed.title,
      url: `(branch ${seed.branch} already exists, no open PR)`,
    };
  }

  await ghFetch("/git/refs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ref: `refs/heads/${seed.branch}`,
      sha: headSha,
    }),
  });

  const fileSpecs = await seed.files(defaultBranch);
  for (const file of fileSpecs) {
    const existing = await getFileContent(file.path, seed.branch);
    await putFile(file.path, seed.branch, file.content, file.message, existing?.sha);
  }

  const pr = await ghFetch("/pulls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: seed.title,
      head: seed.branch,
      base: defaultBranch,
      body: seed.body,
    }),
  });

  return {
    status: "created",
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
  };
}

function printSummary(results) {
  console.log("\n── Seed summary ─────────────────────────────────────────────");
  console.log(" #  │ Title                              │ URL");
  console.log("────┼────────────────────────────────────┼──────────────────────────");
  for (const row of results) {
    const num = String(row.number).padStart(2, " ");
    const title = row.title.length > 34 ? `${row.title.slice(0, 31)}...` : row.title.padEnd(34, " ");
    const status = row.status === "exists" ? "already exists" : "created";
    console.log(`${num} │ ${title} │ ${row.url}`);
    if (row.status === "exists") {
      console.log(`    │ (${status})`);
    }
  }
  console.log("──────────────────────────────────────────────────────────────\n");
}

async function main() {
  console.log(`Seeding demo PRs on ${owner}/${repo} ...\n`);

  let defaultBranch;
  let headSha;
  try {
    ({ defaultBranch, headSha } = await getDefaultBranchHead());
    console.log(`Default branch: ${defaultBranch} @ ${headSha.slice(0, 7)}\n`);
  } catch (err) {
    console.error(`Failed to read repository: ${err.status ?? "?"} ${err.message}`);
    process.exit(1);
  }

  const results = [];

  for (const seed of SEEDS) {
    process.stdout.write(`• ${seed.branch} ... `);
    try {
      const result = await seedOne(seed, defaultBranch, headSha);
      results.push(result);
      if (result.status === "exists") {
        console.log("already exists");
      } else {
        console.log(`created PR #${result.number}`);
      }
    } catch (err) {
      console.log(`error ${err.status ?? "?"}: ${err.message}`);
      results.push({
        status: "error",
        number: "—",
        title: seed.title,
        url: err.message,
      });
    }
  }

  printSummary(results);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
