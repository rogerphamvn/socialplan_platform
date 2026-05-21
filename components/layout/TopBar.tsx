"use client";
import { Bell, Cloud } from "lucide-react";
import { formatDateVi } from "@/lib/utils";

export function TopBar() {
  const today = formatDateVi(new Date());
  return (
    <header className="h-14 flex items-center justify-end gap-6 px-8 border-b border-ink-100 bg-white/60 backdrop-blur">
      <div className="hidden md:flex items-center gap-2 text-sm text-ink-600">
        <Cloud className="w-4 h-4 text-brand-500" />
        <span className="font-medium text-ink-900">29°C</span>
        <span className="text-ink-300">·</span>
        <span>TP. Hồ Chí Minh</span>
      </div>
      <div className="hidden md:block text-sm text-ink-600 capitalize">{today}</div>
      <button className="relative p-2 rounded-full hover:bg-ink-50">
        <Bell className="w-5 h-5 text-ink-700" />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
          3
        </span>
      </button>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-200 to-brand-500 ring-2 ring-white shadow-card" />
    </header>
  );
}
