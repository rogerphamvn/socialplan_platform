"use client";

import { useState } from "react";
import { Wand2, RefreshCw, Copy, CheckCheck, FileText, Layers, Mail, Hash, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "post" | "carousel" | "ad_copies" | "email" | "hashtags" | "warnings";

interface ContentPack {
  post: {
    hook: string; body: string; cta: string;
    platform_variant: Record<string, string>;
  };
  carousel: { slide: number; title: string; body: string; visual_cue: string }[];
  ad_copies: { objective: string; headline: string; primary_text: string; cta: string; char_count: number }[];
  email: { subject: string; preview: string; body_html_safe: string; cta: string };
  hashtags: string[];
  content_warnings: string[];
}

const MODELS = [
  { id: "openai/gpt-5.1", label: "GPT-5.1 (latest)" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
];

export default function ContentCreatorPage() {
  const [brief, setBrief] = useState(`Brand: Aniki Japanese Restaurant
Sản phẩm: Unagi Don – Cơm lươn Nhật nướng sốt Kabayaki
Audience: Dân văn phòng 25-40 tuổi tại TP. HCM
Goal: Quảng bá ưu đãi giảm 15% cho đơn mang về (tuần này)
Tone: Ấm áp, gần gũi, thuyết phục
Unique selling point: Lươn Nhật cao cấp, sốt handmade, nướng than hoa, dinh dưỡng cao`);
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContentPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("post");
  const [copied, setCopied] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/agent/content-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: brief, model, loadPriorRuns: 3 }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Generation failed");
      setData(json.data as ContentPack);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
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
          Content Creator <Wand2 className="w-5 h-5 text-brand-500" />
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Multi-format content pack — 1 brief → post · carousel · ad · email · hashtag
          (Port của hub skill <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">content-creator</code>)
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-5">
        <div className="card p-5 space-y-4 self-start sticky top-4">
          <h2 className="font-semibold">Brief đầu vào</h2>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={14}
            className="w-full p-3 border border-ink-200 rounded-card text-sm bg-white focus:outline-none focus:border-brand-400 resize-none font-mono leading-relaxed"
          />

          <div>
            <label className="text-xs font-medium text-ink-600 block mb-1.5">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-2.5 border border-ink-200 rounded-lg text-sm bg-white">
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          <button onClick={run} disabled={loading} className="btn-primary w-full">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Đang tạo content pack…" : "Tạo content pack"}
          </button>

          <p className="text-xs text-ink-500 leading-relaxed">
            💡 Mỗi lần chạy, agent sẽ pre-load 3 generation gần nhất từ Knowledge Graph để giữ context và voice nhất quán.
          </p>
        </div>

        <div className="card p-5 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-card">{error}</div>}

          {!data && !loading && !error && (
            <div className="text-center py-20 text-ink-400">
              <Wand2 className="w-12 h-12 mx-auto mb-3 text-ink-300" />
              <p className="text-sm">Điền brief bên trái → bấm <strong>Tạo content pack</strong></p>
            </div>
          )}

          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-8 bg-ink-100 rounded w-1/3" />
              <div className="h-32 bg-ink-100 rounded-card" />
              <div className="h-32 bg-ink-100 rounded-card" />
            </div>
          )}

          {data && (
            <>
              <div className="flex items-center gap-1 border-b border-ink-100 -mx-5 px-5 overflow-x-auto">
                {[
                  { id: "post", label: "Post", icon: FileText },
                  { id: "carousel", label: "Carousel", icon: Layers },
                  { id: "ad_copies", label: "Ad copies", icon: Sparkles },
                  { id: "email", label: "Email", icon: Mail },
                  { id: "hashtags", label: "Hashtags", icon: Hash },
                  { id: "warnings", label: "Cảnh báo", icon: AlertTriangle, count: data.content_warnings.length },
                ].map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button key={t.id} onClick={() => setTab(t.id as Tab)} className={cn(
                      "flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
                      active ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-700",
                    )}>
                      <Icon className="w-4 h-4" /> {t.label}
                      {"count" in t && t.count ? <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full">{t.count}</span> : null}
                    </button>
                  );
                })}
              </div>

              {tab === "post" && (
                <div className="space-y-4">
                  <Section title="Hook" body={data.post.hook} copyKey="hook" copied={copied} onCopy={copy} />
                  <Section title="Body" body={data.post.body} copyKey="body" copied={copied} onCopy={copy} preWrap />
                  <Section title="CTA" body={data.post.cta} copyKey="cta" copied={copied} onCopy={copy} />
                  <div>
                    <div className="text-xs font-medium text-ink-600 mb-2">Variants theo platform</div>
                    <div className="space-y-2">
                      {Object.entries(data.post.platform_variant).map(([p, txt]) => (
                        <Section key={p} title={p.toUpperCase()} body={txt} copyKey={`pv_${p}`} copied={copied} onCopy={copy} preWrap small />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "carousel" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.carousel.map((s) => (
                    <div key={s.slide} className="card-soft p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-brand-600">Slide {s.slide}</div>
                        <button onClick={() => copy(`slide_${s.slide}`, `${s.title}\n\n${s.body}`)} className="p-1 hover:bg-ink-100 rounded">
                          {copied === `slide_${s.slide}` ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
                        </button>
                      </div>
                      <div className="font-semibold text-sm">{s.title}</div>
                      <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed">{s.body}</p>
                      <div className="mt-2 text-xs text-ink-500 italic">🎨 {s.visual_cue}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "ad_copies" && (
                <div className="space-y-3">
                  {data.ad_copies.map((a, i) => (
                    <div key={i} className="card-soft p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium uppercase">{a.objective}</span>
                        <span className="text-xs text-ink-500 ml-auto">{a.char_count} chars</span>
                        <button onClick={() => copy(`ad_${i}`, `${a.headline}\n${a.primary_text}\n${a.cta}`)} className="p-1 hover:bg-ink-100 rounded">
                          {copied === `ad_${i}` ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
                        </button>
                      </div>
                      <div className="font-bold text-sm">{a.headline}</div>
                      <p className="text-sm mt-1.5 whitespace-pre-wrap leading-relaxed">{a.primary_text}</p>
                      <div className="mt-2 inline-block text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">→ {a.cta}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "email" && (
                <div className="space-y-3">
                  <Section title="Subject" body={data.email.subject} copyKey="esubj" copied={copied} onCopy={copy} />
                  <Section title="Preview" body={data.email.preview} copyKey="eprv" copied={copied} onCopy={copy} />
                  <Section title="Body" body={data.email.body_html_safe} copyKey="ebody" copied={copied} onCopy={copy} preWrap />
                  <Section title="CTA" body={data.email.cta} copyKey="ecta" copied={copied} onCopy={copy} />
                </div>
              )}

              {tab === "hashtags" && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {data.hashtags.map((h, i) => <span key={i} className="chip">{h}</span>)}
                  </div>
                  <button onClick={() => copy("hashtags", data.hashtags.join(" "))} className="btn-secondary">
                    {copied === "hashtags" ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    Copy tất cả
                  </button>
                </div>
              )}

              {tab === "warnings" && (
                <div className="space-y-2">
                  {data.content_warnings.length === 0 ? (
                    <p className="text-sm text-emerald-700">✓ Không có cảnh báo nào.</p>
                  ) : data.content_warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-card text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> {w}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title, body, copyKey, copied, onCopy, preWrap, small,
}: {
  title: string; body: string; copyKey: string; copied: string | null;
  onCopy: (k: string, t: string) => void; preWrap?: boolean; small?: boolean;
}) {
  return (
    <div className="card-soft p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className={cn("font-medium text-ink-600", small ? "text-[10px]" : "text-xs")}>{title}</div>
        <button onClick={() => onCopy(copyKey, body)} className="p-1 hover:bg-ink-100 rounded">
          {copied === copyKey ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
        </button>
      </div>
      <p className={cn(small ? "text-xs" : "text-sm", preWrap && "whitespace-pre-wrap", "leading-relaxed")}>{body}</p>
    </div>
  );
}
