# dashboard-install.ps1 -- Task Scheduler registration for the Agent Performance Dashboard server.
# Owner A1 2026-07-27 (Eco). Run ELEVATED ("Run as Administrator").
#
# Registers "Eco-Synthetic Agent Dashboard" to run at logon and stay up, serving the LIVE
# dashboard at http://127.0.0.1:8787 -- recomputed from the telemetry on every browser refresh.
#
# SECURITY: localhost-only (127.0.0.1), read-only (GET only), no secrets read (only the
# telemetry/board/state files), deterministic, zero-token. Not exposed on the network.
#
# The runner ALSO writes a static snapshot to dashboards/agent-performance.html every cycle
# (per-cycle zero-token job), so a current file exists even if this server is not running.
#
# To just view it now WITHOUT installing a service, run in any terminal:
#   python integrations\dashboard\agent_dashboard.py serve
# then open http://127.0.0.1:8787

param(
  [int]$Port = 8787
)

$repoRoot = 'C:\Users\Jecki\DEV\projects\eco-synthetic'
$pyw      = "$repoRoot\integrations\telegram-bridge\.venv\Scripts\pythonw.exe"
if (-not (Test-Path $pyw)) { $pyw = "$repoRoot\integrations\telegram-bridge\.venv\Scripts\python.exe" }
if (-not (Test-Path $pyw)) { $pyw = 'python' }
$script   = "$repoRoot\integrations\dashboard\agent_dashboard.py"
$taskName = 'Eco-Synthetic Agent Dashboard'

Write-Host "== Checking prerequisites ==" -ForegroundColor Cyan
if (-not (Test-Path $script)) { Write-Error "agent_dashboard.py not found at $script"; exit 1 }
Write-Host "   Python: $pyw"     -ForegroundColor Green
Write-Host "   Script: $script"  -ForegroundColor Green

Write-Host "== Registering '$taskName' (serve on 127.0.0.1:$Port, at logon) ==" -ForegroundColor Cyan
$user      = "$env:USERDOMAIN\$env:USERNAME"
$action    = New-ScheduledTaskAction -Execute $pyw -Argument ('"' + $script + '" serve 127.0.0.1 ' + $Port)
$trigger   = New-ScheduledTaskTrigger -AtLogOn -User $user
$settings  = New-ScheduledTaskSettingsSet `
               -StartWhenAvailable `
               -MultipleInstances IgnoreNew `
               -ExecutionTimeLimit (New-TimeSpan -Seconds 0) `
               -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
               -AllowStartIfOnBatteries `
               -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType S4U -RunLevel Limited

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "   Registered (serve, 127.0.0.1:$Port, restart-on-failure)." -ForegroundColor Green

Write-Host "== Starting it now ==" -ForegroundColor Cyan
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 3
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/health" -UseBasicParsing -TimeoutSec 5
  Write-Host "   health check: HTTP $($r.StatusCode) ($($r.Content))" -ForegroundColor Green
} catch {
  Write-Host "   health check failed (give it a few more seconds, then retry)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "LIVE. Open your browser at:  http://127.0.0.1:$Port" -ForegroundColor Yellow
Write-Host "It recomputes from the live telemetry on every refresh." -ForegroundColor Yellow
