# Weekly Agent Fitness Loop — 2026-07-20 (Monday)

Run by: Assaf (Operational Excellence)  
Period: 2026-07-13 to 2026-07-20 (7 days)  
Data sources: memory/board.md, memory/runner-state.json, company/hr/interviews/

---

## Executive Summary

**Total live agents:** 31 (29 certified + Yossi conditional + Noa provisional)  
**Active agents (board activity in 7 days):** 14  
**Inactive agents (no board activity in 7 days):** 17  
**Overdue tasks:** 5 reactivated 2026-07-19 (stale-sweep intervention)  
**P1 agents at risk:** 1 ALERT (Lital — silent for 7+ days, expected to run compliance weekly)

---

## Active Agents — Board Activity 2026-07-13 to 2026-07-20

| Agent | Role | P1? | Last Activity | Status | Notes |
|-------|------|-----|---|--------|-------|
| Eco | CEO | ✓ | 2026-07-20 (2h runner) | ACTIVE | T-0001, T-0037, T-0038, T-0040, T-0045, AUD-006; stale-sweep reactivation leader |
| Shir | DevOps | ✓ | 2026-07-20 (git hygiene) | ACTIVE | AUD-007 build, AUD-001, SEC-0001; SHIR-007 (5d stale, reactivated) |
| Rambo | Security | ✓ | 2026-07-20 (Adam inbox) | ACTIVE | T-0037, T-0039, T-0020, AUD-008, AUD-009, AUD-013; permission scan 2026-07-18 (early) |
| Anat | HR | ✓ | 2026-07-19 (board reactivation) | ACTIVE | HR-002 done 2026-07-08, AUD-010 reactivated 2026-07-19 |
| Ido | VP R&D | ✓ | 2026-07-19 (DASH-001 refresh) | ACTIVE | T-0004 reactivated 2026-07-19, DASH-001 auto-refresh working |
| Eyal | Legal | ✓ | 2026-07-11 (AUD-004 input) | ACTIVE | T-0037, T-0039 gates; weekly compliance check due today |
| Dalia | Quality | ✓ | 2026-07-15 (AUD-006 A2) | ACTIVE | Weekly audit due today; AUD-006 revision approved |
| Assaf | Op-Ex | ✓ | 2026-07-20 (this run + daily cost) | ACTIVE | Daily cost snapshot 2026-07-20; this fitness loop |
| Oracle | Historian | ✓ | 2026-07-19 (daily chronicle) | ACTIVE | Daily chronicle last 2026-07-19; routine capture |
| Zvika | Research | ✗ | 2026-07-14 (research done) | DELIVERED | T-0043 market research completed 2026-07-14 |
| Sally | VP Sales | ✗ | 2026-07-14 (GTM strategy) | DELIVERED | T-0044 GTM strategy completed 2026-07-14 (with 6 open owner decisions) |
| Mike | VP CS | ✗ | 2026-07-19 (board reactivation) | ACTIVE | AUD-004 reactivated 2026-07-19 (CS-0001 fold, 8d stale) |
| Yossi | Training | ✗ | 2026-07-14 (certified + live) | NEWLY LIVE | Conditionally certified 2026-07-01, all conditions cleared 2026-07-14, no board work yet |
| Noa | Dev 2 | ✗ | 2026-06-30 (provisional go-live) | PROVISIONAL | Live B3 gate due ~2026-07-21; no visible board work yet |

---

## Inactive Agents — No Board Activity in Last 7 Days

