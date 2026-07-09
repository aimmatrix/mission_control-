"use client";

import { useState } from "react";
import type { ActionRequest, ActionResult, AuditAction, ScoredPR } from "@/lib/types";
import RiskGate from "./RiskGate";

type CardStatus = "idle" | "pending" | "approved" | "rejected" | "error";

interface PRCardProps {
  item: ScoredPR;
  onResolved: (prNumber: number) => void;
}

const RISK_LABEL: Record<string, string> = {
  low: "mc-label-low",
  medium: "mc-label-medium",
  high: "mc-label-high",
};

const RISK_ACCENT: Record<string, string> = {
  low: "border-l-[#3fb950]",
  medium: "border-l-[#d29922]",
  high: "border-l-[#f85149]",
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
      window.setTimeout(() => onResolved(pr.number), 320);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Network error");
    }
  }

  const label = RISK_LABEL[score.risk_level] ?? "mc-label border-ctrl-line text-ctrl-dim";
  const accent = RISK_ACCENT[score.risk_level] ?? "border-l-ctrl-line";

  return (
    <li
      className={`overflow-hidden transition-all duration-200 ease-out ${
        exiting ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
      }`}
    >
      <article
        className={`mc-card border-l-4 ${accent} transition-opacity ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={label}>{score.risk_level}</span>
                <span className="mc-mono text-xs tabular-nums text-ctrl-dim">
                  score {score.score}
                </span>
                {cached && (
                  <span className="mc-mono text-xs text-ctrl-dim">cached</span>
                )}
              </div>
              <h3 className="mt-2 text-[15px] font-semibold leading-snug text-ctrl-fg">
                <span className="mc-mono font-normal text-ctrl-dim">
                  #{pr.number}
                </span>{" "}
                {pr.title}
              </h3>
              <p className="mt-1 text-xs text-ctrl-dim">
                {pr.author} ·{" "}
                <span className="text-[#3fb950]">+{pr.additions}</span>{" "}
                <span className="text-[#f85149]">−{pr.deletions}</span>
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ctrl-dim">
            {score.one_line_summary}
          </p>

          {score.risk_level === "medium" && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mc-btn-secondary mt-3 w-full justify-between"
              aria-expanded={expanded}
            >
              <span>{expanded ? "Hide details" : "Show details"}</span>
              <span className="text-ctrl-dim" aria-hidden>
                {expanded ? "▴" : "▾"}
              </span>
            </button>
          )}

          {(score.risk_level === "high" ||
            (score.risk_level === "medium" && expanded)) && (
            <div className="mt-3 space-y-3 border-t border-ctrl-line pt-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-ctrl-dim">
                  Reasons
                </p>
                <ul className="space-y-1">
                  {score.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="text-sm leading-snug text-ctrl-fg"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-ctrl-dim">
                  Blast radius
                </p>
                <p className="text-sm text-ctrl-fg">{score.blast_radius}</p>
              </div>

              {pr.changed_files.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ctrl-dim">
                    Changed files
                  </p>
                  <ul className="space-y-0.5">
                    {pr.changed_files.map((file) => (
                      <li
                        key={file}
                        className="mc-mono truncate text-xs text-ctrl-dim"
                      >
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {score.risk_level === "low" && score.reasons.length > 0 && (
            <ul className="mt-3 space-y-0.5">
              {score.reasons.map((reason) => (
                <li key={reason} className="text-xs text-ctrl-dim">
                  {reason}
                </li>
              ))}
            </ul>
          )}

          {errorMsg && (
            <p className="mt-3 rounded-md border border-[#da3633]/50 bg-[#da3633]/10 px-3 py-2 text-sm text-[#f85149]">
              {errorMsg}
            </p>
          )}

          {resolved && (
            <p
              className={`mt-3 text-sm font-medium ${
                status === "approved" ? "text-[#3fb950]" : "text-ctrl-dim"
              }`}
            >
              {status === "approved" ? "Approved" : "Rejected"}
            </p>
          )}

          {!resolved && (
            <>
              {score.risk_level === "high" ? (
                <RiskGate
                  disabled={inFlight}
                  onApprove={() => submit("approved")}
                  onReject={() => submit("rejected")}
                />
              ) : (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={inFlight}
                    onClick={() => submit("approved")}
                    className="mc-btn-primary flex-1"
                  >
                    {inFlight ? "Working…" : "Approve"}
                  </button>
                  <button
                    type="button"
                    disabled={inFlight}
                    onClick={() => submit("rejected")}
                    className="mc-btn-secondary flex-1"
                  >
                    Reject
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </article>
    </li>
  );
}
