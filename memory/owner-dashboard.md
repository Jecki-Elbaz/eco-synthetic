# Owner Dashboard -- Eco-Synthetic

Single view of every task queue, pending approvals, and what needs your action.
Source of truth: memory/board.md. Last refreshed: 2026-06-18 (Ido, DASH-001).
21 live agents as of 2026-06-18.

=====================================================================
NEEDS YOUR ACTION (confirmed open items blocking the company)
=====================================================================

1. T-0021 -- Phase B git-sync deploy (5 owner-side steps, must do yourself).
   Full checklist: company/processes/git-sync-deploy-checklist.md
   Step 1: Enable branch protection on GitHub.
   Step 2: Bootstrap /etc/git-sync-hashes.txt on the bridge host.
   Step 3: Deploy bridge-git-sync.py to the bridge host.
   Step 4: Schedule GitSyncRunner (cron or systemd).
   Step 5: Switch settings.json hook to fetch-only (apply yourself -- agent writes are guard-blocked).

2. Tim (VP Sales) go-live -- B3 running this session; B4 (Anat) + B5 (Rambo) + B6/B7 (Eco) to
   follow this session; Stage C package + owner A1 needed after that to make Tim live.

3. S-0002 -- Domain check. Shelly has her findings ready. No purchase without your A1 + payment.
   Approving this also unblocks S-0003 (company email/Drive), HIL-003, HIL-004.

=====================================================================
PENDING APPROVALS (A1/A2 items not yet in NEEDS YOUR ACTION above)
=====================================================================

- T-0014: Full permission scan of all 21 live agents -- Rambo tasked 2026-06-18, report pending.
  Approve or direct next step when Rambo delivers.
- T-0020: R&D trio (Ido/Gal/Shir) off spawn-allowlist until T-0020 C3 closes (Shir builds fix).
  No action now -- flagging visibility.
- T-0023: Model-config audit across all role files (Assaf). Report to Eco; any fix is owner A1.
  No action now -- awaiting Assaf report.
- DAL-003: Decisions-log dedup pass (Dalia). Output appended to decisions-log; no A1 needed unless
  substantive role-file change surfaces.
- DAL-004: Role-file back-merge audit (Dalia/Assaf). Any role-file edit from findings = owner A1.
  No action now -- awaiting report.
- CS-0001: Customer communication policy (Mike). Draft needed before any customer contact. A1 on policy.
- HIL-001/002: Brand basics + agent avatars (Hila). Hila is live and unblocked; A1 on final choices.

=====================================================================
ALL TASK QUEUES -- SUMMARY COUNTS (2026-06-18)
=====================================================================

Section              open  in-progress  blocked  done  cancelled
--------------------  ----  -----------  -------  ----  ---------
Owner-office (Shelly)   3       2          1       0       0
Company (Eco)           8       2          0      10       0
Onboarding (Anat/Eco)   0       1          0      12       0
Customer Success        0       0          1       0       0
Marketing (Hila)        0       0          4       0       0
Governance (Dalia)      4       0          0       0       0
New roles / hires       0       0          0      10       0
Org / phasing           0       0          0       2       0
DevOps / Bridge (Shir)  0       1          0       0       0

=====================================================================
ALL TASK QUEUES -- DETAIL (by group)
=====================================================================

OWNER-OFFICE (Shelly)
- S-0001  in-progress  Operate owner Telegram channel          recurring P1
- S-0002  open         Domain check + recommendation           ASAP P1 -- needs owner A1 to purchase
- S-0003  blocked      Company email + Drive after domain      blocked on S-0002 P2
- S-0004  in-progress  Owner queue triage + reminders          recurring P1
- S-0005  open         WhatsApp adoption evaluation            later P3
- S-0006  open         Owner dashboard surfacing (full)        blocked on dashboards build P3
- S-0006a open         Surface pending approvals in dashboard  with dashboards build P2

