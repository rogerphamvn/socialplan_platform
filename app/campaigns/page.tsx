import Image from "next/image";
import Link from "next/link";
import { Plus, Eye, Heart, MousePointerClick, ShoppingBag } from "lucide-react";
import { CAMPAIGNS } from "@/data/mock";
import { formatCurrencyVND, formatNumber } from "@/lib/utils";

export default function CampaignsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Campaigns</h1>
          <p className="text-ink-500 text-sm mt-1">Quản lý chiến dịch marketing đa kênh</p>
        </div>
        <Link href="/campaigns/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Tạo chiến dịch
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {CAMPAIGNS.map((c) => {
          const pct = Math.round(c.spent / c.budget * 100);
          return (
            <Link key={c.id} href={`/campaigns/${c.slug}`} className="card p-5 hover:shadow-soft transition-shadow">
              <div className="flex gap-5">
                <div className="relative w-32 h-32 rounded-card overflow-hidden shrink-0">
                  <Image src={c.cover} alt={c.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đang chạy
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-sm text-ink-600 line-clamp-2 mt-1">{c.goal}</p>
                  <div className="text-xs text-ink-500 mt-3">
                    {new Date(c.startDate).toLocaleDateString("vi-VN")} – {new Date(c.endDate).toLocaleDateString("vi-VN")} · {c.ownerName}
                  </div>
                  <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-ink-500 mt-1">
                    Đã chi <span className="font-semibold text-ink-900">{formatCurrencyVND(c.spent)}</span> / {formatCurrencyVND(c.budget)} · {pct}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-ink-100">
                {[
                  { icon: Eye, label: "Reach", value: formatNumber(c.metrics.reach) },
                  { icon: Heart, label: "Engage", value: formatNumber(c.metrics.engagement) },
                  { icon: MousePointerClick, label: "Clicks", value: formatNumber(c.metrics.clicks) },
                  { icon: ShoppingBag, label: "Orders", value: c.metrics.orders },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label}>
                      <div className="flex items-center gap-1 text-[10px] text-ink-500 uppercase"><Icon className="w-3 h-3" /> {m.label}</div>
                      <div className="text-sm font-bold mt-0.5">{m.value}</div>
                    </div>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
