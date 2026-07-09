"use client";

import { useState } from "react";
import type { ActionRequest, ActionResult, AuditAction, ScoredPR } from "@/lib/types";
import RiskGate from "./RiskGate";

type CardStatus = "idle" | "pending" | "approved" | "rejected" | "error";

interface PRCardProps {
  item: ScoredPR;
  onResolved: (prNumber: number) => void;
}

const RISK_BORDER: Record<string, string> = {
  low: "border-risk-low",
  medium: "border-risk-medium",
  high: "border-risk-high",
};

const RISK_TEXT: Record<string, string> = {
  low: "text-risk-low",
  medium: "text-risk-medium",
  high: "text-risk-high",
};

const RISK_BADGE_BG: Record<string, string> = {
  low: "bg-risk-low/15 text-risk-low",
  medium: "bg-risk-medium/15 text-risk-medium",
  high: "bg-risk-high/15 text-risk-high",
};

export default function PRCard({ item, onResolved }: PRCardProps) {
  const { pr, score, cached } = item;
  const [expanded, setExpanded] = useState(score.risk_level === "high");
  const [status, setStatus] = useState<CardStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const inFlight = status === "pending";
  const resolved = status === "approved" || status === "rejected";

  async function submit(action: AuditAction) {
    if (inFlight || resolved) return;

    setStatus("pending");
    setErrorMsg(null);

    const body: ActionRequest = {
      pr_number: pr.number,
      pr_title: pr.title,
      risk_level: score.risk_level,
      score: score.score,
      reasons: score.reasons,
      action,
    };

    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ActionResult;

      if (!data.ok) {
        setStatus("error");
        setErrorMsg(data.message || "Action failed");
        return;
      }

      setStatus(action);
      setExiting(true);
      window.setTimeout(() => onResolved(pr.number), 420);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Network error");
    }
  }

  const border = RISK_BORDER[score.risk_level] ?? "border-ctrl-line";
  const riskText = RISK_TEXT[score.risk_level] ?? "text-ctrl-dim";
  const badge = RISK_BADGE_BG[score.risk_level] ?? "bg-ctrl-line text-ctrl-dim";

  return (
    <li
      className={`overflow-hidden rounded-xl border bg-ctrl-panel transition-all duration-300 ease-out ${border} ${
        exiting
          ? "max-h-0 -translate-x-4 scale-[0.98] opacity-0 border-transparent py-0"
          : "max-h-[2000px] translate-x-0 scale-100 opacity-100"
      }`}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${badge}`}>
            {score.risk_level}
          </span>
          <span className={`font-mono text-sm tabular-nums ${riskText}`}>{score.score}</span>
          {cached && (
            <span className="text-[11px] uppercase tracking-wider text-ctrl-dim/70">cached</span>
          )}
        </div>

        <h3 className="mt-2 text-base font-medium leading-snug text-ctrl-fg">
          <span className="text-ctrl-dim">#{pr.number}</span> {pr.title}
        </h3>
        <p className="mt-1 text-xs text-ctrl-dim">
          {pr.author} · +{pr.additions} −{pr.deletions}
        </p>

        <p className="mt-3 text-sm leading-relaxed text-ctrl-dim">{score.one_line_summary}</p>

        {score.risk_level === "medium" && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 flex min-h-[44px] w-full items-center justify-between rounded-lg border border-ctrl-line px-3 text-sm text-ctrl-dim"
            aria-expanded={expanded}
          >
            <span>{expanded ? "Hide details" : "Show details"}</span>
            <span className="text-risk-medium" aria-hidden>
              {expanded ? "▴" : "▾"}
            </span>
          </button>
        )}

        {(score.risk_level === "high" || (score.risk_level === "medium" && expanded)) && (
          <div className="mt-3 space-y-3 border-t border-ctrl-line pt-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ctrl-dim">
                Reasons
              </p>
              <ul className="space-y-1.5">
                {score.reasons.map((reason) => (
                  <li
                    key={reason}
                    className={`flex gap-2 text-sm leading-snug ${
                      score.risk_level === "high" ? "text-risk-high" : "text-ctrl-fg"
                    }`}
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ctrl-dim">
                Blast radius
              </p>
              <p className="text-sm text-ctrl-fg">{score.blast_radius}</p>
            </div>

            {pr.changed_files.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ctrl-dim">
                  Changed files
                </p>
                <ul className="space-y-1">
                  {pr.changed_files.map((file) => (
                    <li key={file} className="truncate font-mono text-xs text-ctrl-dim">
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {score.risk_level === "low" && score.reasons.length > 0 && (
          <ul className="mt-3 space-y-1">
            {score.reasons.map((reason) => (
              <li key={reason} className="text-xs text-ctrl-dim">
                · {reason}
              </li>
            ))}
          </ul>
        )}

        {errorMsg && (
          <p className="mt-3 rounded-lg border border-risk-high/40 bg-risk-high/10 px-3 py-2 text-sm text-risk-high">
            {errorMsg}
          </p>
        )}

        {resolved && (
          <p
            className={`mt-3 text-sm font-medium ${
              status === "approved" ? "text-risk-low" : "text-ctrl-dim"
            }`}
          >
            {status === "approved" ? "Approved" : "Rejected"}
          </p>
        )}

        {!resolved &&
          (score.risk_level === "high" ? (
            <RiskGate
              disabled={inFlight}
              onApprove={() => submit("approved")}
              onReject={() => submit("rejected")}
            />
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={inFlight}
                onClick={() => submit("approved")}
                className={`min-h-[48px] w-full rounded-lg px-4 text-base font-semibold text-ctrl-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${
                  score.risk_level === "medium" ? "bg-risk-medium" : "bg-risk-low"
                }`}
              >
                {inFlight ? "Working…" : "Approve"}
              </button>
              <button
                type="button"
                disabled={inFlight}
                onClick={() => submit("rejected")}
                className="min-h-[44px] w-full rounded-lg border border-ctrl-line px-4 text-sm font-medium text-ctrl-dim transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          ))}
      </div>
    </li>
  );
}
