import type { ContentStatus } from "@/data/mock";

const map: Record<ContentStatus, { label: string; cls: string }> = {
  scheduled: { label: "Đã lên lịch", cls: "bg-emerald-50 text-emerald-700" },
  published: { label: "Đã đăng", cls: "bg-emerald-50 text-emerald-700" },
  pending_review: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700" },
  draft: { label: "Bản nháp", cls: "bg-sky-50 text-sky-700" },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const c = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {c.label}
    </span>
  );
}
