import { NextResponse } from "next/server";
import { createProblemTask, listProblemTasks } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const tasks = await listProblemTasks();
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const task = await createProblemTask(text);
  return NextResponse.json({ task }, { status: 201 });
}
