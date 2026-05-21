// MCP HTTP/JSON endpoint — websites integrate with the Socialplan Platform here.
// Implements a subset of JSON-RPC 2.0 + MCP-style tool calls.
//
//   POST /api/mcp
//   Header: X-Socialplan-Token: <MCP_INTEGRATION_TOKEN>
//   Body:   { "jsonrpc": "2.0", "id": 1, "method": "tools/list" }
//
// Supported methods:
//   - initialize
//   - tools/list
//   - tools/call { name, arguments }
//
// Tools exposed:
//   - list_content              { projectId? } -> ContentItem[]
//   - list_campaigns            { projectId? } -> Campaign[]
//   - get_campaign              { slug }       -> Campaign
//   - list_today_schedule       { }            -> ContentItem[] (today only)
//   - get_analytics_summary     { campaignSlug } -> metrics
//   - schedule_post (stub)      { ... }        -> { ok, id }

import { NextResponse } from "next/server";
import { CAMPAIGNS, CONTENT_LIBRARY, CONTENT_TODAY, PROJECTS } from "@/data/mock";

export const runtime = "nodejs";

const TOOL_DEFS = [
  {
    name: "list_projects",
    description: "Trả về danh sách project (brand) đang quản lý.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_content",
    description: "Liệt kê tất cả nội dung trong thư viện. Có thể filter theo projectId.",
    inputSchema: { type: "object", properties: { projectId: { type: "string" } } },
  },
  {
    name: "list_today_schedule",
    description: "Liệt kê các post / video sẽ lên hôm nay.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_campaigns",
    description: "Liệt kê tất cả chiến dịch.",
    inputSchema: { type: "object", properties: { projectId: { type: "string" } } },
  },
  {
    name: "get_campaign",
    description: "Lấy chi tiết một chiến dịch theo slug.",
    inputSchema: { type: "object", required: ["slug"], properties: { slug: { type: "string" } } },
  },
  {
    name: "get_analytics_summary",
    description: "Tóm tắt metrics 7 ngày cho một chiến dịch.",
    inputSchema: { type: "object", required: ["campaignSlug"], properties: { campaignSlug: { type: "string" } } },
  },
  {
    name: "schedule_post",
    description: "Lên lịch một post mới (stub - sẽ tích hợp Facebook/IG/TikTok API sau).",
    inputSchema: {
      type: "object",
      required: ["platform", "title", "scheduledAt"],
      properties: {
        platform: { type: "string", enum: ["facebook", "instagram", "tiktok", "youtube"] },
        title: { type: "string" },
        body: { type: "string" },
        mediaUrl: { type: "string" },
        scheduledAt: { type: "string", description: "ISO datetime" },
      },
    },
  },
];

function ok(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}
function err(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: code === -32700 ? 400 : 200 });
}

export async function POST(request: Request) {
  // Auth
  const token = request.headers.get("x-socialplan-token");
  const expected = process.env.MCP_INTEGRATION_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return err(null, -32700, "Parse error");
  }
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return err(body.id ?? null, -32600, "Invalid Request");
  }
  const { method, params = {}, id } = body;

  if (method === "initialize") {
    return ok(id, {
      protocolVersion: "0.2",
      serverInfo: { name: "socialplan-platform", version: "0.1.0" },
      capabilities: { tools: { listChanged: false } },
    });
  }

  if (method === "tools/list") {
    return ok(id, { tools: TOOL_DEFS });
  }

  if (method === "tools/call") {
    const name = params.name as string;
    const args = (params.arguments as Record<string, unknown>) ?? {};
    try {
      const result = await callTool(name, args);
      return ok(id, { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result });
    } catch (e) {
      return err(id, -32602, e instanceof Error ? e.message : String(e));
    }
  }

  return err(id, -32601, `Method not found: ${method}`);
}

async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "list_projects":
      return { projects: PROJECTS };
    case "list_content":
      return { content: CONTENT_LIBRARY };
    case "list_today_schedule":
      return { content: CONTENT_TODAY };
    case "list_campaigns":
      return { campaigns: CAMPAIGNS };
    case "get_campaign": {
      const slug = args.slug as string;
      const c = CAMPAIGNS.find((x) => x.slug === slug);
      if (!c) throw new Error(`Campaign not found: ${slug}`);
      return c;
    }
    case "get_analytics_summary": {
      const slug = args.campaignSlug as string;
      const c = CAMPAIGNS.find((x) => x.slug === slug);
      if (!c) throw new Error(`Campaign not found: ${slug}`);
      return { campaign: c.name, metrics: c.metrics, deltas: c.deltas, period: "7d" };
    }
    case "schedule_post": {
      // Stub: in production this would call Facebook Graph / IG / TikTok APIs.
      const id = `sched_${Date.now()}`;
      return {
        ok: true,
        id,
        message: "Đã ghi nhận lịch đăng (stub). Tích hợp Facebook Graph API ở /lib/social/* sẽ thực thi thật.",
        scheduled: args,
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// GET = self-describe endpoint (for humans / integrators)
export async function GET() {
  return NextResponse.json({
    name: "socialplan-platform-mcp",
    version: "0.1.0",
    description: "MCP-compatible endpoint for websites to talk to the Socialplan Platform.",
    transport: "http+json",
    auth: { type: "bearer-header", header: "X-Socialplan-Token" },
    methods: ["initialize", "tools/list", "tools/call"],
    tools: TOOL_DEFS.map((t) => ({ name: t.name, description: t.description })),
    docs: "/docs/mcp",
  });
}
