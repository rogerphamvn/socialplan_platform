// Knowledge graph store.
// Backend selection:
//   - If SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env present -> use Supabase
//     (persistent, queryable, recommended for production)
//   - Else fallback to JSON file on /tmp (ephemeral on Vercel — only good for dev / demo)

import { promises as fs } from "fs";
import path from "path";
import { getSupabase, isSupabaseAvailable } from "./supabase";

export type NodeType = "Agent" | "Skill" | "Domain" | "DataFlow" | "Context" | "Generation";
export type EdgeType = "CALLS" | "HAS_SKILL" | "PRODUCES" | "USES_MODEL" | "REFERENCES" | "TRIGGERED_BY";

export interface KGNode {
  type: NodeType;
  id: string;
  name: string;
  properties?: Record<string, unknown>;
  createdAt?: string;
}

export interface KGEdge {
  from: string;
  to: string;
  type: EdgeType;
  properties?: Record<string, unknown>;
  createdAt?: string;
}

export interface KGGraph {
  version: string;
  updated: string;
  stats: { nodes: number; edges: number };
  nodes: KGNode[];
  edges: KGEdge[];
}

const KG_PATH = process.env.NODE_ENV === "production"
  ? "/tmp/socialplan-kg.json"
  : path.join(process.cwd(), "data", "kg-runtime.json");

// Seed graph — agents registered at boot
const SEED: KGGraph = {
  version: "0.1",
  updated: new Date().toISOString(),
  stats: { nodes: 0, edges: 0 },
  nodes: [
    { type: "Domain", id: "dept-marketing", name: "Marketing" },
    { type: "Agent", id: "marketing-creative-director", name: "Creative Director", properties: { tier: "staff", level: 5 } },
    { type: "Agent", id: "content-creator", name: "Content Creator", properties: { tier: "staff", level: 4 } },
    { type: "Agent", id: "brand-storyboard-generator", name: "Storyboard Generator", properties: { tier: "staff", level: 5 } },
    { type: "Agent", id: "storyboard-to-video-prompt", name: "Video Prompt Compiler", properties: { tier: "staff", level: 5 } },
    { type: "Skill", id: "skill-content-pack", name: "Multi-format content pack" },
    { type: "Skill", id: "skill-brand-dna", name: "Brand DNA framework" },
    { type: "Skill", id: "skill-storyboard-arc", name: "Story arc + scene briefs" },
    { type: "Skill", id: "skill-video-mega-prompt", name: "Mega prompt for Sora/Veo3/Higgsfield" },
  ],
  edges: [
    { from: "marketing-creative-director", to: "skill-brand-dna", type: "HAS_SKILL" },
    { from: "content-creator", to: "skill-content-pack", type: "HAS_SKILL" },
    { from: "brand-storyboard-generator", to: "skill-storyboard-arc", type: "HAS_SKILL" },
    { from: "storyboard-to-video-prompt", to: "skill-video-mega-prompt", type: "HAS_SKILL" },
    { from: "brand-storyboard-generator", to: "storyboard-to-video-prompt", type: "CALLS", properties: { trigger: "after storyboard ready" } },
    { from: "marketing-creative-director", to: "brand-storyboard-generator", type: "CALLS", properties: { trigger: "after creative brief approved" } },
  ],
};

async function load(): Promise<KGGraph> {
  try {
    const raw = await fs.readFile(KG_PATH, "utf-8");
    return JSON.parse(raw) as KGGraph;
  } catch {
    const seed = { ...SEED, stats: { nodes: SEED.nodes.length, edges: SEED.edges.length } };
    await save(seed).catch(() => {});
    return seed;
  }
}

async function save(graph: KGGraph): Promise<void> {
  graph.updated = new Date().toISOString();
  graph.stats = { nodes: graph.nodes.length, edges: graph.edges.length };
  await fs.mkdir(path.dirname(KG_PATH), { recursive: true });
  await fs.writeFile(KG_PATH, JSON.stringify(graph, null, 2), "utf-8");
}

