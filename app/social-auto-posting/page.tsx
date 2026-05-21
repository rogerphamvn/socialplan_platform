import { Facebook, Instagram, Youtube, CheckCircle2, AlertCircle, Plus, Zap } from "lucide-react";

const accounts = [
  { platform: "Facebook", icon: Facebook, name: "Aniki Japanese", handle: "@anikijapan", color: "#1877f2", connected: true, posts: 142 },
  { platform: "Instagram", icon: Instagram, name: "aniki.restaurant", handle: "@aniki.restaurant", color: "#e1306c", connected: true, posts: 98 },
  { platform: "TikTok", icon: null, name: "Aniki Official", handle: "@aniki.official", color: "#000", connected: true, posts: 67 },
  { platform: "YouTube", icon: Youtube, name: "Aniki Channel", handle: "@anikichannel", color: "#ff0000", connected: false, posts: 0 },
];

const queue = [
  { time: "Hôm nay · 11:00", platform: "TikTok", title: "Unagi Don – Nóng hổi", status: "queued" },
  { time: "Hôm nay · 15:00", platform: "Instagram", title: "Combo Lunch Set", status: "queued" },
  { time: "Hôm nay · 19:00", platform: "Facebook", title: "Giảm 20% sau 21:00", status: "queued" },
  { time: "Hôm nay · 20:30", platform: "YouTube", title: "Aniki & Kenji đi ăn đêm", status: "waiting_approval" },
  { time: "Ngày mai · 10:00", platform: "Facebook", title: "Bài viết: Món chay", status: "queued" },
];

export default function SocialAutoPostingPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Social Auto Posting</h1>
          <p className="text-ink-500 text-sm mt-1">Đấu nối tài khoản social và tự động đăng theo lịch</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" /> Kết nối tài khoản</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Tài khoản đã kết nối</h3>
          <div className="space-y-3">
            {accounts.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.platform} className="flex items-center gap-3 p-3 rounded-card border border-ink-100 hover:bg-ink-50/40">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: a.color }}>
                    {Icon ? <Icon className="w-5 h-5" /> : <span className="font-bold text-sm">TT</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{a.name}</div>
                    <div className="text-xs text-ink-500">{a.platform} · {a.handle} · {a.posts} bài đã đăng</div>
                  </div>
                  {a.connected ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="w-4 h-4" /> Đã kết nối</span>
                  ) : (
                    <button className="btn-secondary py-1.5">Kết nối</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Hàng đợi đăng bài</h3>
          <div className="space-y-3">
            {queue.map((q, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-card border border-ink-100">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{q.title}</div>
                  <div className="text-xs text-ink-500">{q.time} · {q.platform}</div>
                </div>
                {q.status === "queued" ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-700">Trong hàng đợi</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                    <AlertCircle className="w-3 h-3" /> Chờ duyệt
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-1">Quy tắc tự động</h3>
        <p className="text-sm text-ink-500 mb-4">Đặt rule để hệ thống tự repost / cross-post nội dung giữa các kênh.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Cross-post FB → IG", desc: "Bài Facebook tự động đăng lên Instagram sau 30 phút", active: true },
            { title: "Reel → Shorts", desc: "Reel TikTok thành công > 10K view tự động repost lên Shorts", active: true },
            { title: "Story handoff", desc: "Story IG hết 24h tự highlight nếu engagement > 200", active: false },
          ].map((r) => (
            <div key={r.title} className="p-4 rounded-card border border-ink-100">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{r.title}</div>
                <div className={`w-9 h-5 rounded-full p-0.5 ${r.active ? "bg-brand-600" : "bg-ink-200"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${r.active ? "translate-x-4" : ""}`} />
                </div>
              </div>
              <p className="text-xs text-ink-500 mt-2">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
