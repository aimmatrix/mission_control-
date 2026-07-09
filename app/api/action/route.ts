// ─── SPINE STUB — CONTRACT LOCKED, BODY OWNED BY AGENT 3 ─────────────
// POST body: ActionRequest (lib/types.ts). Behavior:
//   action "approved" → mergePR; action "rejected" → closePR;
//   on ok, insertAudit(entry); respond ActionResult (400 on bad body).
import { NextResponse } from "next/server";
import { closePR, mergePR } from "@/lib/adapters/github";
import { insertAudit } from "@/lib/db";
import type { ActionRequest, ActionResult, AuditAction, RiskLevel } from "@/lib/types";

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];
const ACTIONS: AuditAction[] = ["approved", "rejected"];

const inFlight = new Set<number>();

function parseBody(raw: unknown): ActionRequest | null {
  if (!raw || typeof raw !== "object") return null;

  const body = raw as Record<string, unknown>;

  const prNumber = body.pr_number;
  if (typeof prNumber !== "number" || !Number.isFinite(prNumber) || prNumber <= 0) {
    return null;
  }

  const prTitle = body.pr_title;
  if (typeof prTitle !== "string" || prTitle.trim() === "") {
    return null;
  }

  const riskLevel = body.risk_level;
  if (typeof riskLevel !== "string" || !RISK_LEVELS.includes(riskLevel as RiskLevel)) {
    return null;
  }

  const score = body.score;
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return null;
  }

  const action = body.action;
  if (typeof action !== "string" || !ACTIONS.includes(action as AuditAction)) {
    return null;
  }

  let reasons: string[] = [];
  if (body.reasons === undefined || body.reasons === null) {
    reasons = [];
  } else if (!Array.isArray(body.reasons)) {
    return null;
  } else {
    reasons = body.reasons.map((r) => (typeof r === "string" ? r : String(r)));
  }

  return {
    pr_number: prNumber,
    pr_title: prTitle,
    risk_level: riskLevel as RiskLevel,
    score,
    reasons,
    action: action as AuditAction,
  };
}

async function runGitHubAction(
  action: AuditAction,
  prNumber: number,
): Promise<ActionResult> {
  try {
    return action === "approved"
      ? await mergePR(prNumber)
      : await closePR(prNumber);
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : `GitHub action failed for PR #${prNumber}`,
    };
  }
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "bad request" }, { status: 400 });
  }

  const body = parseBody(raw);
  if (!body) {
    return NextResponse.json({ ok: false, message: "bad request" }, { status: 400 });
  }

  if (inFlight.has(body.pr_number)) {
    return NextResponse.json(
      { ok: false, message: "action already in progress" },
      { status: 409 },
    );
  }

  inFlight.add(body.pr_number);
  try {
    const result = await runGitHubAction(body.action, body.pr_number);

    if (!result.ok) {
      return NextResponse.json(result, { status: 502 });
    }

    let message = result.message;
    try {
      await insertAudit({
        pr_number: body.pr_number,
        pr_title: body.pr_title,
        risk_level: body.risk_level,
        score: body.score,
        action: body.action,
        reasons: body.reasons,
      });
    } catch {
      message = `${result.message} (audit write failed)`;
    }

    return NextResponse.json({ ok: true, message }, { status: 200 });
  } finally {
    inFlight.delete(body.pr_number);
  }
}
