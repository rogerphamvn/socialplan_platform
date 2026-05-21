"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, RefreshCw, Lightbulb, MessageSquare, FileText, Hash, Target, Trash2, Plus, X } from "lucide-react";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import type { Platform } from "@/data/mock";
import { cn } from "@/lib/utils";

type Tab = "ideas" | "captions" | "scripts" | "hashtags" | "ctas";

interface GenResult {
  ideas: { title: string; angle: string; body: string; focus: string }[];
  captions: { platform: string; text: string; length: string }[];
  scripts: { title: string; hook: string; scenes: string[]; cta: string; duration: string }[];
  hashtags: string[];
  ctas: string[];
  imageConcepts: { label: string; description: string }[];
}

const GOAL_OPTIONS = [
  "Tăng nhận diện thương hiệu & thu hút khách hàng",
  "Thúc đẩy doanh thu / khuyến mãi",
  "Ra mắt sản phẩm / dịch vụ mới",
  "Tăng tương tác cộng đồng",
  "Tuyển dụng nhân sự",
];
const TONE_OPTIONS = ["Ấm áp, gần gũi, thuyết phục", "Năng lượng cao, vui nhộn", "Cao cấp, sang trọng", "Chuyên gia, tin cậy"];
const KIND_OPTIONS = ["Bài viết quảng bá (Feed Post)", "Reel / TikTok video", "Story 24h", "Poster khuyến mãi", "Email / Push"];
const PLATFORMS: Platform[] = ["facebook", "instagram", "tiktok", "shorts"];

