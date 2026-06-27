# Owner Dashboard -- Eco-Synthetic

Single view of every task queue, pending approvals, and what needs your action.
Source of truth: memory/board.md. Last refreshed: 2026-06-28 (Ido, DASH-001).
28 live agents as of 2026-06-28.

=====================================================================
NEEDS YOUR ACTION (confirmed open items blocking the company)
=====================================================================

1. SHIR-001 loose ends -- two owner runtime actions required before Shir can proceed:
   (a) Run elevated PowerShell: Get-CimInstance Win32_Process | select ProcessId,CommandLine
       to confirm/rule out a rogue 3rd Telegram poller (3 PIDs observed 2026-06-27; only 2
       bridges expected). Do NOT kill any process blind.
   (b) Restart the eco bridge in a fresh shell so the httpx token-leak fix goes live
       (SHIR-002 code applied 2026-06-27; bridge restart activates it).
   Blocking: Shir's next sprint (rogue-host hunt + async-ack enhancement).

2. T-0033 proactivity triggers -- activate now or hold?
   9 schedule rows are ACTIVE-on-paper in schedules.md (approved 2026-06-22/24) but
   NOTHING fires until SHIR-005 (scheduled runner) is built. Owner decision needed:
   activate Tier-1 + Tier-2-interval triggers on the sync bridge now (polling only,
   no async-ack), or hold all activation until SHIR-005 lands and async-ack is done?
   SHIR-005 is the critical-path blocker for both T-0033 and DASH-001 auto-refresh.

3. S-0002 -- Domain check. Stale 16+ days. Shelly has findings.
   No purchase without your A1 + payment. Unblocks: S-0003 (email/Drive), HIL-003
   (LinkedIn), HIL-004 (social handles).

4. DAL-001 -- Human-comms policy (DAL-001). ON HOLD per your directive 2026-06-27.
   Resume: 2026-07-04 or when CS-0001 is owner-approved, whichever comes first.
   No action now -- just a date-flagged reminder.

5. SEC-0001 -- Guard shadow-mode validation. guard.py is in shadow mode (logs but does
   not block). No validation-window target defined. Owner to set a target date for the
   enforce-mode flip (owner A1 needed to flip). Low urgency but flagged.

6. T-0034 -- Israeli company registration (Rasham). ON HOLD per owner directive 2026-06-24.
   Trigger: Eco surfaces 30 days before any contract is signed. No action now.

=====================================================================
PENDING APPROVALS (A1/A2 items awaiting owner)
=====================================================================

- CS-0001: Customer communication policy (Mike). Draft needed before any customer
  contact. Mike owns the draft; A1 on policy. Task is OPEN + UNBLOCKED as of 2026-06-24.

- HIL-003 / HIL-004: LinkedIn + social handles. Content drafted 2026-06-23. Owner
  creates the page and secures handles (A1 per platform before any posting).

- SHIR-005 sprint -- once Shir completes SHIR-001 loose ends, Shir starts the
  scheduled runner build. Owner runtime action will be needed to register the runner
  in Task Scheduler (same as the bridges).

- T-0036 -- skill-scout skill evaluation. Gate required before adoption. Eco (gate:
  Rambo + Eyal). Created 2026-06-26, ASAP, P2.

- DAL-002 -- Documentation standard (company/governance/documentation-standard.md)
  activated 2026-06-27 by Dalia A2. No A1 needed retroactively; noting for visibility.

=====================================================================
TASK QUEUES -- SUMMARY COUNTS (2026-06-28)
=====================================================================

Section               open  in-progress  blocked  done  on-hold
--------------------  ----  -----------  -------  ----  -------
Owner-office (Shelly)   3       2          1       1       0
Company (Eco)           7       3          2      14       2
Security                1       1          0       0       0
Onboarding (Anat/Eco)   0       0          0      13       0
Customer Success        1       0          0       0       0
Marketing (Hila)        0       2          0       2       0
Governance (Dalia)      1       1          0       2       0
New roles / hires       0       0          0      10       0
Org / phasing           0       0          0       2       0
Staged hires (HIRE)     0       0          0      10       0
R&D (Ido)               0       0          0       1       0
DevOps / Bridge (Shir)  1       2          0       2       0

=====================================================================
TASK QUEUES -- DETAIL (by group)
=====================================================================

