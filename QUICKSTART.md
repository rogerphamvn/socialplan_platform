# Quickstart — Claude Code local + MCP autonomous deploy

Mục tiêu: setup 1 lần ~5 phút trên máy bạn → Claude tự deploy mọi project sau, không cần click dashboard.

## 1. Clone repo về local

```bash
git clone https://github.com/rogerphamvn/socialplan_platform.git
cd socialplan_platform
git checkout claude/pending-request-QUx0g
```

## 2. Chạy setup script

### Mac / Linux / WSL

```bash
bash scripts/setup-local.sh
```

### Windows native (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1
```

Script sẽ:

1. Kiểm tra Node.js >= 20 (báo cách install nếu chưa có)
2. Install `@anthropic-ai/claude-code` global
3. Hỏi 2 token → ghi vào `~/.bashrc` (hoặc `~/.zshrc` / Windows User env)
4. Verify `.mcp.json` có trong repo
5. In hướng dẫn bước tiếp theo

Script idempotent — chạy lại an toàn, không duplicate config.

## 3. Token cần chuẩn bị trước

| Token | Lấy ở đâu |
|---|---|
| Supabase Personal Access Token | https://supabase.com/dashboard/account/tokens → Generate new token |
| Vercel Token | https://vercel.com/account/tokens → Create token (scope: Full Account) |

Cả 2 chỉ hiện 1 lần — copy ngay.

## 4. Start Claude Code

Sau khi script xong, mở shell mới (để env vars reload) và:

```bash
cd socialplan_platform
claude
```

Lần đầu sẽ prompt login (mở browser tự động).

## 5. Verify MCP active

Trong Claude:

```
list my Supabase projects
```

→ Phải gọi `mcp__supabase__list_projects` và trả về list project của bạn (sẽ thấy `hxznewvcvpqiyzdyhwdd`).

```
list my Vercel projects
```

→ `mcp__vercel__list_projects` trả về list.

Nếu cả 2 chạy được → MCP live, bạn sẵn sàng autonomous workflow.

## 6. Autonomous deploy

```
deploy this repo using infrastructure-bootstrapper
```

Claude sẽ:

1. Query KG → load case study trước
2. Phase 1: pre-flight checks
3. Phase 2: apply Supabase migration (skill `supabase-mcp-setup`)
4. Phase 3: import + deploy Vercel (skill `vercel-mcp-setup`)
5. Phase 4: smoke test + register KG + emit case study
6. Trả về production URL + `bootstrap-report.md`

Không click dashboard. Mỗi case study được KG ghi nhớ → lần sau nhanh hơn.

## Troubleshooting

| Vấn đề | Fix |
|---|---|
| `node: command not found` | Install Node 20+ từ https://nodejs.org |
| `npm install` permission denied | Mac/Linux: dùng `nvm` thay vì system Node, hoặc `sudo npm install -g` |
| `claude` không thấy MCP | Restart shell sau khi script set env; check `echo $SUPABASE_ACCESS_TOKEN` non-empty |
| `Host not in allowlist` | Local không bị giới hạn này — chỉ xảy ra trong sandbox web |
| Token leaked | Revoke ngay ở Supabase/Vercel dashboard → regen → re-run script |

## Tham khảo

- `MCP_SETUP.md` — chi tiết MCP architecture
- `.mcp.json` — MCP server config (project-local, references env vars)
- Hub skills (private): `infrastructure-bootstrapper`, `supabase-mcp-setup`, `vercel-mcp-setup`