const concept = (label: string, url: string) => ({ label, url });
const conceptImgs = [
  concept("Close-up món ăn", "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=400&q=70"),
  concept("Không gian Nhật Bản", "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=70"),
  concept("Nguyên liệu tươi ngon", "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=400&q=70"),
  concept("Thiết kế khuyến mãi", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=70"),
];

export default function AIGeneratorPage() {
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [platforms, setPlatforms] = useState<Platform[]>(["facebook"]);
  const [kind, setKind] = useState(KIND_OPTIONS[0]);
  const [product, setProduct] = useState("Unagi Don – Cơm lươn Nhật");
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [brief, setBrief] = useState(`• Unagi Don – Cơm lươn Nhật nướng sốt Kabayaki
• Lươn Nhật cao cấp, nướng than hoa
• Sốt Kabayaki handmade đậm đà
• Dinh dưỡng – Bổ dưỡng – Tốt cho sức khoẻ
• Phù hợp bữa trưa, bữa tối
• Đang có chương trình ưu đãi giảm 15% cho đơn mang về`);
  const [tab, setTab] = useState<Tab>("ideas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string>("");

  const togglePlatform = (p: Platform) => {
    setPlatforms((curr) => (curr.includes(p) ? curr.filter((x) => x !== p) : [...curr, p]));
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          platform: platforms.join(", "),
          kind,
          product,
          brief,
          tone,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Lỗi không xác định");
      setResult(json.data as GenResult);
      setModelUsed(json.model);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setProduct("");
    setBrief("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-5 max-w-[1500px]">
      <header>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          AI Content Generator <Sparkles className="w-5 h-5 text-brand-500" />
        </h1>
        <p className="text-ink-500 text-sm mt-1">Tạo nội dung marketing tự động với AI, nhanh chóng và đầy cảm hứng.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* LEFT: Input form */}
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="font-semibold mb-4">1. Bạn muốn tạo nội dung về gì?</h2>

            <Label>Mục tiêu nội dung</Label>
            <Select value={goal} onChange={setGoal} options={GOAL_OPTIONS} prefix={<Target className="w-4 h-4 text-brand-500" />} />

            <Label>Chọn nền tảng</Label>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 rounded-card border text-sm font-medium transition-colors",
                      active ? "border-brand-400 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
                    )}
                  >
                    <PlatformIcon platform={p} size={16} />
                    <span className="capitalize">{p === "shorts" ? "Shorts" : p}</span>
                  </button>
                );
              })}
            </div>

            <Label>Loại nội dung</Label>
            <Select value={kind} onChange={setKind} options={KIND_OPTIONS} />

            <Label>Sản phẩm / Dịch vụ tập trung</Label>
            <div className="flex items-center gap-2 p-3 border border-ink-200 rounded-card bg-white">
              {product && (
                <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 px-2 py-1 rounded-md text-sm">
                  {product}
                  <button onClick={() => setProduct("")}><X className="w-3.5 h-3.5" /></button>
                </span>
              )}
              <input
                value={product ? "" : product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder={product ? "" : "Nhập tên sản phẩm…"}
                className="flex-1 text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <hr className="border-ink-100" />

          <div>
            <h2 className="font-semibold mb-4">2. Chủ đề / thông tin đầu vào</h2>
            <div className="relative">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={9}
                maxLength={2000}
                className="w-full p-4 border border-ink-200 rounded-card text-sm bg-white focus:outline-none focus:border-brand-400 resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-xs text-ink-400">{brief.length}/2000</div>
            </div>

            <Label>Giọng điệu</Label>
            <Select value={tone} onChange={setTone} options={TONE_OPTIONS} />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={clearAll} className="btn-secondary"><Trash2 className="w-4 h-4" /> Xoá tất cả</button>
            <button onClick={generate} disabled={loading} className="btn-primary flex-1">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Đang tạo…" : "Tạo nội dung"}
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-card text-xs text-amber-900">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Mẹo: Cung cấp thông tin chi tiết hơn để AI tạo nội dung sát với mong muốn của bạn.</span>
          </div>
        </div>

        {/* RIGHT: AI output */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">3. Kết quả được tạo bởi AI</h2>
            {modelUsed && <span className="text-xs text-ink-500 bg-ink-50 px-2 py-1 rounded-full">{modelUsed}</span>}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-ink-100 -mx-6 px-6">
            {[
              { id: "ideas", label: "Ý tưởng", icon: Lightbulb },
              { id: "captions", label: "Caption", icon: MessageSquare },
              { id: "scripts", label: "Kịch bản", icon: FileText },
              { id: "hashtags", label: "Hashtag", icon: Hash },
              { id: "ctas", label: "CTA", icon: Target },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as Tab)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                    active ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-700",
                  )}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-card">
              {error}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="text-center py-16 text-ink-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-ink-300" />
              <p className="text-sm">Điền form bên trái rồi bấm <strong>Tạo nội dung</strong> để AI sinh ý tưởng cho bạn.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-32 bg-ink-100 rounded-card" />
              <div className="h-32 bg-ink-100 rounded-card" />
            </div>
          )}

          {result && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{tabTitle(tab)}</h3>
                <button onClick={generate} className="text-sm text-ink-600 hover:text-brand-700 inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                </button>
              </div>

              {tab === "ideas" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.ideas.map((idea, i) => (
                    <div key={i} className="card-soft overflow-hidden">
                      <div className="relative aspect-[4/3]">
                        <Image src={conceptImgs[i % conceptImgs.length].url} alt="" fill className="object-cover" />
                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur rounded-md px-2 py-0.5 text-xs font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="font-semibold text-sm">{idea.title}</div>
                        <p className="text-xs text-ink-600 leading-relaxed line-clamp-4">{idea.body}</p>
                        <div className="inline-block mt-2 text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-full">
                          Tập trung: {idea.focus}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "captions" && (
                <div className="space-y-3">
                  {result.captions.map((c, i) => (
                    <div key={i} className="card-soft p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-ink-500 uppercase">{c.platform}</span>
                        <span className="text-xs bg-ink-100 px-2 py-0.5 rounded-full text-ink-600">{c.length}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === "scripts" && (
                <div className="space-y-3">
                  {result.scripts.map((s, i) => (
                    <div key={i} className="card-soft p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{s.title}</div>
                        <span className="text-xs bg-ink-100 px-2 py-0.5 rounded-full text-ink-600">{s.duration}</span>
                      </div>
                      <div className="text-xs text-ink-500">Hook:</div>
                      <p className="text-sm italic">&ldquo;{s.hook}&rdquo;</p>
                      <ol className="text-sm space-y-1 list-decimal list-inside text-ink-700">
                        {s.scenes.map((sc, j) => <li key={j}>{sc}</li>)}
                      </ol>
                      <div className="inline-block text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full mt-2">
                        CTA: {s.cta}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "hashtags" && (
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((h, i) => (
                    <span key={i} className="chip">{h}</span>
                  ))}
                </div>
              )}

              {tab === "ctas" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.ctas.map((c, i) => (
                    <div key={i} className="card-soft p-3 text-sm font-medium text-ink-800">{c}</div>
                  ))}
                </div>
              )}

              <hr className="border-ink-100" />

              <div>
                <h3 className="text-sm font-semibold mb-3">Gợi ý concept hình ảnh</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {result.imageConcepts.slice(0, 4).map((ic, i) => (
                    <div key={i} className="card-soft overflow-hidden">
                      <div className="relative aspect-square">
                        <Image src={conceptImgs[i % conceptImgs.length].url} alt={ic.label} fill className="object-cover" />
                      </div>
                      <div className="p-2 text-xs font-medium text-center">{ic.label}</div>
                    </div>
                  ))}
                  <button className="card-soft border-dashed border-2 border-ink-200 flex flex-col items-center justify-center text-ink-500 hover:text-brand-600 hover:border-brand-300 transition-colors text-xs aspect-square">
                    <Plus className="w-5 h-5 mb-1" />
                    Xem thêm concept
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-ink-400 pt-2">
            Nội dung AI tạo ra chỉ mang tính chất tham khảo. Vui lòng kiểm tra và chỉnh sửa trước khi sử dụng.
          </p>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-ink-700 mt-4 mb-2">{children}</div>;
}

function Select({
  value, onChange, options, prefix,
}: { value: string; onChange: (v: string) => void; options: string[]; prefix?: React.ReactNode }) {
  return (
    <div className="relative flex items-center gap-2 p-3 border border-ink-200 rounded-card bg-white focus-within:border-brand-400">
      {prefix}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-sm bg-transparent focus:outline-none appearance-none cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function tabTitle(tab: Tab) {
  return {
    ideas: "Ý tưởng nội dung",
    captions: "Caption gợi ý",
    scripts: "Kịch bản video",
    hashtags: "Hashtag đề xuất",
    ctas: "Call-to-action",
  }[tab];
}
