"use client";

import { useState } from "react";

interface RiskGateProps {
  disabled?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * High-risk confirmation gate. Approve stays locked until the operator
 * explicitly acknowledges the risk via checkbox.
 */
export default function RiskGate({ disabled, onApprove, onReject }: RiskGateProps) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="mt-4 space-y-3">
      <label className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-lg border border-risk-high/40 bg-risk-high/10 px-3 py-3">
        <input
          type="checkbox"
          checked={understood}
          disabled={disabled}
          onChange={(e) => setUnderstood(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-risk-high"
        />
        <span className="text-sm leading-snug text-ctrl-fg">
          I understand the risk and still want to approve this PR
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled || !understood}
          onClick={onApprove}
          className="min-h-[48px] w-full rounded-lg bg-risk-high px-4 text-base font-semibold text-ctrl-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onReject}
          className="min-h-[44px] w-full rounded-lg border border-ctrl-line px-4 text-sm font-medium text-ctrl-dim transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
