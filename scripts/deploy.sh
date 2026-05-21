#!/usr/bin/env bash
# Autonomous one-shot deploy for socialplan-platform (Mac / Linux / WSL).
# Usage:
#   bash scripts/deploy.sh
#
# Pre-reqs (only once per machine):
#   bash scripts/setup-local.sh

set -euo pipefail

step() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
ok()   { printf "    \033[32m[OK]\033[0m %s\n" "$*"; }
err()  { printf "    \033[31m[X]\033[0m %s\n" "$*" >&2; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

step "1/4 Verifying pre-reqs"
command -v claude >/dev/null 2>&1 || { err "claude CLI not found. Run bash scripts/setup-local.sh"; exit 1; }
[ -n "${SUPABASE_ACCESS_TOKEN:-}" ] || { err "SUPABASE_ACCESS_TOKEN not set. source ~/.bashrc or re-run setup-local.sh"; exit 1; }
[ -n "${VERCEL_TOKEN:-}" ] || { err "VERCEL_TOKEN not set"; exit 1; }
[ -f "scripts/deploy-prompt.md" ] || { err "scripts/deploy-prompt.md missing. git pull and retry."; exit 1; }
[ -f ".claude/settings.json" ] || { err ".claude/settings.json missing -- permission prompts will block. git pull and retry."; exit 1; }
ok "claude CLI present, env vars set, prompt + settings on disk"

step "2/4 Pulling latest from origin"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
git pull origin "$BRANCH"
ok "Branch '$BRANCH' up to date"

step "3/4 Running autonomous deploy via claude -p (headless)"
PROMPT="$(cat scripts/deploy-prompt.md)"
START=$(date +%s)
claude -p "$PROMPT" 2>&1 | tee scripts/deploy-log-last.txt
ELAPSED=$(( $(date +%s) - START ))
ok "Deploy completed in ${ELAPSED}s. Full log: scripts/deploy-log-last.txt"

step "4/4 Parsing deploy report"
if grep -q "STATUS:\s*SUCCESS" scripts/deploy-log-last.txt; then
  ok "STATUS: SUCCESS"
  URL=$(grep -E "^URL:" scripts/deploy-log-last.txt | head -1 | awk '{print $2}')
  [ -n "$URL" ] && echo "    URL: $URL"
  exit 0
elif grep -q "STATUS:\s*FAILED" scripts/deploy-log-last.txt; then
  err "STATUS: FAILED"
  NOTES=$(grep -E "^NOTES:" scripts/deploy-log-last.txt | head -1 | sed 's/^NOTES:[[:space:]]*//')
  [ -n "$NOTES" ] && echo "    NOTES: $NOTES"
  exit 2
else
  err "No machine-parseable report found in claude output. Check scripts/deploy-log-last.txt manually."
  exit 3
fi
