# Deployment Status — socialplan-platform

> Last updated: 2026-05-22 (Windows local Claude Code session, Roger's machine)

## Final state

- **Production URL:** https://socialplan-platform.vercel.app
- **Deployment ID:** `dpl_GPtVia3FFhobtxXaCJ8iZoztaS4t`
- **Deploy completed:** 2026-05-21
- **Build duration:** ~54s, region `sin1`
- **Notes:** `NEXT_PUBLIC_*` stored as `plain` (they're embedded in client JS at build time anyway). `SUPABASE_SERVICE_ROLE_KEY` stored as `encrypted`. The `service_role` secret had to be pasted manually once — neither the Supabase MCP nor the Vercel MCP could supply / set it on its own, so it was injected via the Vercel REST API fallback (`POST /v10/projects/.../env` with `$VERCEL_TOKEN`). See `memory/vercel-mcp-no-env-management.md` and `memory/supabase-mcp-no-service-role.md` for why the MCP-only path is structurally blocked.

## TL;DR — current state

| Component | Status | Detail |
|---|---|---|
| Supabase project | LIVE | `hxznewvcvpqiyzdyhwdd` @ ap-southeast-1 |
| Supabase migrations | APPLIED | 7 tables from `001_init` |
| Vercel project | EXISTS | `socialplan-platform` under team `mailcoms-projects` |
| Vercel deployment | DEPLOYED | production: https://socialplan-platform.vercel.app |
| Vercel env vars (3) | DONE | all 3 set on production + preview + development |
| Production smoke test | PASS | `GET /` → HTTP 200 (ttfb ~1.2s) |

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

## Vercel env vars (all set 2026-05-21)

| Name | Type | Target | Vercel env ID |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | plain | production, preview, development | `MI1frJriaVEFKeKg` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | plain | production, preview, development | `KwAwpJWLB7RwAwpC` |
| `SUPABASE_SERVICE_ROLE_KEY` | encrypted | production, preview, development | `D9xUWMlvuggCC0u8` |

## Lessons captured this session

Saved to `C:\Users\admin\.claude\projects\C--Users-admin-Projects-socialplan-platform\memory\`:

- `vercel-mcp-no-env-management.md` — Vercel MCP has no env-var tool; fall back to `POST /v10/projects/.../env` with `$VERCEL_TOKEN`. Lists the full Vercel MCP surface so future sessions don't waste turns searching.
- `supabase-mcp-no-service-role.md` — Supabase MCP only exposes anon + publishable keys (`get_publishable_keys`); the `service_role` secret must come from the user (paste) or from the Supabase Management API. Don't search for a non-existent MCP tool.
- `socialplan-platform-ids.md` — Frozen IDs: Vercel project `prj_aXgCyx0ZXHOSoxpBjQ4i7Hxd1tUt`, team `team_hiKzDAS0wExU2NhAuY66ubPN`, Supabase ref `hxznewvcvpqiyzdyhwdd`, GitHub repo `rogerphamvn/socialplan_platform` (repoId `1245437684`). **Production branch is `claude/pending-request-QUx0g`, not `main`** — verify via `link.productionBranch` before assuming.
- `MEMORY.md` — Index linking the three above so they auto-load in future sessions.

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
