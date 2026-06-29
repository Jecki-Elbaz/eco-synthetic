# runner-install.ps1 -- Task Scheduler registration for the Eco-Synthetic proactivity runner.
# SHIR-005 Phase A deliverable (2026-06-29).
#
# Run ELEVATED ("Run as Administrator" in PowerShell).
# Registers "Eco-Synthetic Runner" to fire every 2h using the same credential env vars
# as the Telegram bridges (CLAUDE_CODE_OAUTH_TOKEN, USERPROFILE, HOME, APPDATA, LOCALAPPDATA, PATH).
#
# DEFAULT MODE = readonly (agents get Read only; zero writes).
# Flip to act after validation:   runner-install.ps1 -Mode act
#
# SAFETY: the PreToolUse guard (.claude/hooks/guard.py) HARD-enforces no Bash and no
# sub-agent spawns on the runner path via the RUNNER_CONTEXT env var set in runner.py.
# This holds even while GUARD_MODE=shadow. --allowedTools alone does NOT strip Bash.
# KILL SWITCH: create memory/SAFE_MODE with any text (or /halt via Telegram) to abort the next cycle.
#
# NOTE: the authoritative version of this script lives at:
#   C:\Users\Jecki\DEV\shared\scripts\register-runner.ps1
# That version is what was used to register the live Task Scheduler job.
# This file is the sprint-spec deliverable copy, kept in integrations/runner/ so it
# travels with the runner code in the repo.

param(
  [ValidateSet('readonly', 'act')]
  [string]$Mode = 'readonly'
)

# Paths -- all absolute (never relative).
$repoRoot  = 'C:\Users\Jecki\DEV\projects\eco-synthetic'
$pyw       = "$repoRoot\integrations\telegram-bridge\.venv\Scripts\pythonw.exe"
if (-not (Test-Path $pyw)) { $pyw = "$repoRoot\integrations\telegram-bridge\.venv\Scripts\python.exe" }
$runner    = "$repoRoot\integrations\runner\runner.py"
$runlog    = "$repoRoot\memory\agent-runs.jsonl"
$guardlog  = "$repoRoot\memory\agent-guard.log"
$taskName  = 'Eco-Synthetic Runner'

# Credential env vars (same set as the bridge service).
# These must match what the NSSM/Task Scheduler service env provides.
# The runner inherits them from the Task Scheduler principal environment.
# Required at runtime (NOT hardcoded here -- read from service env):
#   CLAUDE_CODE_OAUTH_TOKEN  -- Claude Max OAuth token (set via: claude setup-token)
#   USERPROFILE              -- e.g. C:\Users\Jecki
#   HOME                     -- same as USERPROFILE (LocalSystem workaround)
#   APPDATA                  -- e.g. C:\Users\Jecki\AppData\Roaming
#   LOCALAPPDATA             -- e.g. C:\Users\Jecki\AppData\Local
#   PATH                     -- must include npm and venv Scripts folders

Write-Host "== Checking prerequisites ==" -ForegroundColor Cyan
if (-not (Test-Path $pyw)) {
  Write-Error "pythonw.exe not found at $pyw -- is the venv set up?"
  exit 1
}
if (-not (Test-Path $runner)) {
  Write-Error "runner.py not found at $runner"
  exit 1
}
Write-Host "   Python: $pyw" -ForegroundColor Green
Write-Host "   Runner: $runner" -ForegroundColor Green

# Remove dangling superseded task if present.
Write-Host "== Removing dangling/superseded tasks (if any) ==" -ForegroundColor Cyan
foreach ($old in @('Eco Proactivity Runner')) {
  if (Get-ScheduledTask -TaskName $old -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $old -Confirm:$false
    Write-Host "   removed: $old (dangling)" -ForegroundColor Yellow
  }
}

# Register the runner task.
Write-Host "== Registering '$taskName' (mode=$Mode, every 2h) ==" -ForegroundColor Cyan
$user      = "$env:USERDOMAIN\$env:USERNAME"
$action    = New-ScheduledTaskAction -Execute $pyw -Argument ('"' + $runner + '" --mode ' + $Mode)
$trigger   = New-ScheduledTaskTrigger -Once -At (Get-Date) `
               -RepetitionInterval (New-TimeSpan -Hours 2) `
               -RepetitionDuration (New-TimeSpan -Days 3650)
$settings  = New-ScheduledTaskSettingsSet `
               -StartWhenAvailable `
               -MultipleInstances IgnoreNew `
               -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
               -AllowStartIfOnBatteries `
               -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType S4U -RunLevel Limited

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "   Registered (mode=$Mode, interval=2h)." -ForegroundColor Green

# Fire one cycle immediately to confirm wiring.
Write-Host "== Firing one cycle now (in background) ==" -ForegroundColor Cyan
Start-ScheduledTask -TaskName $taskName
Write-Host "   Waiting 60s for agent runs to land in the log..."
Start-Sleep -Seconds 60

# Post-install verification.
Write-Host "== Task state ==" -ForegroundColor Cyan
Get-ScheduledTask -TaskName $taskName | Select-Object TaskName, State | Format-Table -AutoSize

Write-Host "== memory/agent-runs.jsonl (last 14 lines) ==" -ForegroundColor Cyan
Get-Content $runlog -Tail 14 -ErrorAction SilentlyContinue

Write-Host "== memory/agent-guard.log (last 8 lines) ==" -ForegroundColor Cyan
Write-Host "   (expect runner denies on any Bash or write attempt in readonly mode)" -ForegroundColor Gray
Get-Content $guardlog -Tail 8 -ErrorAction SilentlyContinue

Write-Host ""
Write-Host ("LIVE (mode=$Mode). Runs every 2h. " +
  "KILL SWITCH: create memory/SAFE_MODE with any text, or send /halt to Eco on Telegram.") `
  -ForegroundColor Yellow

if ($Mode -eq 'readonly') {
  Write-Host "When validated, flip to act:  .\runner-install.ps1 -Mode act" -ForegroundColor Yellow
}
