"use client";

import { useState } from "react";
import type { AuditEntry, RiskLevel } from "@/lib/types";
import { relativeTime } from "./relativeTime";

const RISK_DOT: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

const RISK_BADGE: Record<RiskLevel, string> = {
  low: "bg-risk-low/15 text-risk-low",
  medium: "bg-risk-medium/15 text-risk-medium",
  high: "bg-risk-high/15 text-risk-high",
};

const RISK_TEXT: Record<RiskLevel, string> = {
  low: "text-risk-low",
  medium: "text-risk-medium",
  high: "text-risk-high",
};

interface AuditRowProps {
  entry: AuditEntry;
  now: number;
}

export default function AuditRow({ entry, now }: AuditRowProps) {
  const [open, setOpen] = useState(false);
  const approved = entry.action === "approved";
  const hasReasons = entry.reasons.length > 0;

  return (
    <li className="relative pl-6">
      {/* Timeline rail + risk dot */}
      <span
        className={`absolute left-0 top-5 h-2.5 w-2.5 rounded-full ring-4 ring-ctrl-bg ${RISK_DOT[entry.risk_level]}`}
        aria-hidden
      />

      <article className="rounded-xl border border-ctrl-line bg-ctrl-panel">
        <button
          type="button"
          onClick={() => hasReasons && setOpen((v) => !v)}
          disabled={!hasReasons}
          className={`flex w-full flex-col gap-2 px-4 py-3.5 text-left ${
            hasReasons ? "cursor-pointer" : "cursor-default"
          }`}
          aria-expanded={hasReasons ? open : undefined}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${RISK_BADGE[entry.risk_level]}`}
                >
                  {entry.risk_level}
                </span>
                <span
                  className={`font-mono text-xs tabular-nums ${RISK_TEXT[entry.risk_level]}`}
                >
                  {entry.score}
                </span>
              </div>
              <h3 className="mt-1.5 text-[15px] font-medium leading-snug text-ctrl-fg">
                <span className="text-ctrl-dim">#{entry.pr_number}</span>{" "}
                {entry.pr_title}
              </h3>
            </div>
            <time
              dateTime={entry.created_at}
              className="shrink-0 pt-0.5 font-mono text-[11px] tabular-nums text-ctrl-dim"
              title={new Date(entry.created_at).toLocaleString()}
            >
              {relativeTime(entry.created_at, now)}
            </time>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-sm font-medium ${
                approved ? "text-risk-low" : "text-ctrl-dim"
              }`}
            >
              {approved ? (
                <>
                  <span aria-hidden>✓ </span>approved · merged
                </>
              ) : (
                <>
                  <span aria-hidden>✕ </span>rejected · closed
                </>
              )}
            </p>
            {hasReasons && (
              <span className="text-xs text-ctrl-dim" aria-hidden>
                {open ? "▴ reasons" : "▾ reasons"}
              </span>
            )}
          </div>
        </button>

        {open && hasReasons && (
          <div className="border-t border-ctrl-line px-4 py-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ctrl-dim">
              Reasons
            </p>
            <ul className="space-y-1.5">
              {entry.reasons.map((reason) => (
                <li
                  key={reason}
                  className="flex gap-2 text-sm leading-snug text-ctrl-fg"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${RISK_DOT[entry.risk_level]}`}
                    aria-hidden
                  />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </li>
  );
}
