# Local Claude Code CLI + MCP setup for this repo (Windows / PowerShell).
# Run once:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1

$ErrorActionPreference = 'Stop'

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    ✓ $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "    ! $msg" -ForegroundColor Yellow }
function Err($msg)  { Write-Host "    ✗ $msg" -ForegroundColor Red }

# 1. Node
Step "1/5 Checking Node.js (need >= 20)"
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Err "Node.js not installed. Install from https://nodejs.org (LTS 20+)"
  exit 1
}
$nodeVer = (node -v).TrimStart('v')
$major = [int]$nodeVer.Split('.')[0]
if ($major -lt 20) { Err "Node $nodeVer found, need >= 20"; exit 1 }
Ok "Node v$nodeVer"

# 2. Claude Code CLI
Step "2/5 Installing Claude Code CLI"
$claude = Get-Command claude -ErrorAction SilentlyContinue
if ($claude) { Ok "claude already present ($($claude.Source))" }
else { npm install -g '@anthropic-ai/claude-code'; Ok "Installed" }

# 3. Tokens
Step "3/5 Configuring MCP tokens"
$supa = $env:SUPABASE_ACCESS_TOKEN
$verc = $env:VERCEL_TOKEN
if (-not $supa) { $supa = Read-Host "    Supabase PAT (sbp_...)" }
if (-not $verc) { $verc = Read-Host "    Vercel token (vcp_...)" }
if (-not $supa -or -not $verc) { Err "Both tokens required"; exit 1 }

[Environment]::SetEnvironmentVariable('SUPABASE_ACCESS_TOKEN', $supa, 'User')
[Environment]::SetEnvironmentVariable('VERCEL_TOKEN', $verc, 'User')
$env:SUPABASE_ACCESS_TOKEN = $supa
$env:VERCEL_TOKEN = $verc
Ok "Set SUPABASE_ACCESS_TOKEN + VERCEL_TOKEN (User scope)"

# 4. .mcp.json
Step "4/5 Verifying .mcp.json"
$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
if (-not (Test-Path "$repoRoot\.mcp.json")) { Warn ".mcp.json missing" }
else { Ok ".mcp.json present" }

# 5. Done
Step "5/5 Done"
Write-Host @"

Next steps:
  1. Open a NEW PowerShell window (so env vars reload).
  2. cd '$repoRoot'
  3. claude
     On first run, browser opens for login.
  4. Inside Claude:
       > list my Supabase projects
       > list my Vercel projects
       > deploy this repo with infrastructure-bootstrapper
"@
