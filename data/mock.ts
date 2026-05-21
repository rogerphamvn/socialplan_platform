export type Platform = "facebook" | "instagram" | "tiktok" | "youtube" | "shorts";
export type ContentStatus = "scheduled" | "published" | "pending_review" | "draft";
export type ContentKind = "post" | "reel" | "story" | "poster" | "video";

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  kind: ContentKind;
  platform: Platform;
  status: ContentStatus;
  scheduledAt: string;
  image: string;
  durationSec?: number;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  status: "running" | "draft" | "ended";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  cover: string;
  ownerName: string;
  goal: string;
  allocation: { channel: string; amount: number; color: string }[];
  metrics: { reach: number; engagement: number; clicks: number; revenue: number; orders: number };
  deltas: { reach: number; engagement: number; clicks: number; revenue: number; orders: number };
  timeline: { date: string; title: string; note: string; done: boolean }[];
}

export interface Project {
  id: string;
  name: string;
  brand: string;
  mcpEndpoint: string;
  description: string;
}

// ---------------------------------------------------------------------------
export const PROJECTS: Project[] = [
  {
    id: "aniki",
    name: "Aniki Japanese Restaurant",
    brand: "Aniki",
    mcpEndpoint: "https://aniki.com/api/mcp",
    description: "Chuỗi nhà hàng Nhật Bản đậm vị, mở rộng tại TP. HCM",
  },
  {
    id: "tinhmo",
    name: "Tinh Mơ Skincare",
    brand: "Tinh Mơ",
    mcpEndpoint: "https://tinhmo.com/api/mcp",
    description: "Thương hiệu skincare clean-beauty Việt Nam",
  },
];

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const CONTENT_TODAY: ContentItem[] = [
  {
    id: "c1",
    title: "Unagi Don – Nóng hổi",
    description: "Cơm lươn Nhật Bản chuẩn vị",
    kind: "post",
    platform: "tiktok",
    status: "scheduled",
    scheduledAt: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    image: img("photo-1617196034796-73dfa7b1fd56"),
  },
  {
    id: "c2",
    title: "Combo Lunch Set",
    description: "Dành cho dân văn phòng",
    kind: "post",
    platform: "instagram",
    status: "scheduled",
    scheduledAt: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    image: img("photo-1579871494447-9811cf80d66c"),
  },
  {
    id: "c3",
    title: "Giảm 20% sau 21:00",
    description: "Ăn tối muộn – deal ngon",
    kind: "poster",
    platform: "facebook",
    status: "scheduled",
    scheduledAt: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    image: img("photo-1565299624946-b28f40a0ae38"),
  },
  {
    id: "c4",
    title: "Aniki & Kenji đi ăn đêm",
    description: "Ramen nóng hổi",
    kind: "video",
    platform: "youtube",
    status: "pending_review",
    scheduledAt: new Date(new Date().setHours(20, 30, 0, 0)).toISOString(),
    image: img("photo-1554995207-c18c203602cb"),
  },
];