COMPANY (Eco)
- T-0001  in-progress  Go-live structure + R&R review          immediate P1
- T-0003  open         Backlog QUEUE items by priority         queued P2
- T-0004  open         Model router Phase A skeleton           queued, R&D when ready P2
- T-0005  open         Compliance backlog tracking             queued P2
- T-0006  open         WhatsApp-transcript comparison          queued P2
- T-0007  open         Owner presentations intake              waiting-on-owner P2
- T-0008  open         Wiki seed + maintenance                 ongoing P2
- T-0009  open         Monthly on-demand agent review          monthly recurring P2
- T-0010  open         Shelly separation assessment            queued P2
- T-0011  blocked      Wiki feature evaluation                 blocked until wiki setup complete P2
- T-0014  in-progress  Permission scan -- all 21 live agents   immediate P1 (Rambo tasked 2026-06-18)
- T-0017  open         Israeli law + finance tools process     on-need P2
- T-0023  open         Model-config audit all role files       not urgent P2 (Assaf)
- DASH-001 in-progress Owner dashboard (engineered build)      in progress -- this file P1
- T-0002  done         Design-decisions brief                  done 2026-06-16
- T-0012  done         Access-matrix agents/ reconciliation    done 2026-06-18
- T-0013  done         Gate-register bootstrapping review      done 2026-06-18
- T-0015  done         P1 agent drafts (all 10 pending)        done 2026-06-17
- T-0016  done         Wiki refresh backlog + roster           done 2026-06-18
- T-0018  done         Assaf .claude/agents/ access            folded into T-0012, done
- T-0019  done         Competency testing all 11 P1 agents     done 2026-06-17
- T-0024  done         Understand eco-ops-overnight effort     done 2026-06-18

ONBOARDING (Anat + Eco)
- ONB-013 in-progress  Bring up Tim (VP Sales)                 B3 running this session; A1 needed after Stage C
- ONB-001 to ONB-012   All 12 prior agents                     done 2026-06-17/18

CUSTOMER SUCCESS (Mike)
- CS-0001 blocked      Customer communication policy           blocked on owner A1 on policy draft P2

MARKETING (Hila -- full track, live 2026-06-18)
- HIL-001 blocked      Brand basics (logo, palette, type)      waiting for A1 on final options P2
- HIL-002 blocked      Agent avatars style choice              waiting for A1 on final options P2
- HIL-003 blocked      LinkedIn page setup                     blocked on S-0002 + S-0003 P2
- HIL-004 blocked      Secure social handles                   blocked on domain P3

GOVERNANCE (Dalia)
- DAL-001 open         Company policy framework                when Dalia live -- she is live P2
- DAL-002 open         Documentation + knowledge-mgmt standard when Dalia live -- she is live P2
- DAL-003 open         Decisions-log dedup pass                not urgent P2
- DAL-004 open         Role-file back-merge audit              not urgent P2 (Dalia + Assaf)

NEW ROLES / STAGED HIRES (all done 2026-06-18)
- HIRE-001 done  Yael (Knowledge/Doc manager, under Dalia)     live 2026-06-18
- HIRE-002 done  Chronicler (build historian)                  live 2026-06-18
- HIRE-003 done  Oren (Senior Developer, under Ido)            live 2026-06-18
- HIRE-004 done  Mike (VP Customer Success)                    live 2026-06-18
- HIRE-005 done  Jenny / Avner / Ella (CS reps, under Mike)    live 2026-06-18
- HIRE-006 done  Alex (Sales, under Tim)                       live 2026-06-18
- HIRE-007 done  Zvika (Research, on-demand)                   live 2026-06-18
- HIRE-008 done  Roman (Algorithm Specialist, on-demand/Ido)   live 2026-06-18
- HIRE-009 done  Adi (QA, under Ido)                           live 2026-06-18
- HIRE-010 done  Sami (SME advisor, on-demand)                 live 2026-06-18

ORG / PHASING
- ORG-001 done   Hila full marketing track                     done 2026-06-18
- ORG-002 done   Tim (VP Sales) pulled forward                 done 2026-06-17

DEVOPS / BRIDGE (Shir)
- SHIR-001 in-progress  Bridge async ack + timeout fix         first sprint P1

=====================================================================
STANDING FLAGS (ongoing, no single task ID)
=====================================================================

- T-0020: Agent-tool spawn-allowlist -- R&D trio (Ido/Gal/Shir) + all HIRE-003 to HIRE-010 agents
  are OFF the allowlist until T-0020 C3 closes. Shir builds the C3 fix (SHIR-001 group).
- SKILL-001: Every repeated action becomes a .claude/commands/ skill. Owner: Dalia (interim Eco).
- Adi has Bash (QA only); Zvika has WebSearch/WebFetch (gate-registered). Both off spawn-allowlist.
- CS and Sales hard gates: no customer contact and no prospect sends until CS-0001 approved + product live.
