# Owner Dashboard -- Eco-Synthetic

Single view of every task queue across the company, plus what needs your action.
Maintained by Eco. Refreshed each wake-up cycle and whenever the board changes.
Source of truth: memory/board.md. Last refreshed: 2026-06-15.

This is the INTERIM dashboard (a maintained markdown view) so you have control now.
The engineered version (auto-refresh / live surface) is tracked as DASH-001, scoped by Ido.

=====================================================================
NEEDS YOUR ACTION (do these to unblock the company)
=====================================================================

1. T-0002 -- Design-decisions brief is OVERDUE (due 2026-06-15).
   Read company/memos/design-decisions-brief-2026-06-14.md and tell Eco which
   items to proceed with (concurrency, task-log storage, durable memory, Gemini).
   Eco executes after your decision.

2. ONB-002 -- Rambo activation. Due 2026-06-15 18:00.
   One action in a Claude Code session: copy company/hr/role-drafts/Rambo-final.md
   to .claude/agents/Rambo.md and approve the write prompt. Unblocks Rambo + RAM-001.
   FLAG: a CC session reported this already done, but the repo this bridge reads
   still has NO Rambo.md. Verify in CC with `git status` + `pwd` -- likely a
   wrong-folder or unpushed-change issue. Not live here until the file exists.

3. ONB-001 -- Hila certification. Due 2026-06-15.
   Needs a Claude Code session where Anat holds the Agent tool to run the interview.

4. PR visibility -- the PR you approved DID land here: the 8-field task schema and
   this dashboard are now in the repo (board.md + decisions-log 2026-06-15 entry).
   BUT it did not include Rambo: still 6 agents, no .claude/agents/Rambo.md, no
   Gate-3 activation entry. So ONB-002/RAM-001 remain not-live here despite the
   earlier CC "Rambo is live" report. That is the one item still needing your action.

=====================================================================
PENDING APPROVALS / GATES (waiting on you, A1)
=====================================================================

- Agent creations (ONB-003..008): A1 to create each already granted; each still
  needs a CC session + Gate-3 activation sign-off.
- RAM-001 outcome: after Rambo + Eyal clear the bridge-toolset review, expanding
  Eco's bridge tools is your A1.
- Any domain purchase (S-0002): A1 + payment before buying.

=====================================================================
ALL TASK QUEUES (by group)
=====================================================================

OWNER-OFFICE (Shelly)
- S-0001 in-progress  Operate owner Telegram channel        due recurring
- S-0002 open         Domain check + recommendation         due ASAP
- S-0003 blocked      Company email + drive after domain    due after S-0002
- S-0004 in-progress  Owner queue triage + reminders        due recurring
- S-0005 open         WhatsApp adoption evaluation          due later
- S-0006 in-progress  Owner dashboard surfacing (full)      due see DASH-001
- S-0006a in-progress Surface pending approvals in dash     due with dash build

COMPANY (Eco)
- T-0001 in-progress  Go-live structure + R&R review        due immediate
- T-0002 in-progress  Design-decisions brief                due 2026-06-15 OVERDUE
- T-0003 open         Work backlog QUEUE by priority        due queued
- T-0004 open         Model router Phase A skeleton         due queued
- T-0005 open         Compliance backlog tracking           due queued
- T-0006 open         WhatsApp-transcript comparison        due queued
- T-0007 open         Owner presentations intake            due waiting-on-owner
- T-0008 open         LLM wiki seed + maintenance           due ongoing
- T-0009 open         Monthly on-demand agent review        due monthly
- T-0010 open         Shelly separation assessment          due queued
- T-0011 blocked      Wiki feature evaluation               due after wiki setup
- T-0012 blocked      Access-matrix reconciliation          due when Dalia built

OWNER CONTROL
- DASH-001 open       Owner dashboard (engineered build)    due Ido scope <24h post-activation

ONBOARDING (Anat + Eco)
- ONB-001 open        Certify Hila                          due 2026-06-15
- ONB-002 blocked     Bring up Rambo                        due 2026-06-15 18:00
- ONB-003 open        Bring up Ido (VP R&D)                 due 2026-06-16
- ONB-004 open        Bring up Dalia (Q&G)                  due 2026-06-16
- ONB-005 open        Bring up Lital (CFO)                  due 2026-06-17
- ONB-006 open        Bring up Eyal (Legal)                 due 2026-06-17
- ONB-007 open        Bring up Noam (Product)               due 2026-06-17
- ONB-008 open        Bring up Assaf (OE)                   due 2026-06-17

R&D (Ido)
- RD-001 blocked      Bridge media support (photo + voice)  due on Ido activation

SECURITY (Rambo)
- RAM-001 blocked     Bridge toolset review + perm sweep    due on Rambo activation

MARKETING (Hila)
- HIL-001 blocked     Brand basics                          due after cert
- HIL-002 blocked     Agent avatars                         due after cert
- HIL-003 blocked     LinkedIn page                         due after domain+email
- HIL-004 blocked     Secure social handles                 due after domain

=====================================================================
CRITICAL PATH (what unblocks the most)
=====================================================================

One Claude Code session with Anat (Agent tool) clears the biggest jam:
certify Hila (ONB-001) + create/activate Rambo (ONB-002), then proceed down
ONB-003..008. Rambo going live auto-starts RAM-001; Ido going live auto-starts
RD-001 and lets DASH-001 (this dashboard, engineered) be scoped.
