// Renders a unified diff with add/remove coloring, and flags the specific
// lines that drove the risk score (same pattern family as the scorer's
// offline heuristic in lib/adapters/llm.ts) so the risky area is visible,
// not just described in prose.
const RISK_PATTERNS: RegExp[] = [
  /\bDROP\s+(TABLE|COLUMN|POLICY)\b/i,
  /\b(TRUNCATE|DELETE\s+FROM)\b/i,
  /\bALTER\s+POLICY\b|\bUSING\s*\(\s*true\s*\)/i,
  /rm\s+-rf|force-push|--force\b/i,
  /\.env\b|SECRET|API_KEY/i,
  /\bauth\b|\bsession\b|\bpermission\b|\bpayment\b/i,
];

function isRiskyLine(line: string): boolean {
  return RISK_PATTERNS.some((re) => re.test(line));
}

type LineKind = "add" | "del" | "hunk" | "meta" | "context";

function kindOf(line: string): LineKind {
  if (line.startsWith("@@")) return "hunk";
  if (line.startsWith("+++") || line.startsWith("---")) return "meta";
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "del";
  return "context";
}

const LINE_STYLE: Record<LineKind, string> = {
  add: "bg-risk-low/10 text-risk-low",
  del: "bg-risk-high/10 text-risk-high",
  hunk: "text-ctrl-dim italic",
  meta: "text-ctrl-dim font-medium",
  context: "text-ctrl-fg/80",
};

interface DiffViewerProps {
  diff: string;
}

export default function DiffViewer({ diff }: DiffViewerProps) {
  const lines = diff.split("\n");
  const riskyCount = lines.filter(isRiskyLine).length;

  return (
    <div className="overflow-hidden rounded-lg border border-ctrl-line">
      <div className="flex items-center justify-between border-b border-ctrl-line bg-ctrl-bg px-3 py-1.5">
        <span className="mc-mono text-[11px] text-ctrl-dim">diff</span>
        {riskyCount > 0 && (
          <span className="mc-mono text-[11px] text-risk-high">
            {riskyCount} risky line{riskyCount > 1 ? "s" : ""} flagged
          </span>
        )}
      </div>
      <div className="mc-mono max-h-80 overflow-auto text-xs leading-relaxed">
        {lines.map((line, i) => {
          const kind = kindOf(line);
          const risky = isRiskyLine(line);
          return (
            <div
              key={i}
              className={`whitespace-pre border-l-2 px-3 py-0.5 ${LINE_STYLE[kind]} ${
                risky ? "border-risk-high bg-risk-high/20" : "border-transparent"
              }`}
            >
              {line || " "}
            </div>
          );
        })}
      </div>
    </div>
  );
}
