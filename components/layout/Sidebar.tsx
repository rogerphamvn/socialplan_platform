"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Image as ImageIcon, Sparkles, Calendar, Megaphone,
  Send, MapPin, BarChart3, FolderOpen, Settings, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/content-studio", label: "Content Studio", icon: ImageIcon },
  { href: "/ai-generator", label: "AI Generator", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/social-auto-posting", label: "Social Auto Posting", icon: Send },
  { href: "/local-marketing", label: "Local Marketing", icon: MapPin },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/brand-assets", label: "Brand Assets", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-ink-100 bg-white flex flex-col">
      <div className="px-6 pt-6 pb-4 border-b border-ink-100">
        <Link href="/" className="block">
          <div className="font-display font-bold text-3xl text-brand-700 tracking-wider leading-none">
            ANIKI
          </div>
          <div className="font-jp text-xs text-brand-600 mt-1 tracking-[0.4em]">アニキ</div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", active && "nav-item-active")}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 p-3 border border-ink-200 rounded-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
          AJ
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">Aniki Japanese Restaurant</div>
          <div className="text-xs text-ink-500">Owner · Pro Plan</div>
        </div>
        <ChevronDown className="w-4 h-4 text-ink-400" />
      </div>
    </aside>
  );
}
