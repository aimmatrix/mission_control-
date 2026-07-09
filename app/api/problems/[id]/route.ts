import { NextResponse } from "next/server";
import { approveProblemTask, rejectProblemTask } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (body.action === "approve") {
    const task = await approveProblemTask(params.id);
    if (!task) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ task });
  }

  if (body.action === "reject") {
    const task = await rejectProblemTask(params.id);
    if (!task) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ task });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