OWNER-OFFICE (Shelly -- migrated to Shelly repo; rows kept for history)
- S-0001  in-progress  Operate owner Telegram channel         recurring P1
- S-0002  open         Domain check + recommendation          ASAP P1 -- needs owner A1 + payment [16+ days stale]
- S-0003  blocked      Company email + Drive after domain     blocked on S-0002 P2
- S-0004  in-progress  Owner queue triage + reminders         recurring P1
- S-0005  open         WhatsApp adoption evaluation           later P3
- S-0006  open         Owner dashboard surfacing (full)       blocked on dashboards build P3
- S-0006a open         Surface pending approvals in dashboard with dashboards build P2
- S-0007  done         Shelly move capability handover        done 2026-06-20

COMPANY (Eco)
- T-0001  in-progress  Go-live structure + R&R review         immediate P1
- T-0003  open         Backlog QUEUE items by priority        queued P2
- T-0004  open         Model router Phase A skeleton          queued; R&D when ready P2
- T-0006  open         WhatsApp-transcript comparison         queued P2
- T-0007  open         Owner presentations intake             waiting-on-owner P2
- T-0008  open         Wiki seed + maintenance                ongoing P2
- T-0009  open         Monthly on-demand agent review         monthly recurring P2
- T-0011  blocked      Wiki feature evaluation                blocked until wiki setup complete P2
- T-0017  open         Israeli law + finance tools process    on-need P2
- T-0031  open         Tool-library catalog ownership         ongoing P2 (Assaf/Yossi)
- T-0033  in-progress  Proactivity program -- triggers        approved; ACTIVE-on-paper only; gated on SHIR-005 P2
- T-0036  open         Evaluate + gate skill-scout skill      ASAP P2 (Eco, gate: Rambo + Eyal)
- DASH-001 in-progress Owner dashboard (this file)           dashboard spec written; auto-refresh gated on SHIR-005 P1
- T-0034  on-hold      Israeli company registration (Rasham)  ON HOLD owner directive 2026-06-24; trigger 30d before first contract P2
- T-0032  blocked      Install formation/compliance batch     BLOCKED -- packages were hallucinated; void until real sources found P3
- T-0035  blocked      Promote IL skills to global scope      BLOCKED on T-0032 P3
- T-0002  done         Design-decisions brief                 done 2026-06-16
- T-0005  done         Compliance backlog tracking            done 2026-06-27 (both legs: Eyal legal + Lital finance)
- T-0010  done         Shelly separation assessment           done 2026-06-20
- T-0012  done         Access-matrix agents/ reconciliation   done 2026-06-18
- T-0013  done         Gate-register bootstrapping review     done 2026-06-18
- T-0014  done         Initial permission scan all 21 agents  done 2026-06-18
- T-0015  done         P1 agent drafts (all 10 pending)       done 2026-06-17
- T-0016  done         Wiki refresh backlog + roster          done 2026-06-18
- T-0018  done         Assaf agents/ access expansion         folded into T-0012 done
- T-0019  done         Competency testing all 11 P1 agents    done 2026-06-17
- T-0020  in-progress  Security gate -- Agent tool (bridge)   interim live; R&D pending C3 fix P1
- T-0023  done         Model-config audit all role files       done 2026-06-18
- T-0024  done         Understand eco-ops-overnight effort     done 2026-06-18
- T-0025  done         Eco.md RL9/10/11 block addition        done 2026-06-18
- T-0026  done         Shir.md RL9/10/11 block addition       done 2026-06-18
- T-0027  done         Erez.md RL9 addition                   done 2026-06-18
- T-0028  done         Shelly HR certification                 done 2026-06-21
- T-0029  done         MeetingPrep gate + certification        done 2026-06-18
- T-0030  done         Ido allowlist entry update              done 2026-06-18

SECURITY
- SEC-0001 open        Guard enforce-mode flip + per-agent write scoping  BACKLOG; shadow mode now; owner A1 to flip P1

ONBOARDING (Anat + Eco -- all done)
- ONB-001 to ONB-013   All 13 agents certified + live 2026-06-17 to 2026-06-21

CUSTOMER SUCCESS (Mike)
- CS-0001 open         Customer communication policy           UNBLOCKED 2026-06-24; Mike owns draft; A1 on policy P2
                                                               HARD GATE: no customer contact until approved + product live

