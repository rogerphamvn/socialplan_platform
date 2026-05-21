import { Eye, Heart, MousePointerClick, ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { PlatformIcon, platformLabel } from "@/components/ui/PlatformIcon";
import type { Platform } from "@/data/mock";

const channelData: { p: Platform; reach: number; engagement: number; eRate: number; delta: number }[] = [
  { p: "facebook",  reach: 124_500, engagement: 5_820, eRate: 4.7, delta: 12.4 },
  { p: "instagram", reach:  86_300, engagement: 4_410, eRate: 5.1, delta: 18.2 },
  { p: "tiktok",    reach:  72_900, engagement: 6_700, eRate: 9.2, delta: 24.7 },
  { p: "youtube",   reach:  18_400, engagement:   980, eRate: 5.3, delta:  3.1 },
];

const topPosts = [
  { title: "Unagi Don – Bữa trưa quốc dân", platform: "tiktok" as Platform, reach: 42_000, engage: 3_200 },
  { title: "Giảm 20% sau 21:00 - LAST DATE DEAL", platform: "facebook" as Platform, reach: 38_500, engage: 2_100 },
  { title: "Combo Lunch Set 2 người 599K", platform: "instagram" as Platform, reach: 28_700, engage: 1_650 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-ink-500 text-sm mt-1">Báo cáo hiệu quả marketing đa kênh, cập nhật theo giờ</p>
        </div>
        <select className="chip pr-8">
          <option>7 ngày qua</option>
          <option>30 ngày qua</option>
          <option>Tháng này</option>
          <option>Tuỳ chỉnh</option>
        </select>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: "Lượt tiếp cận", value: formatNumber(302_100), delta: 28.5 },
          { icon: Heart, label: "Tương tác", value: formatNumber(17_910), delta: 18.7 },
          { icon: MousePointerClick, label: "Click vào link", value: formatNumber(4_280), delta: 21.3 },
          { icon: ShoppingBag, label: "Đơn hàng", value: "186", delta: 16.4 },
        ].map((m) => {
          const Icon = m.icon;
          const positive = m.delta > 0;
          return (
            <div key={m.label} className="card p-4">
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5 text-ink-400" />
                <span className={`text-xs font-medium inline-flex items-center gap-0.5 ${positive ? "text-emerald-600" : "text-rose-600"}`}>
                  {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {m.delta}%
                </span>
              </div>
              <div className="text-xs text-ink-500 mt-2">{m.label}</div>
              <div className="text-2xl font-bold mt-0.5">{m.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-1">Hiệu quả theo kênh</h3>
          <p className="text-xs text-ink-500 mb-4">Engagement rate so với 7 ngày trước</p>
          <div className="space-y-3">
            {channelData.map((c) => (
              <div key={c.p}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <PlatformIcon platform={c.p} size={16} />
                    <span className="font-medium">{platformLabel(c.p)}</span>
                    <span className="text-ink-500 text-xs">· Reach {formatNumber(c.reach)} · Eng {formatNumber(c.engagement)}</span>
                  </div>
                  <div className="text-sm font-bold">
                    {c.eRate}% <span className="text-xs text-emerald-600 font-medium">↑ {c.delta}%</span>
                  </div>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, c.eRate * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Top 3 nội dung</h3>
          <div className="space-y-3">
            {topPosts.map((p, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-ink-100 last:border-0 last:pb-0">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                  <div className="text-xs text-ink-500 mt-1 flex items-center gap-2">
                    <PlatformIcon platform={p.platform} size={12} /> {platformLabel(p.platform)}
                    · {formatNumber(p.reach)} reach · {formatNumber(p.engage)} eng
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
