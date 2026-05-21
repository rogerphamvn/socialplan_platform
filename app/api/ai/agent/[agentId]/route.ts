// Generic agent runner — POST /api/ai/agent/{agentId}
// Body: { input: string, model?: string, context?: object, temperature?, maxTokens? }
//
// Each call logs to KG (lib/kg.ts) for downstream agents to query.

import { NextResponse } from "next/server";
import { runAgent, AGENTS, type AgentId } from "@/lib/agents";
import { logGeneration, queryRelevantGenerations } from "@/lib/kg";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  input: string;
  model?: string;
  context?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
  // Optional: agent will pre-load N prior runs from KG as additional context
  loadPriorRuns?: number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const spec = AGENTS[agentId as AgentId];
  if (!spec) {
    return NextResponse.json(
      { ok: false, error: `Unknown agent: ${agentId}`, available: Object.keys(AGENTS) },
      { status: 404 },
    );
  }

  const body = (await request.json()) as Body;
  if (!body.input?.trim()) {
    return NextResponse.json({ ok: false, error: "Missing 'input' field" }, { status: 400 });
  }

  // KG pre-load: pull N prior runs of same agent (or related topic)
  let priorContext = body.context ?? {};
  if (body.loadPriorRuns && body.loadPriorRuns > 0) {
    const prior = await queryRelevantGenerations({
      agentId,
      topicKeywords: body.input.split(/\s+/).filter((w) => w.length > 4).slice(0, 6),
      topN: body.loadPriorRuns,
    });
    if (prior.length) {
      priorContext = { ...priorContext, prior_runs: prior.map((p) => ({ id: p.id, topic: p.properties?.topic })) };
    }
  }

  const result = await runAgent({
    agentId: agentId as AgentId,
    userInput: body.input,
    model: body.model,
    temperature: body.temperature,
    maxTokens: body.maxTokens,
    context: priorContext,
  });

  // Fire-and-forget KG log (best-effort, doesn't block response)
  logGeneration({
    runId: result.runId,
    agentId,
    model: result.model,
    topic: body.input.slice(0, 200),
    ok: result.ok,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    error: result.error,
  }).catch((e) => console.error("KG log failed:", e));

  return NextResponse.json(result);
}

// GET = list agents
export async function GET() {
  return NextResponse.json({
    agents: Object.values(AGENTS).map((a) => ({
      id: a.id,
      description: a.description,
      department: a.department,
      defaultModel: a.defaultModel,
      modelChoices: a.modelChoices,
      outputSchema: a.outputSchema,
    })),
  });
}