export async function logGeneration(input: {
  runId: string;
  agentId: string;
  model: string;
  topic: string;
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  error?: string;
  payload?: unknown;
}): Promise<void> {
  // Prefer Supabase if available
  if (isSupabaseAvailable()) {
    const sb = getSupabase()!;
    const { error } = await sb.from("generations").insert({
      id: input.runId,
      agent_id: input.agentId,
      model: input.model,
      topic: input.topic,
      ok: input.ok,
      error: input.error,
      payload: input.payload ?? null,
      started_at: input.startedAt,
      finished_at: input.finishedAt,
    });
    if (error) console.error("Supabase log error:", error);
    // edges
    await sb.from("kg_edges").insert([
      { from_node: input.runId, to_node: input.agentId, edge_type: "TRIGGERED_BY" },
      { from_node: input.runId, to_node: input.model, edge_type: "USES_MODEL" },
    ]);
    return;
  }

  // Fallback: JSON file
  const graph = await load();
  graph.nodes.push({
    type: "Generation",
    id: input.runId,
    name: `${input.agentId} · ${input.topic.slice(0, 60)}`,
    properties: {
      agent: input.agentId, model: input.model, topic: input.topic,
      ok: input.ok, error: input.error,
      startedAt: input.startedAt, finishedAt: input.finishedAt,
    },
    createdAt: input.startedAt,
  });
  graph.edges.push({ from: input.runId, to: input.agentId, type: "TRIGGERED_BY", createdAt: input.startedAt });
  graph.edges.push({ from: input.runId, to: input.model, type: "USES_MODEL", createdAt: input.startedAt });
  await save(graph);
}

export async function getGraph(): Promise<KGGraph> {
  return load();
}

export async function queryRelevantGenerations(opts: {
  agentId?: string;
  topicKeywords?: string[];
  topN?: number;
}): Promise<KGNode[]> {
  const topN = opts.topN ?? 5;

  if (isSupabaseAvailable()) {
    const sb = getSupabase()!;
    let q = sb.from("generations").select("*").order("started_at", { ascending: false }).limit(topN * 4);
    if (opts.agentId) q = q.eq("agent_id", opts.agentId);
    const { data, error } = await q;
    if (error) {
      console.error("Supabase query error:", error);
      return [];
    }
    // keyword score
    const scored = (data ?? []).map((row) => {
      let score = opts.agentId && row.agent_id === opts.agentId ? 10 : 0;
      if (opts.topicKeywords?.length && row.topic) {
        const t = String(row.topic).toLowerCase();
        score += opts.topicKeywords.filter((k) => t.includes(k.toLowerCase())).length * 3;
      }
      return { row, score };
    });
    return scored
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map((x) => ({
        type: "Generation" as const,
        id: x.row.id,
        name: `${x.row.agent_id} · ${String(x.row.topic ?? "").slice(0, 60)}`,
        properties: {
          agent: x.row.agent_id, model: x.row.model, topic: x.row.topic,
          ok: x.row.ok, startedAt: x.row.started_at, finishedAt: x.row.finished_at,
        },
      }));
  }

  // Fallback
  const graph = await load();
  const gens = graph.nodes.filter((n) => n.type === "Generation");
  const scored = gens.map((n) => {
    let score = 0;
    if (opts.agentId && n.properties?.agent === opts.agentId) score += 10;
    if (opts.topicKeywords?.length && typeof n.properties?.topic === "string") {
      const t = (n.properties.topic as string).toLowerCase();
      score += opts.topicKeywords.filter((k) => t.includes(k.toLowerCase())).length * 3;
    }
    return { n, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((x) => x.n);
}

export function getStorageBackend(): "supabase" | "json-file" {
  return isSupabaseAvailable() ? "supabase" : "json-file";
}
