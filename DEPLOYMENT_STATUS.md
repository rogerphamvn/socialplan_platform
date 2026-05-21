# Deployment Status — socialplan-platform

> Last updated: 2026-05-21 (Windows local Claude Code session, Roger's machine)

## TL;DR — current state

| Component | Status | Detail |
|---|---|---|
| Supabase project | LIVE | `hxznewvcvpqiyzdyhwdd` @ ap-southeast-1 |
| Supabase migrations | APPLIED | 7 tables from `001_init` |
| Vercel project | EXISTS | `socialplan-platform` under team `mailcoms-projects` |
| Vercel deployment | DEPLOYED | preview build URL: see below |
| Vercel env vars (3) | PARTIAL | needs `SUPABASE_SERVICE_ROLE_KEY` + verify URL/ANON |
| Production smoke test | PENDING | run after env vars are complete + redeploy |

## Identifiers

```
SUPABASE_PROJECT_REF   = hxznewvcvpqiyzdyhwdd
SUPABASE_URL           = https://hxznewvcvpqiyzdyhwdd.supabase.co
SUPABASE_REGION        = ap-southeast-1

VERCEL_PROJECT_NAME    = socialplan-platform
VERCEL_PROJECT_ID      = prj_aXgCyx0ZXHOSoxpBjQ4i7Hxd1tUt
VERCEL_TEAM_ID         = team_hiKzDAS0wExU2NhAuY66ubPN
VERCEL_TEAM_SLUG       = mailcoms-projects

GITHUB_REPO            = rogerphamvn/socialplan_platform
GITHUB_BRANCH          = claude/pending-request-QUx0g
```

## Supabase tables (post-migration `001_init`)

```
projects
agents
skills
generations
kg_edges
content_items
campaigns
```

(7 tables total — verify with `mcp__supabase__list_tables` if in doubt)

## Required Vercel env vars

| Name | Where to get | Set yet? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hxznewvcvpqiyzdyhwdd.supabase.co` | check |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard > Settings > API > anon public | check |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard > Settings > API > service_role (secret) | **TODO** |

After all 3 set → trigger redeploy → Postgres KG persistence activates in the app.

## To resume in a fresh Claude Code session

### Pre-flight (one-time per machine, already done on Roger's Windows)

1. Claude Code CLI installed: `claude --version`
2. Env vars persisted: `$env:SUPABASE_ACCESS_TOKEN` + `$env:VERCEL_TOKEN` non-empty
3. MCP servers connected: `/mcp` shows `supabase` + `vercel` both ✓ connected

If any of the above fails, re-run `bash scripts/setup-local.sh` (Mac/Linux) or `powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1` (Windows).

See `QUICKSTART.md` for full first-time setup. See `MCP_SETUP.md` for architecture.

### Resume command (copy-paste into Claude Code TUI)

```
Continue the deploy of socialplan-platform.

State so far (from DEPLOYMENT_STATUS.md):
- Supabase project hxznewvcvpqiyzdyhwdd: migration 001_init applied, 7 tables live
- Vercel project socialplan-platform (prj_aXgCyx0ZXHOSoxpBjQ4i7Hxd1tUt) exists
- Env vars status: incomplete — at minimum SUPABASE_SERVICE_ROLE_KEY missing

Tasks:
1. List current Vercel env vars on the project. Identify which of the 3
   required (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
   SUPABASE_SERVICE_ROLE_KEY) are missing or wrong.
2. Pull missing values from the Supabase project (anon key, service_role
   key) via Supabase MCP.
3. Add/update env vars on Vercel via Vercel MCP for all 3 target
   environments (production, preview, development).
4. Trigger a fresh production deployment.
5. Poll deployment until READY (or FAILED). Surface logs if FAILED.
6. HTTP GET the production URL and report status code + first 200 chars
   of HTML (just to confirm the page renders).
7. Final report: production URL, deployment ID, all 3 env vars confirmed
   present, smoke-test PASS.

Use only MCP tools (mcp__supabase__*, mcp__vercel__*). Approve permission
prompts inline.
```

## Lessons captured (in claude-hub-private KG)

Case study `case-2026-05-21-socialplan-windows-onboarding` registered
in knowledge graph v2.27. Six lessons including:
- PowerShell 5.1 cannot parse Unicode in `.ps1` -> ASCII only
- Windows PowerShell defaults to `system32` -> always cd $HOME first
- `.mcp.json` must use `${VAR}` syntax, not `$VAR`
- For Supabase MCP via npx on Windows, pass `--access-token` flag
  directly in args (env inheritance is unreliable)
- New shells don't inherit current-session env vars; close + reopen
- Sandboxed web Claude Code blocks `*.supabase.com` + `*.vercel.com`
  -> local install is the workaround

## Files of interest in this repo

```
.mcp.json                       # MCP server config (Supabase + Vercel)
scripts/setup-local.sh          # Mac/Linux/WSL setup
scripts/setup-local.ps1         # Windows PowerShell setup (ASCII-only)
QUICKSTART.md                   # 6-step user-facing guide
MCP_SETUP.md                    # Architecture + troubleshooting
DEPLOYMENT_STATUS.md            # This file
supabase/migrations/            # SQL migrations (001_init applied)
```
