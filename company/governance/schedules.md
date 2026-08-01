# Eco-Synthetic: Agent Schedules

Approved scheduled wake-ups and recurring agent tasks.
Owned by Operational Excellence (Assaf). Changes require A1 (owner approval).
A schedule entry requires owner A1 approval once before it activates. It stays approved until explicitly changed or revoked.
Decision logged: decisions-log.md 2026-06-12 -- scheduled wake-ups approved (A1: jecki).

**READ THIS BEFORE JUDGING JOB HEALTH (added 2026-08-02):** the "Last run" column below is
DECORATIVE and mostly "-". It is NOT a freshness source and must never be used to decide whether a
job fired. Authoritative sources, in order: (1) `integrations/runner/agent-prompts.md` = the JOB
REGISTRY of record -- if a job is not there, it does not exist, whatever this table says;
(2) `memory/runner-state.json` = per-agent last_run; (3) `memory/agent-runs.jsonl` = per-run events,
where health is the last TERMINAL event (`done` rc=0 vs `error_final`), NOT the last run date.
A job that fails every week still has a recent "last run".

**LIVE 2026-06-28:** SHIR-005 DELIVERED. The scheduled runner "Eco-Synthetic Runner" (Task Scheduler, every 2h) now FIRES the interval rows below -- it replaced the on-paper-only model where the bridge WAKEUP_INTERVAL only woke Eco. The "Last run" column here is NO LONGER updated per fire; the authoritative per-agent last_run is **memory/runner-state.json**. Cadence: Eco AM 08:00 + PM 20:00 + 2h check-in; Assaf cost / Ido dashboard / Oracle chronicle run once daily. Event-trigger rows (Shir uptime, MeetingPrep) remain PENDING the event build.

---

| Agent | Task | Cadence | Status | Approved by | Approved date | Last run |
|-------|------|---------|--------|-------------|---------------|----------|
| Eco | Queue review + dispatch follow-up + wiki update on task progress/completion | Every 2h | APPROVED | jecki (A1) | 2026-06-12 | - |
| Eco | Morning brief (queue + overnight + day plan) | Daily AM | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Eco | Evening summary + proactivity health block ("Eco PM Summary + Health Block") | Daily PM | **RETIRED 2026-07-27** (owner directive: one morning digest is the only scheduled owner touch). Row kept for history -- do NOT re-activate without fresh A1. De-registered from integrations/runner/agent-prompts.md (commit b92851e, 2026-07-27); last actual run 2026-07-26T21:57. Trigger health moved to memory/owner-dashboard.md (DASH-001) + the AM digest. NOTE: the retirement comment now in agent-prompts.md carries the label "2026-08-01" -- that label was rewritten by commit 4f65cc1 ("correct rollout date labels"); the retirement itself landed 2026-07-27. | jecki (A1) | 2026-06-22 | RETIRED -- last run 2026-07-26 |
| Assaf | Cost/token snapshot + threshold alert | Daily | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Assaf | Fitness loop + usage report | Weekly (Mon) | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Assaf | On-demand agent review (T-0009) | Monthly | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Rambo | Permission-drift scan | Weekly (Mon) | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Oracle | Chronicle sweep (capture day's decisions) | Daily | ACTIVE (via SHIR-005 runner; T-0020 C3 resolved on runner path) | jecki (A1 intent) | 2026-06-22 | see runner-state.json |
| Lital + Eyal | Compliance-deadline check (IL reg/invoicing/privacy) | Weekly | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Dalia | Quality/tone audit sample | Weekly | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Yael | Doc-hygiene audit (file-index + naming + near-dupe) | Weekly (Mon) | ACTIVE | jecki (A1) | 2026-06-29 | see runner-state.json |
| Ido | DASH-001 dashboard refresh | Hourly / fold into Eco 2h | ACTIVE | jecki (A1) | 2026-06-22 | - |
| Shir | Bridge + uptime health check | Every 15-30 min | PENDING BUILD -- event trigger + T-0020 C3 + Bash | jecki (A1 intent) | 2026-06-22 | - |
| Shir | Git/CI-CD hygiene audit (deterministic zero-token script; uncommitted/unpushed/unpulled + drift) | Daily | ACTIVE 2026-07-01 -- runs via runner.py run_git_hygiene() as a subprocess (no LLM/tokens, no Bash-in-agent). Rambo CLEAR-WITH-CONDITIONS (git-hygiene-review-2026-07-01.md). ATTENTION alerts owner Telegram; CLEAN silent. | jecki (A1) | 2026-07-01 | see runner-state.json |
| Eco | Agent-performance dashboard snapshot (deterministic zero-token script) | Per cycle (every 2h) | ACTIVE 2026-07-27 -- runs via runner.py run_agent_dashboard() as a subprocess (no LLM/tokens, no Bash-in-agent). Recomputes per-agent 7-day metrics from agent-runs.jsonl + board.md; writes dashboards/agent-performance.html. Live browser view = same script's `serve` mode on 127.0.0.1:8787 (read-only, localhost-only), registered via integrations/dashboard/dashboard-install.ps1. Silent unless it errors. Rambo rubber-stamp pending (local-only + no secrets + deterministic). | jecki (A1) | 2026-07-27 | see runner-state.json |
| Eco | Task-hygiene scan (deterministic zero-token script; T-0045) | Daily | ACTIVE 2026-08-02 -- runs via runner.py run_task_hygiene() as a subprocess (no LLM/tokens, no Bash-in-agent). integrations/task-hygiene/stale_detector.py checks 72h staleness with reason detection, deliverables already on disk (AUD-010 class), duplicate task ids (T-0046 class), board schema breakage, and trigger health by LAST TERMINAL EVENT rather than last run date. Writes memory/task-hygiene-report.md for Eco to read as DATA on the next check-in. NEVER pushes to Telegram itself -- it is an input to triage, not a notification. | jecki (A1) | 2026-08-02 | see runner-state.json |
| MeetingPrep | Pre-meeting prep | Event: T-Xh before external meeting | PENDING BUILD -- event trigger (SHIR-005) | jecki (A1 intent) | 2026-06-22 | - |

---

## Governance notes

- Any new schedule entry requires A1 (jecki) approval before adding a row here.
- The bridge reads this file conceptually; the asyncio timer uses WAKEUP_INTERVAL = 7200 (bridge.py).
- Fire condition: only if owner chat_id registered (requires /start at least once per bot). Skips silently otherwise.
- T-0009 (Eco, monthly): reviews on-demand/later agents and drafts wake-up proposals. Transfer to Assaf (OE) when built.
- Adding or changing a row is A1; log the decision in decisions-log.md.
- RETIRING a job is a THREE-FILE change, not one: integrations/runner/agent-prompts.md (registry of
  record), this file, and memory/owner-dashboard.md Per-Trigger Health. Skipping any of them creates
  job-registry drift -- the 2026-07-27 PM-Summary retirement was missed here and on the dashboard,
  and the company then escalated the job's non-existence as a production defect for six days
  (AUD-007, closed FALSE ALARM 2026-08-02).
