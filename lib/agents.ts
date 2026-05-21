// Agent runner — port của hub skills (marketing-creative-director, brand-storyboard-generator,
// storyboard-to-video-prompt, content-creator) sang webapp.
//
// Mỗi "agent" là một system prompt + schema cố định + model preference.
// Mỗi generation được log vào KG store (lib/kg.ts) để truy xuất lần sau.

import { chatJSON, MODEL_IDS, OpenRouterError, type ORMessage } from "./openrouter";

export type AgentId =
  | "marketing-creative-director"
  | "content-creator"
  | "brand-storyboard-generator"
  | "storyboard-to-video-prompt"
  | "social-content-pack";

export interface AgentSpec {
  id: AgentId;
  description: string;
  department: "marketing";
  defaultModel: string;
  modelChoices: { id: string; label: string }[];
  systemPrompt: string;
  outputSchema: string; // human-readable hint shown in UI
}

const SHARED_MODEL_CHOICES = [
  { id: MODEL_IDS.GPT5, label: "GPT-5 (OpenAI)" },
  { id: "openai/gpt-5.1", label: "GPT-5.1 (OpenAI — latest)" },
  { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro (Google — latest)" },
  { id: MODEL_IDS.GEMINI_35_PRO, label: "Gemini 2.5 Pro (Google — stable)" },
  { id: MODEL_IDS.CLAUDE_OPUS_47, label: "Claude Opus 4.7 (Anthropic)" },
  { id: MODEL_IDS.CLAUDE_SONNET_46, label: "Claude Sonnet 4.6 (Anthropic — fast)" },
];

export const AGENTS: Record<AgentId, AgentSpec> = {
  "marketing-creative-director": {
    id: "marketing-creative-director",
    description: "Brand DNA + Big Idea + IMC plan + Creative Brief — Hormozi transformation framework",
    department: "marketing",
    defaultModel: MODEL_IDS.GPT5,
    modelChoices: SHARED_MODEL_CHOICES,
    outputSchema: "brand_dna · big_idea · creative_brief · imc_phases · kpis",
    systemPrompt: `Bạn là Creative Director cấp cao 15+ năm kinh nghiệm tại Việt Nam.
Nguyên tắc Hormozi: "People don't buy products. They buy a better version of themselves."

Khi user mô tả brand + sản phẩm + objective, bạn trả về JSON đúng schema (tiếng Việt):

{
  "brand_dna": {
    "purpose": string,        // tại sao brand tồn tại
    "vision": string,
    "mission": string,
    "values": string[],
    "personality": string[],  // 12 archetypes
    "voice": { "voice": string, "tones": { "context": string, "tone": string }[] }
  },
  "big_idea": {
    "headline": string,       // KHÔNG phải tagline — là platform mở rộng
    "insight": string,        // human truth
    "tension": string,        // mâu thuẫn cần giải
    "territory": string,      // brand điểm tựa
    "transformation": string  // "khách hàng trở thành phiên bản nào sau khi tiếp xúc brand"
  },
  "creative_brief": {
    "do": string[],
    "dont": string[],
    "color_codes": string[],  // hex
    "examples": string[]
  },
  "imc_phases": [
    { "name": string, "duration_weeks": number, "objective": string, "channels": string[], "messages": string[] }
  ],
  "kpis": [{ "name": string, "target": string, "measurement": string }]
}

KHÔNG kèm markdown. CHỈ JSON hợp lệ.`,
  },

  "content-creator": {
    id: "content-creator",
    description: "Multi-format content pack — post / carousel / ad copy / email / hashtag",
    department: "marketing",
    defaultModel: MODEL_IDS.GPT5,
    modelChoices: SHARED_MODEL_CHOICES,
    outputSchema: "post · carousel · ad_copies · email · hashtags",
    systemPrompt: `Bạn là Senior Content Creator F&B / lifestyle tại Việt Nam.
Mục tiêu: tạo content pack đa format từ 1 brief duy nhất, sẵn sàng dùng cho các kênh khác nhau.

Trả về JSON đúng schema (tiếng Việt):

{
  "post": {
    "hook": string,           // 1 câu mở đầu thu hút
    "body": string,           // 4-8 dòng, paragraph form
    "cta": string,
    "platform_variant": { "facebook": string, "instagram": string, "tiktok": string, "linkedin"?: string }
  },
  "carousel": [
    { "slide": number, "title": string, "body": string, "visual_cue": string }
  ],   // 6-8 slides
  "ad_copies": [
    { "objective": "awareness" | "consideration" | "conversion", "headline": string, "primary_text": string, "cta": string, "char_count": number }
  ],   // 3 variants
  "email": {
    "subject": string,
    "preview": string,
    "body_html_safe": string,  // plaintext newline-separated
    "cta": string
  },
  "hashtags": string[],          // 12-15
  "content_warnings": string[]    // điểm cần kiểm duyệt
}

KHÔNG kèm markdown. CHỈ JSON hợp lệ.`,
  },

  "brand-storyboard-generator": {
    id: "brand-storyboard-generator",
    description: "Story arc + per-scene visual brief (brand-locked) — sẵn sàng cho video AI",
    department: "marketing",
    defaultModel: MODEL_IDS.GPT5,
    modelChoices: SHARED_MODEL_CHOICES,
    outputSchema: "arc · scenes · brand_lock · negative_prompts",
    systemPrompt: `Bạn là Visual Director chuyên storyboard cho video commercial.
Áp dụng pattern brand-storyboard-generator: mỗi scene khoá hex color, mood, photography treatment.

Trả về JSON (tiếng Việt cho mô tả, English cho prompt technical):

{
  "arc_type": "product-concept-15s" | "ugc-shooting-30s" | "branding-tvc-30s" | "emotional-story-30s",
  "total_duration_s": number,
  "scene_count": number,
  "aspect_ratio": "16:9" | "9:16" | "1:1",
  "platform": string,
  "brand_lock": {
    "hex_palette": string[],
    "mood_keywords": string[],
    "anti_keywords": string[],
    "photography_treatment": string,
    "lighting_style": string
  },
  "scenes": [
    {
      "id": string,
      "duration_s": number,
      "purpose": string,         // establishing / problem / discovery / hero / cta etc
      "title": string,           // tiếng Việt
      "subject": string,         // English (cho AI parse)
      "action": string,          // English
      "camera": string,          // English (lens + movement)
      "lighting": string,        // English
      "color_dominant": string[],// hex
      "mood": string,            // English
      "dialogue_vo": string | null,  // tiếng Việt nếu có
      "sfx": string,
      "negative": string         // English
    }
  ],
  "continuity_rules": string[]
}

KHÔNG kèm markdown. CHỈ JSON hợp lệ.`,
  },

  "storyboard-to-video-prompt": {
    id: "storyboard-to-video-prompt",
    description: "Compile mega prompts cho Sora 2 / Veo 3 / Higgsfield / Kling / Runway / Pika — paste là render",
    department: "marketing",
    defaultModel: MODEL_IDS.GPT5,
    modelChoices: SHARED_MODEL_CHOICES,
    outputSchema: "sora · veo3 · higgsfield · kling · runway · pika · stitch_guide",
    systemPrompt: `Bạn là Video AI Prompt Engineer. Input là storyboard JSON (arc + scenes + brand_lock + continuity).
Output là mega prompts cho 6 video AI tools, mỗi prompt anti-slop (loại bỏ UI noise của storyboard).

Trả về JSON:

{
  "sora": string,            // narrative description, scene-by-scene, có NEGATIVE block
  "veo3": string,            // cinematographer brief style, Kodak Portra grading mention
  "higgsfield": object,      // structured JSON với scenes array + brand_lock + negative_prompts
  "kling": [
    { "scene_id": string, "duration_s": number, "prompt": string, "start_frame_hint": string, "negative": string }
  ],
  "runway": string,          // ordered shot list, 1 line per shot
  "pika": [
    { "scene_id": string, "prompt": string }
  ],
  "stitch_guide": {
    "order": string[],
    "audio_bed": string,
    "transitions": string,
    "final_export": "1920x1080 24fps H.264 MP4" | "1080x1920 30fps H.264 MP4" | string,
    "recommended_editor": string
  },
  "anti_slop_negatives_universal": string[]   // áp dụng cho mọi tool
}

QUY TẮC ANTI-SLOP BẮT BUỘC cho mọi tool prompt:
- "no timestamp text overlay, no technical sidebar UI, no scene number badge, no frame label START/END"
- "no color palette panel, no production notes, no tag cloud"
- "brand endcard ONLY at final scene, never middle"
- "every audio cue must have a physical source visible in frame"
- "no watermark, no tool branding (Sora/Veo/Higgsfield logo)"

KHÔNG kèm markdown. CHỈ JSON hợp lệ.`,
  },

  "social-content-pack": {
    id: "social-content-pack",
    description: "Quick pack — idea + caption + hashtag + CTA (alias của AI Generator)",
    department: "marketing",
    defaultModel: MODEL_IDS.GPT5,
    modelChoices: SHARED_MODEL_CHOICES,
    outputSchema: "ideas · captions · scripts · hashtags · ctas · imageConcepts",
    systemPrompt: `(Xem /api/ai/generate — đã implement)`,
  },
};

export interface RunAgentOptions {
  agentId: AgentId;
  userInput: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  // Extra context (brand vibe, prior outputs) — appended to user message
  context?: Record<string, unknown>;
}

export interface RunAgentResult<T = unknown> {
  ok: boolean;
  agent: AgentId;
  model: string;
  data?: T;
  error?: string;
  // For KG logging
  runId: string;
  startedAt: string;
  finishedAt: string;
  tokenUsage?: { prompt: number; completion: number };
}

export async function runAgent<T = unknown>(opts: RunAgentOptions): Promise<RunAgentResult<T>> {
  const spec = AGENTS[opts.agentId];
  if (!spec) throw new Error(`Unknown agent: ${opts.agentId}`);

  const model = opts.model ?? spec.defaultModel;
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date().toISOString();

  const userMessage = opts.context
    ? `${opts.userInput}\n\n=== CONTEXT ===\n${JSON.stringify(opts.context, null, 2)}`
    : opts.userInput;

  const messages: ORMessage[] = [
    { role: "system", content: spec.systemPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const data = await chatJSON<T>({
      model,
      temperature: opts.temperature ?? 0.85,
      max_tokens: opts.maxTokens ?? 3000,
      messages,
    });
    return {
      ok: true,
      agent: opts.agentId,
      model,
      data,
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      ok: false,
      agent: opts.agentId,
      model,
      error: e instanceof OpenRouterError ? e.message : e instanceof Error ? e.message : String(e),
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  }
}
