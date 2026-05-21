// OpenRouter client — supports GPT-5, Gemini 3.5 Pro, Claude family, etc.
// Docs: https://openrouter.ai/docs

export type ORMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ORChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json_object" | "text";
}

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL_TEXT ?? "openai/gpt-5";
const BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

export async function openrouterChat(
  messages: ORMessage[],
  opts: ORChatOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY chưa được cấu hình. Thêm vào .env.local hoặc Vercel env.",
    );
  }
  const body: Record<string, unknown> = {
    model: opts.model ?? DEFAULT_MODEL,
    messages,
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.maxTokens ?? 2048,
  };
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "https://happycandlevn-2257.vercel.app",
      "X-Title": process.env.OPENROUTER_SITE_NAME ?? "Socialplan Platform",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "";
}

export const MODEL_IDS = {
  GPT5: "openai/gpt-5",
  GEMINI_35_PRO: "google/gemini-2.5-pro",
  CLAUDE_OPUS_47: "anthropic/claude-opus-4.7",
  CLAUDE_SONNET_46: "anthropic/claude-sonnet-4.6",
  CLAUDE_HAIKU_45: "anthropic/claude-haiku-4.5",
} as const;

// Default model selectors (env-overridable). Used by API routes.
export const MODELS = {
  text: () => process.env.OPENROUTER_MODEL_TEXT || MODEL_IDS.GPT5,
  vision: () => process.env.OPENROUTER_MODEL_VISION || MODEL_IDS.GEMINI_35_PRO,
  fast: () => process.env.OPENROUTER_MODEL_FAST || MODEL_IDS.CLAUDE_HAIKU_45,
};

export class OpenRouterError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// JSON-mode helper — asks model to return strict JSON, then parses it.
// Tolerates fenced-code wrappers.
export async function chatJSON<T>(opts: {
  model: string;
  messages: ORMessage[];
  temperature?: number;
  max_tokens?: number;
}): Promise<T> {
  const raw = await openrouterChat(opts.messages, {
    model: opts.model,
    temperature: opts.temperature,
    maxTokens: opts.max_tokens,
    responseFormat: "json_object",
  });
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
