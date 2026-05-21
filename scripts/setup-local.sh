#!/usr/bin/env bash
# Local Claude Code CLI + MCP setup for this repo.
# Run once on your Mac/Linux/WSL machine:
#   bash scripts/setup-local.sh
#
# Idempotent: re-running is safe; existing config is updated, not duplicated.

set -euo pipefail

step() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
ok()   { printf "    \033[32m✓\033[0m %s\n" "$*"; }
warn() { printf "    \033[33m!\033[0m %s\n" "$*"; }
err()  { printf "    \033[31m✗\033[0m %s\n" "$*" >&2; }

# ---- detect shell rc ----
SHELL_NAME="$(basename "${SHELL:-bash}")"
case "$SHELL_NAME" in
  zsh)  SHELL_RC="$HOME/.zshrc" ;;
  bash) SHELL_RC="$HOME/.bashrc" ;;
  *)    SHELL_RC="$HOME/.profile" ;;
esac
[ -f "$SHELL_RC" ] || touch "$SHELL_RC"

# ---- 1. Node ----
step "1/5 Checking Node.js (need >= 20)"
if ! command -v node >/dev/null 2>&1; then
  err "Node.js not installed."
  OS="$(uname -s)"
  if [ "$OS" = "Darwin" ]; then
    echo "    Install with: brew install node@20"
  elif [ "$OS" = "Linux" ]; then
    echo "    Install with:"
    echo "      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "      sudo apt-get install -y nodejs"
  fi
  exit 1
fi
NODE_VER="$(node -v)"
NODE_MAJOR="$(echo "$NODE_VER" | sed -E 's/v([0-9]+)\..*/\1/')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  err "Node $NODE_VER found, need >= 20. Upgrade then re-run."
  exit 1
fi
ok "Node $NODE_VER"

# ---- 2. Claude Code CLI ----
step "2/5 Installing Claude Code CLI"
if command -v claude >/dev/null 2>&1; then
  ok "claude already present ($(command -v claude))"
else
  npm install -g @anthropic-ai/claude-code
  ok "Installed @anthropic-ai/claude-code"
fi

# ---- 3. Tokens ----
step "3/5 Configuring MCP tokens"

SUPABASE_TOK="${SUPABASE_ACCESS_TOKEN:-}"
VERCEL_TOK="${VERCEL_TOKEN:-}"

if [ -z "$SUPABASE_TOK" ]; then
  printf "    Supabase Personal Access Token (sbp_...): "
  read -r SUPABASE_TOK
fi
if [ -z "$VERCEL_TOK" ]; then
  printf "    Vercel Token (vcp_...): "
  read -r VERCEL_TOK
fi

if [ -z "$SUPABASE_TOK" ] || [ -z "$VERCEL_TOK" ]; then
  err "Both tokens required. Aborting."
  exit 1
fi

# Remove previous block (if any) then append fresh block.
MARK_START="# >>> claude-code MCP tokens >>>"
MARK_END="# <<< claude-code MCP tokens <<<"
TMP="$(mktemp)"
awk -v s="$MARK_START" -v e="$MARK_END" '
  $0 == s { skip=1; next }
  $0 == e { skip=0; next }
  !skip { print }
' "$SHELL_RC" > "$TMP" && mv "$TMP" "$SHELL_RC"

cat >> "$SHELL_RC" <<EOF
$MARK_START
export SUPABASE_ACCESS_TOKEN="$SUPABASE_TOK"
export VERCEL_TOKEN="$VERCEL_TOK"
$MARK_END
EOF
ok "Wrote SUPABASE_ACCESS_TOKEN + VERCEL_TOKEN to $SHELL_RC"

# Export for current process (so `claude` started by step 5 sees them)
export SUPABASE_ACCESS_TOKEN="$SUPABASE_TOK"
export VERCEL_TOKEN="$VERCEL_TOK"

# ---- 4. Sanity check .mcp.json ----
step "4/5 Verifying .mcp.json"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ ! -f "$REPO_ROOT/.mcp.json" ]; then
  warn "$REPO_ROOT/.mcp.json not found. MCP servers won't auto-load."
else
  ok ".mcp.json present"
fi

# ---- 5. Done ----
step "5/5 Done"
cat <<EOF

Next steps:
  1. Open a NEW shell (so $SHELL_RC reloads):
       exec $SHELL_NAME -l
     or:
       source $SHELL_RC

  2. cd into this repo and start Claude Code:
       cd $REPO_ROOT
       claude

  3. On first run, claude will prompt for login (opens browser).

  4. Inside Claude, verify MCP:
       > list my Supabase projects
       > list my Vercel projects

     If both return data, MCP is live. You can then run:
       > deploy this repo with infrastructure-bootstrapper

EOF
