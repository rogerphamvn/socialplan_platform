import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const jp = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-jp", display: "swap", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Socialplan — Marketing OS for brands",
  description:
    "Tất cả team marketing trong một nơi. Lên plan social, tạo content AI, đấu nối Facebook / YouTube / TikTok, theo dõi campaign và report theo thời gian thực.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${display.variable} ${jp.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
