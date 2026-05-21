import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon, Rocket, PlayCircle, MessageSquare, Star,
  ArrowRight, Plus, Sparkles, ImageIcon, Send, FileEdit,
  Eye, Heart, MousePointerClick, ShoppingBag,
} from "lucide-react";
import { CONTENT_TODAY, CAMPAIGNS, REVIEWS_LATEST } from "@/data/mock";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrencyVND, formatNumber } from "@/lib/utils";

const heroStats = [
  { icon: CalendarIcon, label: "Bài sẽ đăng hôm nay", value: 3, action: "Xem chi tiết", href: "/calendar", bg: "bg-rose-50", color: "text-rose-600" },
  { icon: Rocket, label: "Campaign đang chạy", value: 1, action: "Xem ngay", href: "/campaigns", bg: "bg-emerald-50", color: "text-emerald-600" },
  { icon: PlayCircle, label: "Video pending", value: 2, action: "Duyệt ngay", href: "/content-studio", bg: "bg-amber-50", color: "text-amber-600" },
  { icon: MessageSquare, label: "Review mới", value: 2, action: "Xem ngay", href: "/analytics", bg: "bg-violet-50", color: "text-violet-600" },
  { icon: Star, label: "Google rating", value: 4.7, action: "Xem đánh giá", href: "/local-marketing", bg: "bg-orange-50", color: "text-orange-500" },
];

const quickActions = [
  { icon: FileEdit, label: "Tạo post mới", sub: "Chuẩn bị nội dung", href: "/content-studio" },
  { icon: Sparkles, label: "Generate AI", sub: "Ý tưởng, caption, script", href: "/ai-generator" },
  { icon: ImageIcon, label: "Tạo poster", sub: "Thiết kế nhanh", href: "/content-studio" },
  { icon: CalendarIcon, label: "Schedule all", sub: "Lên lịch hàng loạt", href: "/calendar" },
  { icon: Rocket, label: "Launch campaign", sub: "Tạo chiến dịch mới", href: "/campaigns" },
];

export default function HomePage() {
  const campaign = CAMPAIGNS[0];
  const review = REVIEWS_LATEST[0];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <header>
        <h1 className="text-3xl font-display font-bold text-ink-900 flex items-center gap-2">
          Chào Aniki! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-ink-500 mt-1 text-sm">Hôm nay chúng ta sẽ tạo nên điều gì?</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {heroStats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href} className="card p-4 hover:shadow-soft transition-shadow group">
              <div className={`w-11 h-11 rounded-full ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-xs text-ink-500 mb-1 leading-tight">{s.label}</div>
              <div className="text-2xl font-bold text-ink-900 leading-none">{s.value}</div>
              <div className="text-xs text-brand-600 font-medium mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {s.action} <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Nội dung hôm nay</h2>
          <Link href="/calendar" className="text-sm text-brand-600 font-medium inline-flex items-center gap-1">
            Xem calendar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CONTENT_TODAY.map((c) => (
            <div key={c.id} className="card-soft overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3]">
                <Image src={c.image} alt={c.title} fill className="object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-medium">
                  {new Date(c.scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="absolute top-2 right-2">
                  <PlatformIcon platform={c.platform} withBg size={14} />
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="text-sm font-medium text-ink-900 line-clamp-1">{c.title}</div>
                <div className="text-xs text-ink-500 line-clamp-1 mt-0.5">{c.description}</div>
                <div className="mt-2"><StatusBadge status={c.status} /></div>
              </div>
            </div>
          ))}
          <Link href="/content-studio" className="card-soft border-dashed border-2 border-ink-200 flex flex-col items-center justify-center text-center p-6 hover:border-brand-300 hover:text-brand-600 text-ink-500 transition-colors">
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium">Tạo nội dung mới</div>
          </Link>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center gap-5 flex-wrap">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} href={a.href} className="flex items-center gap-3 p-3 rounded-card border border-ink-100 hover:border-brand-200 hover:bg-brand-50/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{a.label}</div>
                    <div className="text-xs text-ink-500 truncate">{a.sub}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Campaign đang chạy</h3>
          <Link href={`/campaigns/${campaign.slug}`} className="flex items-start gap-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <Image src={campaign.cover} alt={campaign.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900">{campaign.name}</div>
              <div className="text-xs text-ink-500 mt-0.5">
                {new Date(campaign.startDate).toLocaleDateString("vi-VN")} – {new Date(campaign.endDate).toLocaleDateString("vi-VN")}
              </div>
              <div className="mt-2 text-xs text-ink-500">
                Ngân sách đã dùng
                <div className="text-sm font-semibold text-ink-900 mt-0.5">
                  {formatCurrencyVND(campaign.spent)} <span className="text-ink-400 font-normal">/ {formatCurrencyVND(campaign.budget)}</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: `${Math.round(campaign.spent / campaign.budget * 100)}%` }} />
              </div>
              <div className="mt-2 text-xs text-brand-600 font-medium inline-flex items-center gap-1">
                {Math.round(campaign.spent / campaign.budget * 100)}% · Xem chi tiết <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Hiệu quả 7 ngày qua</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Eye, label: "Lượt tiếp cận", value: formatNumber(campaign.metrics.reach), delta: campaign.deltas.reach },
              { icon: Heart, label: "Lượt tương tác", value: formatNumber(campaign.metrics.engagement), delta: campaign.deltas.engagement },
              { icon: MousePointerClick, label: "Click vào link", value: formatNumber(campaign.metrics.clicks), delta: campaign.deltas.clicks },
              { icon: ShoppingBag, label: "Đơn hàng", value: campaign.metrics.orders, delta: campaign.deltas.orders },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label}>
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <Icon className="w-3.5 h-3.5" /> {m.label}
                  </div>
                  <div className="text-lg font-bold mt-1">{m.value}</div>
                  <div className="text-xs text-emerald-600 font-medium mt-0.5">↑ {m.delta}%</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Review mới nhất</h3>
          <div className="flex items-start gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
              <Image src={review.avatar} alt={review.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{review.name}</div>
                <div className="flex">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-ink-500 ml-auto">{review.timeAgo}</div>
              </div>
              <p className="text-sm text-ink-700 mt-2 leading-relaxed">{review.body}</p>
            </div>
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
              <Image src={review.photo} alt="review" fill className="object-cover" />
            </div>
          </div>
          <Link href="/analytics" className="mt-4 text-sm text-brand-600 font-medium inline-flex items-center gap-1">
            Xem tất cả review <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
