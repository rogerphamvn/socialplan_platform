import { NextResponse } from "next/server";
import { getGraph, queryRelevantGenerations } from "@/lib/kg";

export const runtime = "nodejs";

// GET /api/kg            -> entire graph
// GET /api/kg?agent=X    -> generations by agent
// GET /api/kg?q=keyword  -> generations matching keyword
export async function GET(request: Request) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agent");
  const q = url.searchParams.get("q");
  const top = parseInt(url.searchParams.get("top") ?? "10", 10);

  if (agentId || q) {
    const results = await queryRelevantGenerations({
      agentId: agentId ?? undefined,
      topicKeywords: q ? q.split(/\s+/).filter(Boolean) : undefined,
      topN: top,
    });
    return NextResponse.json({ ok: true, results });
  }

  const graph = await getGraph();
  return NextResponse.json({ ok: true, graph });
}
