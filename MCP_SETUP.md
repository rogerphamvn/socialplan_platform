# MCP Setup — cấu hình một lần để Claude tự deploy mọi project sau

> Sau khi setup, Claude có thể tự: tạo Supabase project, apply SQL migration,
> set env vars trên Vercel, trigger deploy, verify URL — không cần bạn click dashboard.

## 1. Cài MCP servers vào Claude Code

### Cách A — Project-local (recommended, dùng cho repo này)

File `.mcp.json` đã sẵn trong repo. Bạn chỉ cần export 2 env var trong Claude Code environment:

```
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxx
VERCEL_TOKEN=vcp_xxxxxxxxxxxxx
```

Trên Claude Code on the web:
- Environment Settings → Environment Variables → Add 2 keys trên
- Restart session → 2 MCP servers tự load

### Cách B — User-level (cho mọi project trên máy)

Edit `~/.claude/settings.json` (Windows: `%USERPROFILE%\.claude\settings.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--access-token", "sbp_xxx"]
    },
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com",
      "headers": { "Authorization": "Bearer vcp_xxx" }
    }
  }
}
```

Restart Claude Code.

## 2. Lấy tokens

### Supabase Personal Access Token (PAT)

1. https://supabase.com/dashboard/account/tokens
2. Generate new token → name: `claude-code-mcp` → copy
3. ⚠️ Token chỉ hiện 1 lần. Treat như password.

### Vercel Token

1. https://vercel.com/account/tokens
2. Create Token → name: `claude-code-mcp` → scope: Full Account
3. Copy ngay

## 3. Network policy (Claude Code on the web)

Đảm bảo environment allowlist các hosts sau (nếu chưa):

```
api.supabase.com
*.supabase.co
mcp.vercel.com
api.vercel.com
*.vercel.app
github.com (đã default)
api.github.com (đã default)
registry.npmjs.org (đã default)
```

Sandbox hiện chặn `*.supabase.com` + `*.vercel.com` (đã verify bằng curl).
Cần mở allowlist này thì MCP mới chạy được.

## 4. Verify

Trong Claude Code session mới:

- Mở MCP panel — phải thấy `supabase` + `vercel` status = connected
- Hỏi Claude: "list my Supabase projects" — Claude phải gọi `mcp__supabase__list_projects`
- Hỏi: "list my Vercel deployments" — gọi `mcp__vercel__list_deployments`

## 5. Khi đã setup xong

Lần sau với project bất kỳ chỉ cần nói:

> "Setup Supabase + Vercel cho repo X, branch Y"

Claude sẽ chạy skill `infrastructure-bootstrapper` (orchestrator):
1. Pre-flight checks (PAT loaded, repo accessible)
2. Phase 2 — `supabase-mcp-setup`: create project + apply migrations + collect creds
3. Phase 3 — `vercel-mcp-setup`: import repo + set env + deploy + verify
4. Phase 4 — register vào KG + emit case study

Tự động hoàn toàn, không cần click UI.

## Skills tham khảo

3 skills mới đã được tạo trong claude-hub-private:

- `08-dept-tools/staff/integrations/supabase-mcp-setup/SKILL.md`
- `08-dept-tools/staff/integrations/vercel-mcp-setup/SKILL.md`
- `07-dept-engineering/staff/devops/infrastructure-bootstrapper.md`

Knowledge graph đã thêm 5 nodes + 8 edges để các agent khác query được.

## Troubleshooting

| Vấn đề | Nguyên nhân | Fix |
|---|---|---|
| MCP không xuất hiện | Token sai/expired | Regen ở Supabase/Vercel |
| "Host not in allowlist" | Network policy chặn | Mở allowlist như mục 3 |
| `npx` lỗi | Node < 18 | Upgrade Node trong environment |
| Token leak | Commit nhầm | Revoke ngay ở dashboard, regen |
