# Quickstart — Claude Code local + MCP autonomous deploy

Mục tiêu: setup 1 lần ~5 phút trên máy bạn → Claude tự deploy mọi project sau, không cần click dashboard.

## TL;DR — lệnh thường dùng

| Tình huống | Lệnh |
|---|---|
| **First-time setup** | `powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1` (Windows) hoặc `bash scripts/setup-local.sh` |
| **Auto-deploy (local, 1 lệnh, 0 click)** | `powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1` hoặc `bash scripts/deploy.sh` |
| **Auto-deploy (cloud, 0 lệnh)** | Push to `claude/pending-request-QUx0g` → GitHub Actions chạy `.github/workflows/auto-deploy.yml` |
| **Interactive Claude session** | `claude` |

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

## Autonomous re-deploy (0 prompts, 0 clicks)

Sau khi setup-local đã chạy 1 lần, lần sau redeploy chỉ cần:

### Local — 1 lệnh

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
```

```bash
# Mac/Linux/WSL
bash scripts/deploy.sh
```

Script tự:
1. Verify env vars + CLI + settings còn nguyên
2. `git pull` latest
3. Chạy `claude -p` headless với `scripts/deploy-prompt.md` làm prompt
4. `.claude/settings.json` allow-list bao trùm 28 Bash patterns + 14 MCP tools → không có permission prompt
5. Parse output → exit 0 (SUCCESS) hoặc exit 2 (FAILED) với NOTES
6. Lưu full log vào `scripts/deploy-log-last.txt` (gitignored)

### Cloud — 0 lệnh (TRUE autonomous)

Khi push 1 commit lên branch `claude/pending-request-QUx0g`, GitHub Actions
workflow `.github/workflows/auto-deploy.yml` tự kích hoạt và chạy hệt như
local — nhưng trên runner của GitHub, không cần máy bạn online.

**Một-time setup trên GitHub** (Repo Settings → Secrets and variables → Actions):

| Secret name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Lấy ở https://console.anthropic.com/settings/keys |
| `SUPABASE_ACCESS_TOKEN` | PAT đã có ở local |
| `VERCEL_TOKEN` | Token đã có ở local |

Sau khi 3 secret đã set, mỗi commit lên branch là auto-deploy.

Workflow có `workflow_dispatch` → vào tab **Actions** trên GitHub có thể bấm
nút "Run workflow" để re-deploy thủ công mà không cần push commit mới.

### Edit deploy behaviour

File `scripts/deploy-prompt.md` là prompt Claude sẽ chạy. Edit file này để
thay đổi flow (thêm/bớt step, đổi smoke-test URL, format final report khác).
Cả local script + GitHub Actions đều đọc file này.

File `.claude/settings.json` là allow-list. Nếu deploy bị block vì 1 tool
mới chưa nằm trong allow-list, append vào field `permissions.allow`.

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
