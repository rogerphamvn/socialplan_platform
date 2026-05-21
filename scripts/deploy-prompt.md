# Autonomous Deploy Prompt — socialplan-platform

> Read by `scripts/deploy.ps1` and `scripts/deploy.sh` and piped to
> `claude -p` as a single non-interactive prompt. Edit this file to
> change the autonomous deploy behaviour.

Resume the deploy of this Next.js repo end-to-end. Read DEPLOYMENT_STATUS.md
first to see what's already done — DO NOT redo completed steps.

Identifiers (from DEPLOYMENT_STATUS.md, do not re-discover):
- Supabase project ref: hxznewvcvpqiyzdyhwdd (region ap-southeast-1)
- Vercel project ID: prj_aXgCyx0ZXHOSoxpBjQ4i7Hxd1tUt
- Vercel team ID: team_hiKzDAS0wExU2NhAuY66ubPN
- GitHub repo: rogerphamvn/socialplan_platform
- Production branch: claude/pending-request-QUx0g (NOT main)

Steps:

1. **Diff check** — Run `git log --oneline origin/claude/pending-request-QUx0g..HEAD`.
   If empty, nothing new to deploy; report current production URL + exit.
   If commits exist, push them: `git push origin claude/pending-request-QUx0g`.

2. **Supabase migrations** — Call `mcp__supabase__list_migrations` for
   hxznewvcvpqiyzdyhwdd. Compare against `supabase/migrations/` in this
   repo. For each local migration not yet applied, call
   `mcp__supabase__apply_migration`. After applying, call
   `mcp__supabase__list_tables` to verify expected table count.

3. **Vercel env vars** — Call Vercel REST API
   `GET https://api.vercel.com/v10/projects/prj_aXgCyx0ZXHOSoxpBjQ4i7Hxd1tUt/env?teamId=team_hiKzDAS0wExU2NhAuY66ubPN`
   with `Authorization: Bearer $VERCEL_TOKEN`. Verify these 3 keys exist
   in target=production:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   If any missing, FAIL with a clear message — service_role can only be
   set by manual user paste (see memory/supabase-mcp-no-service-role.md).

4. **Trigger deploy** — Call `mcp__vercel__deploy_to_vercel` with
   projectId=prj_aXgCyx0ZXHOSoxpBjQ4i7Hxd1tUt, ref=claude/pending-request-QUx0g,
   target=production.

5. **Poll until terminal** — Loop `mcp__vercel__get_deployment` every
   10s for max 10 minutes. Exit on state in (READY, ERROR, CANCELED).

6. **Smoke test** — If READY, `curl -sI https://socialplan-platform.vercel.app`.
   Expect HTTP/2 200. If not 200, FAIL with status code + first 500
   chars of body.

7. **Update DEPLOYMENT_STATUS.md** — Append a new entry under "Deploy
   history" section with: timestamp, commit SHA deployed, new deployment
   ID, build duration, smoke test result. Do NOT rewrite the existing
   "Final state" section -- only append.

8. **Commit + push** — Stage DEPLOYMENT_STATUS.md, commit
   "docs: auto-deploy {short_sha} -> {READY|ERROR}", push to
   origin claude/pending-request-QUx0g.

9. **Final report** — Print a single block in this exact format
   (machine-parseable):

```
=== DEPLOY REPORT ===
STATUS: {SUCCESS|FAILED}
COMMIT: <sha>
DEPLOYMENT_ID: <id>
URL: https://socialplan-platform.vercel.app
HTTP: <status code>
BUILD_DURATION_S: <seconds>
ELAPSED_TOTAL_S: <seconds since this prompt started>
NOTES: <any caveats or failures>
=== END REPORT ===
```

DO NOT ask the user any questions during this run. If a step would
require user input (eg. paste service_role), FAIL and print the exact
recovery instruction in NOTES. The user can re-run scripts/setup-local
or paste the missing value out of band, then re-trigger this script.

Use the .claude/settings.json allow-list — most tools should run
without prompt. If a permission prompt does appear, the allow-list is
incomplete; report which tool prompted in NOTES and exit non-zero so
the human can update settings.json.
