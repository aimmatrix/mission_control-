// ─── SPINE STUB — CONTRACT LOCKED, BODY OWNED BY AGENT 3 ─────────────
// POST body: ActionRequest (lib/types.ts). Behavior:
//   action "approved" → mergePR; action "rejected" → closePR;
//   on ok, insertAudit(entry); respond ActionResult (400 on bad body).
import { NextResponse } from "next/server";
import { closePR, mergePR } from "@/lib/adapters/github";
import { insertAudit } from "@/lib/db";
import type { ActionRequest } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as ActionRequest;
  if (!body?.pr_number || !["approved", "rejected"].includes(body.action)) {
    return NextResponse.json({ ok: false, message: "bad request" }, { status: 400 });
  }
  // TODO(Agent 3): real flow + error handling per the contract above.
  const result =
    body.action === "approved" ? await mergePR(body.pr_number) : await closePR(body.pr_number);
  if (result.ok) {
    await insertAudit({
      pr_number: body.pr_number,
      pr_title: body.pr_title,
      risk_level: body.risk_level,
      score: body.score,
      action: body.action,
      reasons: body.reasons ?? [],
    });
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
