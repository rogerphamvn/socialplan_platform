import { NextResponse } from "next/server";
import { chatJSON, MODELS, OpenRouterError, type ORMessage } from "@/lib/openrouter";

// POST /api/ai/generate
//   body: { goal, platform, kind, product, brief, tone, model? }
// returns: { ideas, captions, scripts, hashtags, ctas, imageConcepts }

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  goal: string;
  platform: string;
  kind: string;
  product: string;
  brief: string;
  tone: string;
  model?: "text" | "fast";
}

const SYSTEM = `Bạn là Senior Marketing Creative Director chuyên về F&B / lifestyle brands tại Việt Nam.
Khi nhận thông tin sản phẩm + giọng điệu + nền tảng, bạn trả về JSON đúng schema sau (tiếng Việt):

{
  "ideas": [
    { "title": string, "angle": string, "body": string, "focus": string }
  ],   // 3 ý tưởng concept
  "captions": [
    { "platform": string, "text": string, "length": "short" | "medium" | "long" }
  ],   // 3 caption
  "scripts": [
    { "title": string, "hook": string, "scenes": string[], "cta": string, "duration": string }
  ],   // 2 kịch bản video ngắn
  "hashtags": string[],          // 10-15 hashtag
  "ctas": string[],              // 5 CTA
  "imageConcepts": [
    { "label": string, "description": string }
  ]   // 4 concept hình ảnh
}

KHÔNG kèm markdown, KHÔNG kèm giải thích. Chỉ JSON hợp lệ.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const model = body.model === "fast" ? MODELS.fast() : MODELS.text();

    const userPrompt = `Mục tiêu nội dung: ${body.goal}
Nền tảng: ${body.platform}
Loại nội dung: ${body.kind}
Sản phẩm / Dịch vụ tập trung: ${body.product}
Giọng điệu: ${body.tone}

Chủ đề / thông tin đầu vào:
${body.brief}

Hãy sinh JSON theo schema đã yêu cầu.`;

    const messages: ORMessage[] = [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ];
    const data = await chatJSON({
      model,
      temperature: 0.85,
      max_tokens: 2400,
      messages,
    });

    return NextResponse.json({ ok: true, model, data });
  } catch (err) {
    if (err instanceof OpenRouterError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