MARKETING (Hila -- full track, live 2026-06-18)
- HIL-001 done         Brand basics (logo, palette, type)      done 2026-06-27; brand-guidelines-v1.md live
- HIL-002 done         Agent avatars style choice              done 2026-06-23; minimal flat-color confirmed
- HIL-003 in-progress  LinkedIn page setup                     content drafted 2026-06-23; owner creates page when ready P2
- HIL-004 in-progress  Secure social handles                   "ecosynthetic" handle recommended; owner secures (A1/platform) P3

GOVERNANCE (Dalia)
- DAL-001 in-progress  Company policy framework + human-comms policy  ON HOLD until 2026-07-04 or CS-0001 approved P2
- DAL-002 done         Documentation + knowledge-mgmt standard done 2026-06-27 (v1.0 live; Yael delivered)
- DAL-003 done         Decisions-log dedup pass               done 2026-06-22
- DAL-004 done         Role-file back-merge audit              done 2026-06-27 (Gal.md v1.1 RL9/10/11 added)

NEW ROLES (all certified + live 2026-06-18)
- HIRE-001 done  Yael (Knowledge/Doc manager, under Dalia)     live 2026-06-18
- HIRE-002 done  Chronicler (build historian, under Eco)       live 2026-06-18
- HIRE-003 done  Oren (Senior Developer, under Ido)            live 2026-06-18
- HIRE-004 done  Mike (VP Customer Success)                    live 2026-06-18
- HIRE-005 done  Jenny / Avner / Ella (CS reps, under Mike)    live 2026-06-18
- HIRE-006 done  Alex (Sales, under Sally)                     live 2026-06-18
- HIRE-007 done  Zvika (Research, on-demand)                   live 2026-06-18
- HIRE-008 done  Roman (Algorithm Specialist, on-demand/Ido)   live 2026-06-18
- HIRE-009 done  Adi (QA, under Ido)                           live 2026-06-18
- HIRE-010 done  Sami (SME advisor, on-demand)                 live 2026-06-18

ORG / PHASING
- ORG-001 done   Hila full marketing track                     done 2026-06-18
- ORG-002 done   Sally (VP Sales) pulled forward               done 2026-06-17; Tim.md renamed Sally.md 2026-06-18

R&D (Ido)
- IDO-001 done   Open Shir sprint (SHIR-004 then SHIR-001)     done 2026-06-22; sprint plan at company/r-and-d/shir-sprint-001.md

DEVOPS / BRIDGE (Shir)
- SHIR-001 in-progress  Bridge async ack + timeout fix + rogue-host  DELIVERY RESTORED 2026-06-23; loose ends: rogue host + httpx leak + async-ack P1
- SHIR-003 open         Cross-project inter-bridge channel     after Shir go-live; when shared/-folder interim outgrows P2
- SHIR-004 done         Reconcile two bridge.py versions       done 2026-06-22
- SHIR-005 in-progress  Event-trigger support in bridge/runner PRIORITY P1 -- critical path for T-0033 + DASH-001; sprint spec at company/r-and-d/shir-sprint-002.md

=====================================================================
STANDING FLAGS (ongoing, no single task ID)
=====================================================================

- T-0020 C3: Agent-tool spawn-allowlist -- R&D trio (Ido/Gal/Shir) + HIRE-003 to HIRE-010
  agents are OFF the allowlist until T-0020 C3 closes. Shir builds the C3 fix (SHIR-005 group).
- SKILL-001: Every repeated action becomes a .claude/commands/ skill. Owner: Dalia.
- Adi has Bash (QA only); Zvika has WebSearch/WebFetch (gate-registered). Both off spawn-allowlist.
- CS and Sales hard gates: no customer contact + no prospect sends until CS-0001 approved + product live.
- Zapier Telegram auth: broken 17+ consecutive days as of 2026-06-27. Eco briefs sent via
  PushNotification only. Re-auth URL: https://mcp.zapier.com/mcp/servers/894f1746-761c-4c80-8869-905f784d29e5/app-auth/TelegramCLIAPI
- T-0032/T-0035: formation/compliance skills packages were hallucinated -- tasks VOID until
  real package sources are identified. No install possible on current state.
- SHIR-002 httpx token-leak fix: code applied to bridge.py 2026-06-27; takes effect on next
  bridge restart (owner runtime action; see SHIR-001 item 1b above).
