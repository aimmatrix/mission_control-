"use client";

import { useState } from "react";

interface RiskGateProps {
  disabled?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function RiskGate({ disabled, onApprove, onReject }: RiskGateProps) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="mt-4 space-y-3">
      <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-md border border-ctrl-line bg-[#0d1117] px-3 py-3">
        <input
          type="checkbox"
          checked={understood}
          disabled={disabled}
          onChange={(e) => setUnderstood(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-ctrl-line accent-[#f85149]"
        />
        <span className="text-sm leading-snug text-ctrl-fg">
          I understand the risk and want to approve this pull request
        </span>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={disabled || !understood}
          onClick={onApprove}
          className="mc-btn-danger flex-1"
        >
          Approve high-risk PR
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onReject}
          className="mc-btn-secondary flex-1"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