export const CONTENT_LIBRARY: ContentItem[] = [
  ...CONTENT_TODAY.map((c) => ({ ...c, status: "published" as const })),
  {
    id: "l1",
    title: "Sushi cá hồi tươi ngon",
    kind: "post",
    platform: "instagram",
    status: "published",
    scheduledAt: "2025-05-25T11:00:00",
    image: img("photo-1579871494447-9811cf80d66c"),
  },
  {
    id: "l2",
    title: "Teaser món mới - Wagyu Yaki",
    kind: "video",
    platform: "facebook",
    status: "published",
    scheduledAt: "2025-05-24T19:30:00",
    image: img("photo-1535473895227-bdecb20fb157"),
    durationSec: 45,
  },
  {
    id: "l3",
    title: "Ưu đãi sinh nhật tháng 5",
    kind: "poster",
    platform: "instagram",
    status: "pending_review",
    scheduledAt: "2025-05-24T09:00:00",
    image: img("photo-1464349095431-e9a21285b5f3"),
  },
  {
    id: "l4",
    title: "Quy trình làm sushi chuẩn Nhật",
    kind: "video",
    platform: "tiktok",
    status: "draft",
    scheduledAt: "2025-05-23T16:45:00",
    image: img("photo-1579871494447-9811cf80d66c"),
    durationSec: 30,
  },
  {
    id: "l5",
    title: "Set Dinner cho 2 người chỉ 599K",
    kind: "post",
    platform: "facebook",
    status: "published",
    scheduledAt: "2025-05-22T18:00:00",
    image: img("photo-1576866206061-fee32bf06e84"),
  },
  {
    id: "l6",
    title: "Aniki & Kenji – Behind the scene",
    kind: "reel",
    platform: "tiktok",
    status: "published",
    scheduledAt: "2025-05-22T20:00:00",
    image: img("photo-1554995207-c18c203602cb"),
  },
  {
    id: "l7",
    title: "Sashimi 5 loại đặc biệt",
    kind: "post",
    platform: "instagram",
    status: "published",
    scheduledAt: "2025-05-21T12:30:00",
    image: img("photo-1611143669185-af224c5e3252"),
  },
  {
    id: "l8",
    title: "WE ARE HIRING",
    kind: "poster",
    platform: "facebook",
    status: "draft",
    scheduledAt: "2025-05-20T10:00:00",
    image: img("photo-1517248135467-4c7edcad34c4"),
  },
];

export const CAMPAIGNS: Campaign[] = [
  {
    id: "unagi-month",
    slug: "unagi-month",
    name: "UNAGI MONTH",
    status: "running",
    startDate: "2025-05-01",
    endDate: "2025-05-31",
    budget: 250_000_000,
    spent: 195_250_000,
    cover: img("photo-1617196034796-73dfa7b1fd56"),
    ownerName: "Minh Anh",
    goal: "Tăng nhận diện thương hiệu, tăng lượt ghé cửa hàng và thúc đẩy doanh thu qua món Unagi.",
    allocation: [
      { channel: "Facebook Ads", amount: 120_000_000, color: "#1877f2" },
      { channel: "Instagram Ads", amount: 60_000_000, color: "#e1306c" },
      { channel: "Google Ads", amount: 40_000_000, color: "#34a853" },
      { channel: "TikTok Ads", amount: 20_000_000, color: "#111111" },
      { channel: "Khác", amount: 10_000_000, color: "#cf5546" },
    ],
    metrics: { reach: 245_200, engagement: 12_400, clicks: 3_100, revenue: 186_450_000, orders: 186 },
    deltas: { reach: 28.5, engagement: 18.7, clicks: 21.3, revenue: 0, orders: 16.4 },
    timeline: [
      { date: "2025-05-01", title: "Bắt đầu chiến dịch", note: "Triển khai nội dung và quảng cáo trên các kênh.", done: true },
      { date: "2025-05-08", title: "Đẩy mạnh giai đoạn 1", note: "Tăng ngân sách cho Facebook & Instagram Ads.", done: true },
      { date: "2025-05-20", title: "Tối ưu & A/B Testing", note: "Tối ưu nhóm quảng cáo, thử nghiệm thông điệp mới.", done: true },
      { date: "2025-05-31", title: "Kết thúc chiến dịch", note: "Tổng kết, đánh giá hiệu quả và báo cáo.", done: false },
    ],
  },
];

