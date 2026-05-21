"use client";

import { useState } from "react";
import { Video, RefreshCw, Copy, CheckCheck, Film, Camera, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Template = "product-concept-15s" | "ugc-shooting-30s" | "branding-tvc-30s";
type Stage = "input" | "storyboard" | "mega-prompts";

const TEMPLATES: Record<Template, { label: string; emoji: string; description: string; sampleBrief: string }> = {
  "product-concept-15s": {
    label: "Product Concept Video",
    emoji: "🍱",
    description: "15s — short product showcase, hook + key benefit + CTA. Phù hợp Reel / TikTok / Shorts.",
    sampleBrief: `Sản phẩm: Unagi Don – Cơm lươn Nhật Aniki
Concept: "Bữa trưa quốc dân – nóng hổi từ bếp Aniki"
Aspect ratio: 9:16 (Reel/TikTok)
Mood: ấm cúng, ngon mắt, gợi thèm
Hero element: tô lươn nướng bốc khói, sốt Kabayaki rưới chậm
CTA cuối: "Order ngay – Aniki.com" + 15% off mang về`,
  },
  "ugc-shooting-30s": {
    label: "UGC Shooting Brief",
    emoji: "📱",
    description: "30s — kịch bản kiểu user-generated (1-2 nhân vật quay điện thoại) cho influencer/staff content team.",
    sampleBrief: `Sản phẩm: Combo Lunch Set Aniki (2 món + canh + đồ uống)
Setting: văn phòng giờ nghỉ trưa, 2 đồng nghiệp
Style: handheld, vlog-style, ngôn ngữ tự nhiên không quá quảng cáo
Talking points: ship nóng, hộp giấy đẹp, giá hợp lý, chia sẻ được
Platform: TikTok 9:16 + Reel
Tone: chill, thật, không phô`,
  },
  "branding-tvc-30s": {
    label: "Branding TVC",
    emoji: "🎬",
    description: "30s — emotional brand story, full cinematic. Xuất bản Facebook / YouTube + cắt thành sub-clips.",
    sampleBrief: `Brand: Aniki Japanese Restaurant
Big Idea: "Cảm xúc Nhật – đặt giữa Sài Gòn"
Story arc: từ đầu bếp Nhật chăm chút từng miếng lươn → đến khách hàng cười rạng rỡ khi thưởng thức
Aspect ratio: 16:9 horizontal (Facebook / YouTube) + 9:16 cut
Mood: ấm áp, tinh tế, sang trọng vừa phải
Palette: cream warm (#F5E6D3), deep maroon (#682621), gold accent (#C9A36A)
Endcard: logo Aniki + tagline "Vị Nhật, đậm đà tinh hoa"`,
  },
};

const MODELS = [
  { id: "openai/gpt-5.1", label: "GPT-5.1 (latest)" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
];

interface Storyboard {
  arc_type: string; total_duration_s: number; scene_count: number; aspect_ratio: string; platform: string;
  brand_lock: {
    hex_palette: string[]; mood_keywords: string[]; anti_keywords: string[];
    photography_treatment: string; lighting_style: string;
  };
  scenes: {
    id: string; duration_s: number; purpose: string; title: string;
    subject: string; action: string; camera: string; lighting: string;
    color_dominant: string[]; mood: string; dialogue_vo: string | null; sfx: string; negative: string;
  }[];
  continuity_rules: string[];
}

interface MegaPrompts {
  sora: string; veo3: string; higgsfield: object;
  kling: { scene_id: string; duration_s: number; prompt: string; start_frame_hint: string; negative: string }[];
  runway: string; pika: { scene_id: string; prompt: string }[];
  stitch_guide: { order: string[]; audio_bed: string; transitions: string; final_export: string; recommended_editor: string };
  anti_slop_negatives_universal: string[];
}

export default function VideoStudioPage() {
  const [template, setTemplate] = useState<Template>("product-concept-15s");
  const [brief, setBrief] = useState(TEMPLATES["product-concept-15s"].sampleBrief);
  const [model, setModel] = useState(MODELS[0].id);
  const [stage, setStage] = useState<Stage>("input");
  const [loading, setLoading] = useState<null | "storyboard" | "prompts">(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [megaPrompts, setMegaPrompts] = useState<MegaPrompts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tool, setTool] = useState<"sora" | "veo3" | "higgsfield" | "kling" | "runway" | "pika">("sora");

  const pickTemplate = (t: Template) => {
    setTemplate(t);
    setBrief(TEMPLATES[t].sampleBrief);
    setStage("input");
    setStoryboard(null);
    setMegaPrompts(null);
  };

  const generateStoryboard = async () => {
    setLoading("storyboard");
    setError(null);
    try {
      const res = await fetch("/api/ai/agent/brand-storyboard-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: brief,
          model,
          context: { template, target_format: TEMPLATES[template].label },
          loadPriorRuns: 2,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Storyboard generation failed");
      setStoryboard(json.data as Storyboard);
      setStage("storyboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  };

  const generateMegaPrompts = async () => {
    if (!storyboard) return;
    setLoading("prompts");
    setError(null);
    try {
      const res = await fetch("/api/ai/agent/storyboard-to-video-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: `Compile mega prompts cho 6 video AI tools từ storyboard sau:\n${JSON.stringify(storyboard, null, 2)}`,
          model,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Mega prompt compile failed");
      setMegaPrompts(json.data as MegaPrompts);
      setStage("mega-prompts");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5 max-w-[1500px]">
      <header>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          Video Studio <Video className="w-5 h-5 text-brand-500" />
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Storyboard generator → mega prompts cho Sora 2 / Veo 3 / Higgsfield / Kling / Runway / Pika.
          Port của hub skill <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">brand-storyboard-generator</code> + <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">storyboard-to-video-prompt</code>.
        </p>
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-3 text-sm">
        <Step n={1} label="Brief" active={stage === "input"} done={stage !== "input"} />
        <ArrowRight className="w-4 h-4 text-ink-300" />
        <Step n={2} label="Storyboard" active={stage === "storyboard"} done={stage === "mega-prompts"} />
        <ArrowRight className="w-4 h-4 text-ink-300" />
        <Step n={3} label="Mega prompts" active={stage === "mega-prompts"} done={false} />
      </div>

      {/* Template picker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.entries(TEMPLATES) as [Template, typeof TEMPLATES[Template]][]).map(([key, t]) => (
          <button
            key={key}
            onClick={() => pickTemplate(key)}
            className={cn(
              "card p-4 text-left transition-shadow",
              template === key ? "ring-2 ring-brand-500 shadow-soft" : "hover:shadow-soft",
            )}
          >
            <div className="text-3xl mb-2">{t.emoji}</div>
            <div className="font-semibold">{t.label}</div>
            <div className="text-xs text-ink-500 mt-1 leading-relaxed">{t.description}</div>
          </button>
        ))}
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-card">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-5">
        {/* Input */}
        <div className="card p-5 space-y-4 self-start">
          <h2 className="font-semibold flex items-center gap-2"><Camera className="w-4 h-4" /> Brief storyboard</h2>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={12}
            className="w-full p-3 border border-ink-200 rounded-card text-sm bg-white focus:outline-none focus:border-brand-400 resize-none font-mono leading-relaxed" />
          <div>
            <label className="text-xs font-medium text-ink-600 block mb-1.5">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-2.5 border border-ink-200 rounded-lg text-sm bg-white">
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <button onClick={generateStoryboard} disabled={loading !== null} className="btn-primary w-full">
            {loading === "storyboard" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {loading === "storyboard" ? "Đang tạo storyboard…" : "Tạo storyboard"}
          </button>
          {storyboard && (
            <button onClick={generateMegaPrompts} disabled={loading !== null} className="btn-secondary w-full">
              {loading === "prompts" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading === "prompts" ? "Đang compile…" : "Compile mega prompts →"}
            </button>
          )}
        </div>

        {/* Output */}
        <div className="card p-5">
          {!storyboard && !loading && <div className="text-center py-20 text-ink-400">
            <Film className="w-12 h-12 mx-auto mb-3 text-ink-300" />
            <p className="text-sm">Chọn template + chỉnh brief → bấm <strong>Tạo storyboard</strong></p>
          </div>}

          {loading && <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-ink-100 rounded w-1/3" />
            <div className="h-40 bg-ink-100 rounded-card" />
            <div className="h-40 bg-ink-100 rounded-card" />
          </div>}

          {storyboard && !megaPrompts && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold">{storyboard.arc_type} · {storyboard.total_duration_s}s · {storyboard.scene_count} scenes</h3>
                <div className="text-xs text-ink-500">{storyboard.aspect_ratio} · {storyboard.platform}</div>
              </div>

              {/* Brand lock palette */}
              <div className="card-soft p-3">
                <div className="text-xs font-medium text-ink-600 mb-2">Brand lock</div>
                <div className="flex items-center gap-2 mb-2">
                  {storyboard.brand_lock.hex_palette.map((h) => (
                    <div key={h} className="flex items-center gap-1.5 text-xs">
                      <div className="w-5 h-5 rounded border border-ink-200" style={{ background: h }} />
                      <code className="text-[10px]">{h}</code>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-ink-600">Mood: {storyboard.brand_lock.mood_keywords.join(", ")}</div>
                <div className="text-xs text-ink-500 italic mt-1">Photo: {storyboard.brand_lock.photography_treatment}</div>
              </div>

              {/* Scenes */}
              <div className="space-y-3">
                {storyboard.scenes.map((s) => (
                  <div key={s.id} className="card-soft p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-brand-600 text-white px-2 py-0.5 rounded">SCENE {s.id}</span>
                        <span className="text-xs text-ink-500">{s.duration_s}s · {s.purpose}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {s.color_dominant.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />)}
                      </div>
                    </div>
                    <div className="font-semibold text-sm">{s.title}</div>
                    <div className="text-xs text-ink-600 mt-1.5 leading-relaxed space-y-0.5">
                      <div><strong>Subject:</strong> {s.subject}</div>
                      <div><strong>Action:</strong> {s.action}</div>
                      <div><strong>Camera:</strong> {s.camera}</div>
                      <div><strong>Lighting:</strong> {s.lighting}</div>
                      <div><strong>Mood:</strong> {s.mood}</div>
                      {s.dialogue_vo && <div className="text-brand-700"><strong>VO:</strong> &ldquo;{s.dialogue_vo}&rdquo;</div>}
                      <div><strong>SFX:</strong> {s.sfx}</div>
                      <div className="text-rose-600 mt-1"><strong>Negative:</strong> {s.negative}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continuity */}
              {storyboard.continuity_rules?.length > 0 && (
                <div className="card-soft p-3 bg-amber-50/40">
                  <div className="text-xs font-medium text-amber-800 mb-2">Continuity rules</div>
                  <ul className="text-xs space-y-1 list-disc list-inside text-ink-700">
                    {storyboard.continuity_rules.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {megaPrompts && (
            <div className="space-y-4">
              <h3 className="font-semibold">Mega prompts — paste vào tool tương ứng</h3>
              <div className="flex items-center gap-1 border-b border-ink-100 -mx-5 px-5 overflow-x-auto">
                {(["sora", "veo3", "higgsfield", "kling", "runway", "pika"] as const).map((t) => (
                  <button key={t} onClick={() => setTool(t)} className={cn(
                    "px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap uppercase",
                    tool === t ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-700",
                  )}>{t}</button>
                ))}
              </div>

              <div className="space-y-3">
                {tool === "sora" && <PromptBlock title="Sora 2 mega prompt" text={megaPrompts.sora} copyKey="sora" copied={copied} onCopy={copy} />}
                {tool === "veo3" && <PromptBlock title="Veo 3 cinematographer brief" text={megaPrompts.veo3} copyKey="veo3" copied={copied} onCopy={copy} />}
                {tool === "higgsfield" && <PromptBlock title="Higgsfield JSON" text={JSON.stringify(megaPrompts.higgsfield, null, 2)} copyKey="higgs" copied={copied} onCopy={copy} mono />}
                {tool === "kling" && megaPrompts.kling.map((k) => (
                  <PromptBlock key={k.scene_id} title={`Kling Scene ${k.scene_id} · ${k.duration_s}s`} text={`${k.prompt}\n\nStart frame hint: ${k.start_frame_hint}\nNegative: ${k.negative}`} copyKey={`kling_${k.scene_id}`} copied={copied} onCopy={copy} />
                ))}
                {tool === "runway" && <PromptBlock title="Runway shot list" text={megaPrompts.runway} copyKey="runway" copied={copied} onCopy={copy} />}
                {tool === "pika" && megaPrompts.pika.map((p) => (
                  <PromptBlock key={p.scene_id} title={`Pika Scene ${p.scene_id}`} text={p.prompt} copyKey={`pika_${p.scene_id}`} copied={copied} onCopy={copy} />
                ))}
              </div>

              <div className="card-soft p-4 bg-emerald-50/40">
                <div className="font-semibold text-sm mb-2 text-emerald-800">Stitch guide</div>
                <div className="text-xs space-y-1 text-ink-700">
                  <div><strong>Order:</strong> {megaPrompts.stitch_guide.order.join(" → ")}</div>
                  <div><strong>Audio bed:</strong> {megaPrompts.stitch_guide.audio_bed}</div>
                  <div><strong>Transitions:</strong> {megaPrompts.stitch_guide.transitions}</div>
                  <div><strong>Final export:</strong> {megaPrompts.stitch_guide.final_export}</div>
                  <div><strong>Editor:</strong> {megaPrompts.stitch_guide.recommended_editor}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
        done ? "bg-emerald-500 text-white" : active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500",
      )}>
        {done ? "✓" : n}
      </div>
      <span className={cn(active ? "font-semibold" : "text-ink-500")}>{label}</span>
    </div>
  );
}

function PromptBlock({ title, text, copyKey, copied, onCopy, mono }: {
  title: string; text: string; copyKey: string; copied: string | null; onCopy: (k: string, t: string) => void; mono?: boolean;
}) {
  return (
    <div className="card-soft p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-ink-700">{title}</div>
        <button onClick={() => onCopy(copyKey, text)} className="inline-flex items-center gap-1 text-xs text-brand-600 px-2 py-1 rounded hover:bg-brand-50">
          {copied === copyKey ? <><CheckCheck className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
      <pre className={cn("text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto", mono ? "font-mono" : "")}>{text}</pre>
    </div>
  );
}
