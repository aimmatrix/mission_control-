"use client";

import { useState } from "react";
import type { AuditEntry, RiskLevel } from "@/lib/types";
import { relativeTime } from "./relativeTime";

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "mc-label-low",
  medium: "mc-label-medium",
  high: "mc-label-high",
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
    <li>
      <article>
        <button
          type="button"
          onClick={() => hasReasons && setOpen((v) => !v)}
          disabled={!hasReasons}
          className={`flex w-full flex-col gap-2 px-4 py-3.5 text-left ${
            hasReasons ? "cursor-pointer hover:bg-[#1c2128]" : "cursor-default"
          }`}
          aria-expanded={hasReasons ? open : undefined}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={RISK_LABEL[entry.risk_level]}>
                  {entry.risk_level}
                </span>
                <span className="mc-mono text-xs tabular-nums text-ctrl-dim">
                  score {entry.score}
                </span>
                <span
                  className={`text-xs font-medium ${
                    approved ? "text-[#3fb950]" : "text-ctrl-dim"
                  }`}
                >
                  {approved ? "Approved" : "Rejected"}
                </span>
              </div>
              <h3 className="mt-1.5 text-sm font-semibold leading-snug text-ctrl-fg">
                <span className="mc-mono font-normal text-ctrl-dim">
                  #{entry.pr_number}
                </span>{" "}
                {entry.pr_title}
              </h3>
            </div>
            <time
              dateTime={entry.created_at}
              className="mc-mono shrink-0 text-xs tabular-nums text-ctrl-dim"
              title={new Date(entry.created_at).toLocaleString()}
            >
              {relativeTime(entry.created_at, now)}
            </time>
          </div>

          {hasReasons && (
            <span className="text-xs text-ctrl-dim">
              {open ? "Hide reasons" : "Show reasons"}
            </span>
          )}
        </button>

        {open && hasReasons && (
          <div className="border-t border-ctrl-line bg-[#0d1117] px-4 py-3">
            <p className="mb-1.5 text-xs font-medium text-ctrl-dim">Reasons</p>
            <ul className="space-y-1">
              {entry.reasons.map((reason) => (
                <li key={reason} className="text-sm leading-snug text-ctrl-fg">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </li>
  );
}
