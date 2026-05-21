import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Share2, Download, Edit3, Calendar, Target, Activity, Wallet, UserCircle2,
  Eye, Heart, MousePointerClick, ShoppingBag, Wallet as WalletIcon, ChevronRight, Plus,
} from "lucide-react";
import { CAMPAIGNS } from "@/data/mock";
import { formatCurrencyVND, formatNumber } from "@/lib/utils";

export default async function CampaignDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = CAMPAIGNS.find((c) => c.slug === slug);
  if (!campaign) notFound();
  const pct = Math.round(campaign.spent / campaign.budget * 100);
  const daysLeft = Math.max(0, Math.ceil((+new Date(campaign.endDate) - Date.now()) / 86_400_000));

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Link href="/campaigns" className="hover:text-brand-600">Campaigns</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink-900 font-medium">{campaign.name}</span>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_350px] gap-6">
          <div className="relative aspect-square rounded-card overflow-hidden">
            <Image src={campaign.cover} alt={campaign.name} fill className="object-cover" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đang chạy
            </span>
            <h1 className="text-3xl font-display font-bold">{campaign.name}</h1>
            <p className="text-sm text-ink-600 leading-relaxed">{campaign.goal}</p>

            <div className="grid grid-cols-1 gap-3 mt-4">
              {[
                { icon: Calendar, label: "Thời gian diễn ra", value: `${new Date(campaign.startDate).toLocaleDateString("vi-VN")} – ${new Date(campaign.endDate).toLocaleDateString("vi-VN")} (Còn ${daysLeft} ngày)` },
                { icon: Target, label: "Mục tiêu chiến dịch", value: campaign.goal },
                { icon: Activity, label: "Trạng thái", value: "Đang chạy" },
                { icon: Wallet, label: "Ngân sách", value: formatCurrencyVND(campaign.budget) },
                { icon: UserCircle2, label: "Người phụ trách", value: campaign.ownerName },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="grid grid-cols-[180px_1fr] gap-3 items-start">
                    <div className="flex items-center gap-2 text-sm text-ink-500"><Icon className="w-4 h-4" /> {f.label}</div>
                    <div className="text-sm font-medium text-ink-900">{f.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget allocation card */}
          <div className="card-soft p-5 bg-ink-50/40 self-start">
            <h3 className="font-semibold mb-3">Phân bố ngân sách</h3>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-ink-500">Tổng ngân sách</span>
              <span className="font-bold">{formatCurrencyVND(campaign.budget)}</span>
            </div>
            <div className="space-y-2">
              {campaign.allocation.map((a) => {
                const p = Math.round(a.amount / campaign.budget * 100);
                return (
                  <div key={a.channel} className="grid grid-cols-[14px_1fr_auto_36px] items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-ink-700">{a.channel}</span>
                    <span className="font-medium">{formatCurrencyVND(a.amount)}</span>
                    <span className="text-ink-500 text-right">{p}%</span>
                  </div>
                );
              })}
            </div>
            <hr className="my-3 border-ink-200" />
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-ink-500">Tiến độ ngân sách</span>
              <span className="font-bold">{pct}%</span>
            </div>
            <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-ink-500 mt-2">Đã chi {formatCurrencyVND(campaign.spent)} / {formatCurrencyVND(campaign.budget)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button className="btn-secondary"><Share2 className="w-4 h-4" /> Chia sẻ báo cáo</button>
          <button className="btn-secondary"><Download className="w-4 h-4" /> Xuất báo cáo</button>
          <button className="btn-primary"><Edit3 className="w-4 h-4" /> Chỉnh sửa chiến dịch</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Eye, label: "Lượt tiếp cận", value: formatNumber(campaign.metrics.reach), delta: campaign.deltas.reach, bg: "bg-amber-50", color: "text-amber-600" },
          { icon: Heart, label: "Lượt tương tác", value: formatNumber(campaign.metrics.engagement), delta: campaign.deltas.engagement, bg: "bg-rose-50", color: "text-rose-600" },
          { icon: MousePointerClick, label: "Click vào link", value: formatNumber(campaign.metrics.clicks), delta: campaign.deltas.clicks, bg: "bg-sky-50", color: "text-sky-600" },
          { icon: WalletIcon, label: "Doanh thu", value: formatCurrencyVND(campaign.metrics.revenue), delta: 0, bg: "bg-emerald-50", color: "text-emerald-600" },
          { icon: ShoppingBag, label: "Đơn hàng", value: String(campaign.metrics.orders), delta: campaign.deltas.orders, bg: "bg-violet-50", color: "text-violet-600" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
                {m.delta > 0 && <span className="text-xs text-emerald-600 font-medium">↑ {m.delta}%</span>}
              </div>
              <div className="text-xs text-ink-500">{m.label}</div>
              <div className="text-xl font-bold mt-1">{m.value}</div>
              <div className="text-[10px] text-ink-400 mt-1">so với 7 ngày trước</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Nội dung & tài sản sử dụng</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Key Visual", sub: "UNAGI MONTH", img: "1617196034796-73dfa7b1fd56" },
              { label: "Banner khuyến mãi", sub: "Ưu đãi 20%", img: "1565299624946-b28f40a0ae38" },
              { label: "Video ngắn", sub: "Aniki & Kenji ăn lươn", img: "1554995207-c18c203602cb" },
              { label: "Ảnh sản phẩm", sub: "Combo Unagi", img: "1579871494447-9811cf80d66c" },
              { label: "Story IG", sub: "Behind the scene", img: "1576866206061-fee32bf06e84" },
            ].map((c) => (
              <div key={c.label} className="card-soft overflow-hidden">
                <div className="relative aspect-square">
                  <Image src={`https://images.unsplash.com/photo-${c.img}?auto=format&fit=crop&w=400&q=70`} alt={c.label} fill className="object-cover" />
                </div>
                <div className="p-2">
                  <div className="text-xs font-semibold truncate">{c.label}</div>
                  <div className="text-[10px] text-ink-500 truncate">{c.sub}</div>
                </div>
              </div>
            ))}
            <button className="card-soft border-dashed border-2 border-ink-200 flex flex-col items-center justify-center text-ink-500 hover:text-brand-600 hover:border-brand-300 text-xs aspect-square">
              <Plus className="w-5 h-5 mb-1" />
              Xem tất cả<br />23 nội dung
            </button>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Timeline chiến dịch</h3>
          <div className="space-y-4">
            {campaign.timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 ${t.done ? "bg-brand-600 border-brand-600" : "bg-white border-ink-300"}`} />
                  {i < campaign.timeline.length - 1 && <div className="flex-1 w-px bg-ink-200 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="text-xs text-ink-500">{new Date(t.date).toLocaleDateString("vi-VN")}</div>
                  <div className="font-semibold text-sm">{t.title}</div>
                  <div className="text-xs text-ink-600 mt-1">{t.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-ink-400 py-3">
        ↻ Dữ liệu được cập nhật lần cuối: 10:30 AM, 28/05/2025
      </div>
    </div>
  );
}
