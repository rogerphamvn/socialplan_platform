"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowRight, Flag,
} from "lucide-react";
import { CALENDAR_MONTH } from "@/data/mock";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { cn } from "@/lib/utils";

const DAY_HEADERS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const kindColors = {
  post: "bg-emerald-50 text-emerald-800 border-emerald-200",
  reel: "bg-rose-50 text-rose-800 border-rose-200",
  story: "bg-purple-50 text-purple-800 border-purple-200",
  video: "bg-amber-50 text-amber-800 border-amber-200",
  campaign: "bg-sky-50 text-sky-800 border-sky-200",
} as const;

const kindLabel = {
  post: "Bài viết",
  reel: "Reel / TikTok",
  story: "Story",
  video: "Video",
  campaign: "Campaign",
} as const;

export default function CalendarPage() {
  const [year, setYear] = useState(CALENDAR_MONTH.year);
  const [month, setMonth] = useState(CALENDAR_MONTH.month);
  const [view, setView] = useState<"week" | "month" | "list">("month");
  const today = new Date();
  const todayDay = today.getDate();

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const goPrev = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); } else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); } else setMonth(month + 1);
  };

  const upcoming = CALENDAR_MONTH.events.filter((e) => e.day >= todayDay).slice(0, 5);

  return (
    <div className="space-y-5 max-w-[1500px]">
      <header>
        <h1 className="text-2xl font-display font-bold">Content Calendar</h1>
        <p className="text-ink-500 text-sm mt-1">Lên lịch & quản lý nội dung theo tháng</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()); }} className="btn-secondary py-2">
                Hôm nay
              </button>
              <button onClick={goPrev} className="p-2 rounded-lg border border-ink-200 hover:bg-ink-50"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={goNext} className="p-2 rounded-lg border border-ink-200 hover:bg-ink-50"><ChevronRight className="w-4 h-4" /></button>
              <div className="ml-3 flex items-center gap-2 px-3 py-2 border border-ink-200 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-ink-500" />
                <span className="text-sm font-medium">{MONTHS_VI[month - 1]}, {year}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 border border-ink-200 rounded-lg p-0.5">
              {(["week", "month", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm font-medium",
                    view === v ? "bg-brand-50 text-brand-700" : "text-ink-600",
                  )}
                >
                  {v === "week" ? "Tuần" : v === "month" ? "Tháng" : "Danh sách"}
                </button>
              ))}
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-xs font-medium text-ink-500 text-center pb-2">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-px bg-ink-100 border border-ink-100 rounded-xl overflow-hidden">
            {grid.map((cell, i) => {
              const dayEvents = cell.inMonth
                ? CALENDAR_MONTH.events.filter((e) => e.day === cell.day)
                : [];
              const isToday = cell.inMonth && cell.day === todayDay && month === today.getMonth() + 1 && year === today.getFullYear();

              return (
                <div
                  key={i}
                  className={cn(
                    "bg-white p-2 min-h-[110px] flex flex-col",
                    !cell.inMonth && "text-ink-300 bg-ink-50/40",
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-xs font-medium w-6 h-6 inline-flex items-center justify-center rounded-full",
                      isToday && "bg-brand-600 text-white",
                    )}>
                      {cell.day}
                    </span>
                  </div>
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <div
                        key={j}
                        className={cn(
                          "px-1.5 py-1 rounded text-[10px] font-medium border flex items-center gap-1",
                          kindColors[e.kind],
                        )}
                      >
                        <span className="font-semibold whitespace-nowrap">{e.time}</span>
                        <span className="truncate flex-1">{e.title}</span>
                        {e.kind === "campaign" ? (
                          <Flag className="w-2.5 h-2.5 shrink-0" />
                        ) : (
                          <PlatformIcon platform={e.platform} size={10} />
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-ink-500 pl-1.5">+{dayEvents.length - 3} nữa</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 flex-wrap text-xs text-ink-600">
            {(Object.keys(kindColors) as Array<keyof typeof kindColors>).map((k) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={cn("w-3 h-3 rounded-sm border", kindColors[k])} />
                {kindLabel[k]}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <aside className="card p-5">
          <h3 className="font-semibold mb-4">Sắp tới</h3>
          <div className="space-y-3">
            {upcoming.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-ink-100">
                  <Image
                    src={`https://images.unsplash.com/photo-${["1617196034796-73dfa7b1fd56", "1554995207-c18c203602cb", "1611143669185-af224c5e3252", "1576866206061-fee32bf06e84", "1565299624946-b28f40a0ae38"][i % 5]}?auto=format&fit=crop&w=200&q=70`}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-ink-500">
                    Ngày {e.day}/{month} · {e.time}
                  </div>
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {e.title}
                    {e.kind !== "campaign" ? <PlatformIcon platform={e.platform} size={12} /> : <Flag className="w-3 h-3 text-sky-600" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary w-full mt-5">
            Xem tất cả lịch <ArrowRight className="w-4 h-4" />
          </button>
        </aside>
      </div>
    </div>
  );
}

function buildMonthGrid(year: number, month: number) {
  // month: 1..12. Monday-start.
  const first = new Date(year, month - 1, 1);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = Mon
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const cells: { day: number; inMonth: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstWeekday + 1, inMonth: false });
  // Ensure 6 rows
  while (cells.length < 42) cells.push({ day: cells.length - daysInMonth - firstWeekday + 1, inMonth: false });
  return cells.slice(0, 42);
}