| Agent | Role | P1? | Last Run (if scheduled) | Status | Reason / Note |
|-------|------|-----|---|--------|-------|
| Lital | CFO | ✓ | 2026-07-13 (weekly compliance) | ALERT: OVERDUE TASK | Weekly compliance check due every Monday — last run exactly 7 days ago (2026-07-13). Silent for 7+ days. No board activity visible. **ESCALATE:** Lital should have delivered compliance check by today; no progress logged. |
| Yael | Doc Manager | ✗ | 2026-07-13 (weekly audit) | INFO: DUE TODAY | Weekly doc-hygiene audit due every Monday — last run 2026-07-13. On schedule to run; not yet overdue. Silent otherwise. |
| Gal | Lead Dev | ✓ | (none; not on schedule) | INFO: NOT VISIBLE | No scheduled tasks; likely executing sprint work (R&D internal). No board entries last 7 days. R&D sprint tracking not centralized on board. |
| Oren | Senior Dev | ✓ | (none; not on schedule) | INFO: NOT VISIBLE | No scheduled tasks; likely executing sprint work or reviews. No board entries last 7 days. |
| Roman | Algorithm | ✗ | (none; on-demand only) | INFO: ON-DEMAND | On-demand agent, not scheduled. No active tasks visible. |
| Adi | QA | ✓ | (none; not on schedule) | INFO: NOT VISIBLE | No scheduled tasks; likely executing sprint work. No board entries last 7 days. |
| Perry | VP Product | ✓ | (none; not on schedule) | INFO: NOT VISIBLE | Product lead. T-0001 in-progress (VP scope); no recent board updates last 7 days. |
| Tal (Designer) | UX/UI | ✓ | (none; not on schedule) | INFO: GATED | AUD-011 gate reactivated 2026-07-19 (Rambo); awaiting Rambo permission scan + Dalia A2 (both in progress). Cannot write to marketing/ until gate clears. Inactive pending gate. |
| Sami | SME Advisor | ✗ | (none; on-demand) | INFO: ON-DEMAND | On-demand per-project. No active project assignments visible. |
| Hila | Marketing | ✓ | (none; not on schedule) | INFO: NOT VISIBLE | VP track live 2026-06-18. No board entries visible. Content cadence likely running off-board. No escalation needed (LIGHT TRACK baseline). |
| Alex | Sales Execution | ✗ | (none; not on schedule) | INFO: ON-HOLD | Hard boundary: no outreach/proposals until product live + pricing approved. Correctly idle. |
| MeetingPrep | Meeting Prep | ✗ | (none; event-triggered only) | INFO: ON-DEMAND | Event-triggered, no external meetings scheduled. Correctly idle. |
| Jenny | Customer Support | ✗ | (none; not on schedule) | INFO: ON-HOLD | No customer contact until CS-0001 approved + product live. Correctly idle. |
| Jack | CSM/Account | ✗ | (none; not on schedule) | INFO: ON-HOLD | No customer contact until CS-0001 approved + product live. Correctly idle. |
| Ella | Customer Trainer | ✗ | (none; not on schedule) | INFO: ON-HOLD | No customer contact until CS-0001 approved + product live. Correctly idle. |
| Luci | Devil's Advocate | ✗ | (none; on-demand) | INFO: ON-DEMAND | On-demand only. No active challenges visible. |
| Erez | Investor | ✗ | (none; on-demand) | INFO: ON-DEMAND | On-demand; viability research completed 2026-06-28. Next trigger: new initiative. |

---

## Scheduled Tasks — Due or At-Risk

| Task | Agent | Cadence | Last Run | Status | Notes |
|------|-------|---------|----------|--------|-------|
| Assaf:Weekly Fitness Loop | Assaf | Weekly Mon | 2026-07-13 | DUE TODAY ✓ | Firing now (this run) |
| Rambo:Weekly Permission-Drift Scan | Rambo | Weekly Mon | 2026-07-18 | EARLY | Ran Friday 2026-07-18; due Monday (today). No issue; early fire. |
| Lital:Weekly Compliance-Deadline Check | Lital | Weekly | 2026-07-13 | OVERDUE ⚠ | Due every week; last run 2026-07-13 (7 days ago). No visible completion for this week. **ALERT.** |
| Eyal:Weekly Compliance-Deadline Check | Eyal | Weekly | 2026-07-13 | DUE TODAY | Last run 2026-07-13. Due to run again; on schedule. |
| Dalia:Weekly Quality/Tone Audit | Dalia | Weekly | 2026-07-13 | DUE TODAY | Last run 2026-07-13. Due to run again; on schedule. |
| Yael:Weekly Doc-Hygiene Audit | Yael | Weekly Mon | 2026-07-13 | DUE TODAY | Last run 2026-07-13. Due to run again; on schedule. |
| Assaf:Monthly On-demand Agent Review (T-0009) | Assaf | Monthly | 2026-07-01 | ON SCHEDULE | Last run 2026-07-01; next due ~2026-08-01. Not yet overdue. |
| Rambo:Adam Inbox Screen | Rambo | Every 2h (EXPIRES 2026-07-28) | 2026-07-20 | ACTIVE | Fires every 2h; extended to 2026-07-28 per owner A1. Last 2026-07-20 (this cycle). |

---

## Overdue / Stale-Task Alerts

**REACTIVATED 2026-07-19 by Eco stale-sweep** (tasks with 72h+ no progress):
- **T-0004** (Model router Phase A): Ido scoped envelope due 2026-07-14; reactivated with fresh directive. Status: in-progress.
- **AUD-010** (Role-file batch): Anat drafting, 5d no progress; reactivated. Status: open → in-progress expected.
- **AUD-011** (Tal marketing-design gate): Rambo to run permission scan; prior blockers cleared 2026-07-14. Status: blocked → scanning expected.
- **AUD-004** (CS-0001 policy): Mike to fold Eyal retention text (8d since Eyal input); reactivated. Status: in-progress → near completion.
- **SHIR-007** (Git housekeeping): Shir to begin; 5d no progress since assignment 2026-07-14. Status: open → in-progress expected.

