# Autonomous one-shot deploy for socialplan-platform (Windows / PowerShell).
# Usage:
#   .\scripts\deploy.ps1
# or:
#   powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1
#
# Pre-reqs (only once per machine):
#   bash scripts\setup-local.ps1  (installs claude CLI + sets env vars)

$ErrorActionPreference = 'Stop'

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Err($msg)  { Write-Host "    [X]  $msg" -ForegroundColor Red }

$repoRoot = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $repoRoot

Step "1/4 Verifying pre-reqs"

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Err "claude CLI not found. Run: powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1"
  exit 1
}
if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Err "SUPABASE_ACCESS_TOKEN not set in current shell. Restart PowerShell or re-run setup-local.ps1."
  exit 1
}
if (-not $env:VERCEL_TOKEN) {
  Err "VERCEL_TOKEN not set in current shell."
  exit 1
}
if (-not (Test-Path ".\scripts\deploy-prompt.md")) {
  Err "scripts\deploy-prompt.md missing. Run: git pull origin (git rev-parse --abbrev-ref HEAD)"
  exit 1
}
if (-not (Test-Path ".\.claude\settings.json")) {
  Err ".claude\settings.json missing -- permission prompts will block. git pull and retry."
  exit 1
}
Ok "claude CLI present, env vars set, prompt + settings on disk"

Step "2/4 Pulling latest from origin"
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
git pull origin $branch
Ok "Branch '$branch' up to date"

Step "3/4 Running autonomous deploy via claude -p (headless)"
$prompt = Get-Content -Raw .\scripts\deploy-prompt.md
$startTime = Get-Date

# claude -p runs non-interactive. Combined with .claude/settings.json
# allow-list, no permission prompts should appear.
claude -p $prompt 2>&1 | Tee-Object -FilePath .\scripts\deploy-log-last.txt

$elapsed = ((Get-Date) - $startTime).TotalSeconds
Ok ("Deploy completed in {0:N0}s. Full log: scripts\deploy-log-last.txt" -f $elapsed)

Step "4/4 Parsing deploy report"
$logContent = Get-Content -Raw .\scripts\deploy-log-last.txt
if ($logContent -match "STATUS:\s*SUCCESS") {
  Ok "STATUS: SUCCESS"
  if ($logContent -match "URL:\s*(\S+)") { Write-Host "    URL: $($Matches[1])" -ForegroundColor Green }
  exit 0
} elseif ($logContent -match "STATUS:\s*FAILED") {
  Err "STATUS: FAILED"
  if ($logContent -match "NOTES:\s*(.+)") { Write-Host "    NOTES: $($Matches[1])" -ForegroundColor Yellow }
  exit 2
} else {
  Err "No machine-parseable report found in claude output. Check scripts\deploy-log-last.txt manually."
  exit 3
}
