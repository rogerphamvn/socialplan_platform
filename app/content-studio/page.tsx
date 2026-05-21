"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, Upload, Filter, LayoutGrid, List, MoreHorizontal, PlayCircle, Image as ImageIcon } from "lucide-react";
import { CONTENT_LIBRARY, type ContentKind } from "@/data/mock";
import { PlatformIcon, platformLabel } from "@/components/ui/PlatformIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";

const filters: { value: ContentKind | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "post", label: "Bài viết" },
  { value: "reel", label: "Reel / TikTok" },
  { value: "story", label: "Story" },
  { value: "poster", label: "Poster" },
  { value: "video", label: "Video" },
];

export default function ContentStudioPage() {
  const [filter, setFilter] = useState<ContentKind | "all">("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    return CONTENT_LIBRARY.filter((c) => filter === "all" || c.kind === filter)
      .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));
  }, [filter, query]);

  return (
    <div className="space-y-5 max-w-[1400px]">
      <header>
        <h1 className="text-2xl font-display font-bold">Content Studio</h1>
        <p className="text-ink-500 text-sm mt-1">Quản lý và xuất bản nội dung trên các kênh mạng xã hội</p>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung theo tiêu đề, hashtag, kênh…"
            className="w-full pl-11 pr-4 py-3 rounded-card border border-ink-200 text-sm bg-white focus:outline-none focus:border-brand-400"
          />
        </div>
        <Link href="/ai-generator" className="btn-primary"><Plus className="w-4 h-4" /> Tạo mới</Link>
        <button className="btn-secondary"><Upload className="w-4 h-4" /> Nhập nội dung</button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`chip ${filter === f.value ? "chip-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="chip relative">
            <Filter className="w-4 h-4" /> Bộ lọc
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
          </button>
          <select className="chip pr-8">
            <option>Sắp xếp: Mới nhất</option>
            <option>Sắp xếp: Cũ nhất</option>
            <option>Sắp xếp: Tương tác cao</option>
          </select>
          <div className="flex border border-ink-200 rounded-lg p-0.5 bg-white">
            <button className="px-2.5 py-1.5 rounded bg-brand-50 text-brand-700"><LayoutGrid className="w-4 h-4" /></button>
            <button className="px-2.5 py-1.5 rounded text-ink-500"><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((c) => (
          <div key={c.id} className="card-soft overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={c.image} alt={c.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded-md p-1.5">
                {c.kind === "video" || c.kind === "reel" ? (
                  <PlayCircle className="w-4 h-4 text-ink-700" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-ink-700" />
                )}
              </div>
              {c.durationSec && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {String(Math.floor(c.durationSec / 60)).padStart(2, "0")}:{String(c.durationSec % 60).padStart(2, "0")}
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold line-clamp-1">{c.title}</div>
              <div className="text-xs text-ink-500 mt-1">
                {new Date(c.scheduledAt).toLocaleDateString("vi-VN")} {"  "}
                {new Date(c.scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5 text-xs text-ink-700">
                  <PlatformIcon platform={c.platform} size={14} />
                  {platformLabel(c.platform)}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <button className="p-1 rounded hover:bg-ink-100"><MoreHorizontal className="w-4 h-4 text-ink-500" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
