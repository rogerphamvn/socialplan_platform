import { Settings as SettingsIcon, User, Key, Link as LinkIcon, Bell, CreditCard } from "lucide-react";
import Link from "next/link";

const sections = [
  { icon: User, title: "Hồ sơ thương hiệu", desc: "Tên brand, ngành, mô tả, voice", href: "#" },
  { icon: Key, title: "API Keys", desc: "OpenRouter, Facebook, YouTube, TikTok", href: "#" },
  { icon: LinkIcon, title: "MCP Integration", desc: "Đấu nối website qua MCP server endpoint", href: "/docs/mcp" },
  { icon: Bell, title: "Thông báo", desc: "Email, Slack, in-app", href: "#" },
  { icon: CreditCard, title: "Gói dịch vụ", desc: "Pro Plan · Đến hạn 28/06/2025", href: "#" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5 max-w-[1000px]">
      <header>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" /> Settings
        </h1>
        <p className="text-ink-500 text-sm mt-1">Cấu hình thương hiệu, API và tích hợp</p>
      </header>

      <div className="card divide-y divide-ink-100">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.title} href={s.href} className="flex items-center gap-4 p-5 hover:bg-ink-50/40">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-ink-500">{s.desc}</div>
              </div>
              <span className="text-ink-400">›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
