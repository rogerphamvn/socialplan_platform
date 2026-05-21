import { Facebook, Instagram, Youtube } from "lucide-react";
import type { Platform } from "@/data/mock";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
  </svg>
);

const platformConfig: Record<Platform, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  facebook: { icon: Facebook, color: "#1877f2", bg: "bg-[#1877f2]", label: "Facebook" },
  instagram: { icon: Instagram, color: "#e1306c", bg: "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600", label: "Instagram" },
  tiktok: { icon: TikTokIcon, color: "#111111", bg: "bg-ink-900", label: "TikTok" },
  youtube: { icon: Youtube, color: "#ff0000", bg: "bg-red-600", label: "YouTube" },
  shorts: { icon: Youtube, color: "#ff0000", bg: "bg-red-600", label: "Shorts" },
};

export function PlatformIcon({
  platform, size = 16, withBg = false, className,
}: { platform: Platform; size?: number; withBg?: boolean; className?: string }) {
  const c = platformConfig[platform];
  const Icon = c.icon;
  if (withBg) {
    return (
      <div className={`${c.bg} rounded-md p-1 inline-flex items-center justify-center ${className ?? ""}`}>
        <Icon style={{ width: size, height: size }} className="text-white" />
      </div>
    );
  }
  return <Icon style={{ width: size, height: size, color: c.color }} className={className} />;
}

export function platformLabel(p: Platform) {
  return platformConfig[p].label;
}
export function platformColor(p: Platform) {
  return platformConfig[p].color;
}
