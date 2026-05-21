import { Star, MapPin, MessageSquare, Phone, ExternalLink, TrendingUp } from "lucide-react";

const locations = [
  { name: "Aniki Quận 1", address: "123 Lê Lợi, Quận 1, TP. HCM", rating: 4.7, reviews: 1240, calls: 86, directions: 312 },
  { name: "Aniki Quận 7", address: "45 Nguyễn Văn Linh, Quận 7", rating: 4.6, reviews: 562, calls: 41, directions: 180 },
  { name: "Aniki Thủ Đức", address: "88 Võ Văn Ngân, TP. Thủ Đức", rating: 4.5, reviews: 218, calls: 22, directions: 95 },
];

const reviews = [
  { name: "Minh Anh", rating: 5, time: "2 giờ trước", body: "Không gian ấm cúng, món ăn ngon, nhân viên dễ thương!" },
  { name: "Hoàng Long", rating: 4, time: "1 ngày trước", body: "Unagi Don đậm vị, hơi mặn một chút nhưng tổng thể ok." },
  { name: "Quỳnh Như", rating: 5, time: "2 ngày trước", body: "Ramen nóng, sashimi tươi. Sẽ quay lại lần nữa." },
];

export default function LocalMarketingPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <header>
        <h1 className="text-2xl font-display font-bold">Local Marketing</h1>
        <p className="text-ink-500 text-sm mt-1">Quản lý các điểm bán, Google Business, đánh giá khách hàng</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "Google rating", value: "4.7", sub: "Trung bình 3 điểm bán", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Lượt review tháng này", value: "326", sub: "+18% so với tháng trước", icon: MessageSquare, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Click chỉ đường", value: "587", sub: "+24% so với tháng trước", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-full ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xs text-ink-500">{s.label}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-ink-500 mt-1">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Các điểm bán</h3>
          <div className="space-y-3">
            {locations.map((l) => (
              <div key={l.name} className="p-4 rounded-card border border-ink-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{l.name}</div>
                    <div className="text-xs text-ink-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {l.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-bold">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {l.rating}
                    </div>
                    <div className="text-xs text-ink-500">{l.reviews} review</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-ink-100">
                  <Stat icon={Phone} label="Cuộc gọi" value={l.calls} />
                  <Stat icon={MapPin} label="Chỉ đường" value={l.directions} />
                  <Stat icon={ExternalLink} label="Click website" value={l.directions * 2} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Review mới nhất</h3>
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border-b border-ink-100 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs">
                    {r.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                  <div className="text-xs text-ink-500">{r.time}</div>
                </div>
                <p className="text-sm text-ink-700 leading-relaxed">{r.body}</p>
                <button className="text-xs text-brand-600 font-medium mt-2">Trả lời</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <div>
      <div className="text-[10px] text-ink-500 flex items-center gap-1 uppercase"><Icon className="w-3 h-3" /> {label}</div>
      <div className="text-sm font-bold mt-0.5">{value}</div>
    </div>
  );
}
