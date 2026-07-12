# Cost Snapshots

Daily cost and token usage summaries.

| Date | Summary |
|------|---------|
| 2026-07-12 | ~9.9k tokens (2026-07-11 only; 13h+ logging gap); Shir rc=1 endemic (4+ days, no recovery), Rambo inbox 100% failing (7/7 fires rc=1), weekly triggers frozen (13 days, 2 Monday slots missed), token logging offline, readiness NOT green (3 unmet, false_blocks=3). ESCALATE_TO_ECO. -- DEGRADED. |
| 2026-07-11 | ~4.1k tokens (2026-07-10 only); Shir rc=1 recurring (3+ days), NEW Eco 2h timeout at 00:10, Rambo inbox rc=1 ongoing (3/3 fires failed), weekly triggers completely dark (12 days since 06-29, missed 07-06 Monday), readiness NOT green (4 unmet). ESCALATE_TO_ECO. -- DEGRADED. |
| 2026-07-10 | Logging infrastructure offline (9-day gap); zero token entries for 24h window; Shir git-hygiene rc=1 (3-day recurring); 5 weekly triggers completely stalled (10 days since last fire); daily jobs stable (7 runs). ESCALATE_TO_ECO. -- DEGRADED. |
| 2026-07-09 | Logging infrastructure offline; token data incomplete (8+ day gap); runner telemetry unavailable; cannot verify health. 8-day DEGRADED trend; snapshot unable to fulfill observability mission. ESCALATE_TO_ECO. -- DEGRADED. |
| 2026-07-08 | ~8.1k tokens (Eco only); 20+ runs; 3 TimeoutExpired (Eco x2, Oracle), 4 rc!=0 (Shir x2, Eco API x2), NEW: API connectivity errors (ConnectionRefused, FailedToOpenSocket). Shir git-hygiene rc=1 now recurring pattern (2 days). Logging gap persists. ESCALATE_TO_ECO. -- DEGRADED. |
| 2026-07-07 | Token data unavailable (6-day logging gap from 2026-07-01); 5 TimeoutExpired (Eco, Assaf, Rambo), 2 rc=1 (Shir git-hygiene); SAFE_MODE flag may block writes. 6-day DEGRADED trend. ESCALATE_TO_ECO. -- DEGRADED. |
| 2026-07-06 | Token data unavailable (5-day gap); logging files offline; Shir rc=1 x2; Eco/Assaf timeout+retry pattern; SAFE_MODE active blocks writes. 5-day DEGRADED trend continues. ESCALATE_TO_ECO. -- DEGRADED. |
| 2026-07-02 | Token data unavailable (logging gap); agent-runs unverifiable; 3-day DEGRADED trend (Rambo/Dalia timeouts, Shir rc!=0, Eco PM-summary timeout). Escalation pending investigation. -- DEGRADED. |
| 2026-07-01 | ~24.2k tokens (Eco); 30+ runs; 4 failures (Shir rc=1 x2, PM-summary timeout, session-limit), 1 escalation (Shelly gates) -- DEGRADED. |
| 2026-06-30 | ~20-40k tokens (incomplete log); 40+ runs; 6 TimeoutExpired (Rambo x3, Dalia x3 — escalated), 2 escalations (Anat inactivity, Eyal A1) -- DEGRADED. |
| 2026-06-29 | ~1.2k tokens (Eco); 40+ runs; 4 TimeoutExpired (Rambo x2, Dalia x2), 2 escalations (Assaf workload, Eyal A1) -- DEGRADED. |
| 2026-06-28 | No data available; first run. Setup required. |