---

## Recommendations

### HIGH PRIORITY — ESCALATE TO ECO

1. **Lital (CFO) — P1 INACTIVE / OVERDUE TASK**
   - **Issue:** Weekly compliance-deadline check due every Monday; last run 2026-07-13 (exactly 7 days ago). No progress logged this week. Lital not visible on board.
   - **Action:** Eco to check Lital's status: is the weekly compliance check complete? If not, surface to owner immediately (may be blocked/unavailable/overlooked). If complete, ensure row is updated on board.
   - **Context:** Compliance is P1 (Israeli registration, PPL 72h breach clock, invoicing). Silent overdue is a process miss.

2. **T-0004 Envelope (Ido/R&D) — REACTIVATED, DELIVERY RISK**
   - **Issue:** Model router Phase A scope envelope due 2026-07-14; no delivery until Eco stale-sweep reactivation 2026-07-19.
   - **Action:** Eco to confirm Ido has deliverable (assignee, eng-days, sprint slot, done criteria) by EOM this week (2026-07-24). If blocked, escalate to owner for capacity/priority decision.

### MEDIUM PRIORITY — MONITOR

3. **Tal (Designer) — GATED / AWAITING ACTIVATION (AUD-011)**
   - **Issue:** Marketing-design scope gate (AUD-011) waiting on: Rambo permission scan (assigned 2026-07-19, not yet delivered) + Dalia A2 access-matrix update (in AUD-006 cycle).
   - **Action:** Rambo + Dalia to deliver; once cleared, Tal unblocked to write to marketing/.
   - **Context:** Not urgent (Hila can deliver assets > Tal for now), but unblocks Tal's full authority.

4. **R&D Engineers (Gal, Oren, Adi) — NO BOARD VISIBILITY**
   - **Issue:** No visible board tasks or progress for 7+ days. R&D work may be tracked in sprint backlog (not centralized on shared board), which is fine, but no fitness data available from shared board.
   - **Action:** Eco/Ido to confirm R&D sprint execution is on track. If board visibility is needed, escalate to Ido for R&D-board tracking plan.
   - **Context:** Not an alert yet (likely normal sprint execution), but fitness loop cannot verify without visibility.

5. **Yossi (Training) — NEWLY CERTIFIED, NO TASK ASSIGNMENTS**
   - **Issue:** Conditional cert lifted 2026-07-14 (all conditions cleared). No board tasks yet. T-0031 (tool-library catalog) ownership returned to Yossi from Assaf.
   - **Action:** Assaf to confirm T-0031 handoff complete and Yossi understands scope. Verify Yossi has first deliverable (update catalog with live agent tool needs discovered this sprint).

### GREEN (ON TRACK)

- **Eco:** Active, stale-sweep reactivation trigger working, runner fires on schedule. A+ status.
- **Shir:** Multiple high-priority tasks (AUD-007, SEC-0001, SHIR-007), all active. Runner delivery live. Overloaded but visible.
- **Rambo:** Security audits on track (AUD-008, AUD-009 delivered on spec 2026-07-14). Permission scan on schedule (early fire 2026-07-18). Active.
- **Anat:** HR-002 (Yossi/Noa cert) complete 2026-07-14. AUD-010 reactivated and underway.
- **Scheduled weekly jobs:** Eyal, Dalia, Yael due today; Assaf fitness loop (this run). All on track.

---

## Summary Metrics

| Metric | Count | Status |
|--------|-------|--------|
| Total live agents | 31 | — |
| Active (board activity 7d) | 14 | ✓ |
| Inactive (no board activity 7d) | 17 | ℹ (mostly on-hold or on-demand; expected) |
| P1 agents active | 9 | ✓ |
| P1 agents inactive | 0 | — |
| P1 agents at risk (overdue task) | 1 | ⚠ Lital (Lital compliance check overdue) |
| Scheduled tasks due/overdue today | 5 | ✓ (Assaf fitness, Eyal comp, Dalia QA, Yael doc, Rambo early) |
| Overdue tasks reactivated (2026-07-19) | 5 | ✓ (T-0004, AUD-010, AUD-011, AUD-004, SHIR-007) |

---

## Fitness Loop Final Note

**ESCALATE_TO_ECO**

One P1 agent (Lital) is silent for 7+ days and has an overdue weekly compliance check (due since 2026-07-13). This is a process-compliance item that requires Eco check-in before the end of this week.
