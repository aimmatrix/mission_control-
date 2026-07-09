// ─── SPINE STUB — CONTRACT LOCKED, BODY OWNED BY AGENT 4 ─────────────
// GET → { entries: AuditEntry[] } newest first.
import { NextResponse } from "next/server";
import { listAudit } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ entries: await listAudit() });
}