export const CALENDAR_MONTH = {
  year: 2025,
  month: 5,
  events: [
    { day: 1, time: "10:00", title: "Combo Lunch Set", kind: "post", platform: "facebook" },
    { day: 1, time: "20:00", title: "Reel: Unagi Don", kind: "reel", platform: "tiktok" },
    { day: 2, time: "17:00", title: "Hành trình Aniki", kind: "video", platform: "youtube" },
    { day: 3, time: "12:00", title: "Story: Hậu trường", kind: "story", platform: "instagram" },
    { day: 4, time: "11:00", title: "Quote: Nhật ngữ", kind: "post", platform: "facebook" },
    { day: 5, time: "10:00", title: "Bài viết: Món mới", kind: "post", platform: "facebook" },
    { day: 5, time: "18:30", title: "Story: Feedback", kind: "story", platform: "instagram" },
    { day: 6, time: "12:00", title: "Reel: Sashimi", kind: "reel", platform: "tiktok" },
    { day: 7, time: "19:00", title: "Video: Đầu bếp Aniki", kind: "video", platform: "youtube" },
    { day: 8, time: "10:00", title: "Mẹo ăn uống kiểu Nhật", kind: "post", platform: "facebook" },
    { day: 8, time: "20:00", title: "Story: Món mới", kind: "story", platform: "instagram" },
    { day: 10, time: "11:30", title: "Reel: Tempura", kind: "reel", platform: "tiktok" },
    { day: 10, time: "14:00", title: "Campaign: UPGRADE WEEKEND", kind: "campaign", platform: "facebook" },
    { day: 11, time: "10:00", title: "Bài viết: Ưu đãi tuần", kind: "post", platform: "facebook" },
    { day: 12, time: "10:00", title: "Bài viết: Không gian", kind: "post", platform: "facebook" },
    { day: 13, time: "18:00", title: "Story: Góc check-in", kind: "story", platform: "instagram" },
    { day: 14, time: "19:30", title: "Video: Món signature", kind: "video", platform: "youtube" },
    { day: 15, time: "12:00", title: "Reel: Bento Set", kind: "reel", platform: "tiktok" },
    { day: 16, time: "10:00", title: "Tips: Ăn sushi đúng cách", kind: "post", platform: "facebook" },
    { day: 17, time: "11:00", title: "Story: Mini game", kind: "story", platform: "instagram" },
    { day: 17, time: "16:00", title: "Campaign: MEMBER DAY", kind: "campaign", platform: "facebook" },
    { day: 19, time: "10:00", title: "Bài viết: Menu mới", kind: "post", platform: "facebook" },
    { day: 20, time: "12:00", title: "Reel: Chef Special", kind: "reel", platform: "tiktok" },
    { day: 21, time: "19:00", title: "Video: Review món", kind: "video", platform: "youtube" },
    { day: 22, time: "20:00", title: "Story: Khách hàng", kind: "story", platform: "instagram" },
    { day: 23, time: "10:00", title: "Bài viết: Lịch sự kiện", kind: "post", platform: "facebook" },
    { day: 24, time: "11:30", title: "Reel: How to eat", kind: "reel", platform: "tiktok" },
    { day: 25, time: "10:00", title: "Quote: Triết lý Aniki", kind: "post", platform: "facebook" },
    { day: 26, time: "10:00", title: "Bài viết: Sự kiện tháng", kind: "post", platform: "facebook" },
    { day: 27, time: "18:30", title: "Story: Hậu trường", kind: "story", platform: "instagram" },
    { day: 28, time: "19:00", title: "Video: Hành trình nguyên liệu", kind: "video", platform: "youtube" },
    { day: 28, time: "20:30", title: "Reel: Unagi Close-up", kind: "reel", platform: "tiktok" },
    { day: 29, time: "10:00", title: "Bài viết: Món chay", kind: "post", platform: "facebook" },
    { day: 30, time: "12:00", title: "Story: Feedback", kind: "story", platform: "instagram" },
    { day: 30, time: "18:00", title: "Campaign: FLASH SALE", kind: "campaign", platform: "facebook" },
  ] as Array<{
    day: number; time: string; title: string;
    kind: "post" | "reel" | "story" | "video" | "campaign";
    platform: Platform;
  }>,
};

export const REVIEWS_LATEST = [
  {
    id: "r1",
    name: "Minh Anh",
    rating: 5,
    timeAgo: "2 giờ trước",
    body: "Không gian ấm cúng, món ăn ngon, nhân viên dễ thương!",
    avatar: img("photo-1438761681033-6461ffad8d80"),
    photo: img("photo-1617196034796-73dfa7b1fd56"),
  },
];
