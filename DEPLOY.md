# Deploy lên Vercel — checklist

> Code đã sẵn sàng. Chỉ cần 4 bước, ~2 phút.

## 1. Click link import 1-click

https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frogerphamvn%2Fsocialplan_platform&project-name=happycandlevn-2257&repository-name=socialplan_platform&env=OPENROUTER_API_KEY,MCP_INTEGRATION_TOKEN&envDescription=OpenRouter%20key%20cho%20AI%20Generator%20va%20MCP%20token%20cho%20website%20integration

Nếu không xài link trên: vào https://vercel.com/new → Import Git Repository → chọn `rogerphamvn/socialplan_platform`.

## 2. Cấu hình project

| Field | Value |
|---|---|
| Project Name | `happycandlevn-2257` |
| Framework | Next.js (auto-detected) |
| Branch | `claude/pending-request-QUx0g` |
| Root Directory | `./` |
| Build Command | `next build` (mặc định) |
| Install Command | `npm install` |
| Output Directory | `.next` (mặc định) |

## 3. Environment Variables (paste vào Vercel)

> ⚠️ KEY thật đã được gửi qua chat — paste vào Vercel, KHÔNG commit vào repo.

```
OPENROUTER_API_KEY=<paste key OpenRouter đã gửi qua chat>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=https://happycandlevn-2257.vercel.app
OPENROUTER_SITE_NAME=Socialplan Platform
OPENROUTER_MODEL_TEXT=openai/gpt-5
OPENROUTER_MODEL_VISION=google/gemini-2.5-pro
OPENROUTER_MODEL_FAST=anthropic/claude-haiku-4.5
MCP_INTEGRATION_TOKEN=dev-mcp-token-replace-with-strong-random
```

## 4. Click Deploy

Sau khi build xong (~2 phút):
- App live: https://happycandlevn-2257.vercel.app
- Preview / production URL: hiển thị trong Vercel dashboard

## Sau khi deploy

- Test AI Generator: vào `/ai-generator`, điền form, bấm "Tạo nội dung" → call OpenRouter thật
- Test MCP endpoint:
  ```bash
  curl -X POST https://happycandlevn-2257.vercel.app/api/mcp \
    -H "Content-Type: application/json" \
    -H "X-Socialplan-Token: $MCP_INTEGRATION_TOKEN" \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
  ```
- Custom domain `aniki.com/marketing`: vào Vercel → Settings → Domains → add subdomain hoặc rewrite từ aniki.com sang Vercel app

## Future iterations

Push tiếp lên branch `claude/pending-request-QUx0g` sẽ tự deploy preview. Merge vào `main` để deploy production.
