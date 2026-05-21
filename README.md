# Socialplan Platform

> Marketing OS cho thương hiệu Việt — lên plan social, sinh content AI, đấu nối Facebook / Instagram / TikTok / YouTube, theo dõi campaign & analytics, tất cả trong một nơi.

Demo: https://happycandlevn-2257.vercel.app

## Tính năng

- **Home dashboard** — tổng quan bài hôm nay, campaign đang chạy, hiệu quả 7 ngày, review mới
- **Content Studio** — thư viện nội dung đã/sẽ đăng, filter theo loại + nền tảng
- **AI Generator** — sinh idea / caption / kịch bản / hashtag / CTA / concept ảnh qua **OpenRouter** (GPT-5, Gemini 2.5 Pro, Claude)
- **Calendar** — lịch tháng với 35+ event mẫu, drag-friendly UI
- **Campaigns** — list + detail page (UNAGI MONTH), phân bổ ngân sách, timeline
- **Social Auto Posting** — quản lý tài khoản kết nối, hàng đợi đăng bài, rule auto cross-post
- **Local Marketing** — Google Business: rating, review, click chỉ đường theo điểm bán
- **Analytics** — báo cáo đa kênh, top nội dung, engagement rate
- **Brand Assets** — kho hình / video / template
- **MCP server** — `/api/mcp` cho website doanh nghiệp đấu nối qua JSON-RPC

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3
- OpenRouter (chat completions) cho content AI
- Mock JSON in-repo cho data (dễ chuyển sang Vercel KV/Postgres)
- MCP-compatible HTTP endpoint

## Setup local

```bash
cp .env.example .env.local
# Sửa OPENROUTER_API_KEY trong .env.local
npm install
npm run dev   # http://localhost:3000
```

## Deploy Vercel

Project name: `happycandlevn-2257`

Env vars cần set trên Vercel:

| Key | Mô tả |
|-----|-------|
| `OPENROUTER_API_KEY` | OpenRouter key (bắt buộc cho /api/ai/generate) |
| `OPENROUTER_MODEL_TEXT` | default `openai/gpt-5` |
| `OPENROUTER_MODEL_VISION` | default `google/gemini-2.5-pro` |
| `MCP_INTEGRATION_TOKEN` | token bí mật cho website client gọi `/api/mcp` |

## MCP integration

Xem `/docs/mcp` để biết cách website doanh nghiệp (vd. aniki.com) đấu nối qua endpoint MCP.

```bash
curl -X POST https://happycandlevn-2257.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-Socialplan-Token: $MCP_INTEGRATION_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
