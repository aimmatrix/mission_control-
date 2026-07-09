// ─── OWNED BY CLAUDE ── the scoring pipeline: fetch PRs → cache check →
// LLM score → cache write. No Cursor agent edits this file.
// Contract: GET → { prs: ScoredPR[] } | 500 { error: string }
import { NextResponse } from "next/server";
import { listOpenPRs } from "@/lib/adapters/github";
import { scorePR } from "@/lib/adapters/llm";
import { getCachedScore, setCachedScore } from "@/lib/db";
import type { ScoredPR } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prs = await listOpenPRs();
    const scored: ScoredPR[] = await Promise.all(
      prs.map(async (pr) => {
        const cached = await getCachedScore(pr.number, pr.head_sha);
        if (cached) return { pr, score: cached, cached: true };
        const score = await scorePR(pr);
        await setCachedScore(pr.number, pr.head_sha, score);
        return { pr, score, cached: false };
      })
    );
    scored.sort((a, b) => b.score.score - a.score.score);
    return NextResponse.json({ prs: scored });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "failed to load PRs" },
      { status: 500 }
    );
  }
}
