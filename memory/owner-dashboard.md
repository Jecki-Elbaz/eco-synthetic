# Owner Dashboard -- Eco-Synthetic

Single view of every task queue across the company, plus what needs your action.
Maintained by Eco. Refreshed each wake-up cycle and whenever the board changes.
Source of truth: memory/board.md. Last refreshed: 2026-06-15 (T-0016 refresh).

This is the INTERIM dashboard (a maintained markdown view) so you have control now.
The engineered version (auto-refresh / live surface) is tracked as DASH-001, scoped by Ido.
DASH-001 scope must include three governance lenses (Eco / Shelly / Interface), the A1 approval
queue (per S-0006a), and a token-cost line per surface (Assaf/OE + Lital/CFO), with Shelly shown
as a $0 customer whose consumption is booked as company cost-to-serve.

=====================================================================
NEEDS YOUR ACTION (do these to unblock the company)
=====================================================================

1. T-0002 -- Design-decisions brief not yet prepared.
   Eco must draft company/memos/design-decisions-brief.md covering four items:
   concurrency rule, task-log storage (JSONL vs SQLite), durable chat memory
   (store + retrieval via MCP), Gemini for non-sensitive research. Once drafted,
   owner reads and decides which items to proceed with. Eco cannot act until then.

2. T-0019 -- Competency testing: not yet started. BLOCKS all 10 P1 agent go-lives.
   Owner gave go-ahead 2026-06-14. Eco to draft competency specs; managers run tests;
   Anat reviews. No agent from the 10 P1 drafts (Ido, Eyal, Lital, Dalia, Noam,
   Assaf, Gal, Shir, Luci, Erez) goes live until T-0019 complete.

3. ONB-001 -- Hila certification. Due 2026-06-15 (overdue).
   Needs a Claude Code session where Anat holds the Agent tool to run the interview.

4. STATUS NOTE (correcting prior stale entry): Rambo IS live. .claude/agents/Rambo.md
   confirmed present. 17 agent role files exist in .claude/agents/ as of 2026-06-15.
   All 10 P1 drafts (Ido, Eyal, Lital, Dalia, Noam, Assaf, Gal, Shir, Luci, Erez)
   are committed. T-0015 drafts-complete milestone met. Go-lives blocked on T-0019.

=====================================================================
PENDING APPROVALS / GATES (waiting on you, A1)
=====================================================================

- 10 P1 agent go-lives: A1 already granted for creations; all blocked on T-0019
  (competency testing) before any go-live can proceed. Role drafts are ready.
- RAM-001 / T-0014: Rambo is live. Next: Eco tasks Rambo on T-0014 (permission scan
  of live agents). After T-0014 complete, RAM-001 bridge-toolset review proceeds;
  expanding Eco's bridge tools after that is your A1.
- Any domain purchase (S-0002): A1 + payment before buying.

=====================================================================
GOVERNANCE LENSES (Eco / Shelly / Interface)
=====================================================================

Same governance concepts across all three surfaces (gates, logging, A1 triggers, approval queue);
the measures differ between a company and a personal assistant.

- ECO (company): all T-/HIL-/RD-/RAM- queues below; A2 by Eco, A1 to owner. Token cost = company ops.
- SHELLY (owner office -> customer): S- queues below; her sub-agent builds are S-0007..S-0014.
  Customer file: company/customers/shelly/profile.md. Status: prospect (activates on separation).
- INTERFACE (Shelly <-> Eco): logged service requests; gates on budget/security/risk = A1.
  Request log: company/customers/shelly/requests-log.md. No requests yet.

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
- S-0007 open         Adopt meeting-prep sub-agent (cleared) due pre-migration
- S-0008 open         Build inbox-triage sub-agent          due pre-migration
- S-0009 open         Build social-scan sub-agent           due pre-migration
- S-0010 open         Build research sub-agent              due pre-migration
- S-0011 open         Build calendar-optimizer sub-agent    due pre-migration
- S-0012 open         Build morning-brief sub-agent         due pre-migration
- S-0013 open         Build meeting-summary sub-agent       due pre-migration
- S-0014 open         Build action-item-follow-up sub-agent due pre-migration

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
- T-0013 blocked      Gate-register review (Eyal, legal)    due when Eyal built
- T-0014 open         Rambo: permission scan all live agents due immediate (unblocked)
- T-0015 in-progress  P1 agent role drafts (all 10 done)    due blocked on T-0019
- T-0016 in-progress  Wiki + dashboard refresh (this run)   due immediate
- T-0017 open         Israeli law/finance tool process       due on-need
- T-0018 open         Assaf .claude/agents/ access (T-0012) due with T-0012
- T-0019 open         Competency testing -- 10 P1 agents     due before any go-live

OWNER CONTROL
- DASH-001 open       Owner dashboard (engineered build)    due Ido scope <24h post-activation
                      scope: 3 lenses (Eco/Shelly/Interface) + A1 queue + token-cost per surface

ONBOARDING -- NOTE: ONB- IDs are dashboard tracking only; board uses T-/S-/HIL- prefixes.
- ONB-001 open        Certify Hila                          due 2026-06-15 (overdue)
- ONB-002 DONE        Rambo live (.claude/agents/Rambo.md confirmed 2026-06-15)
- ONB-003..012        10 P1 agents (Ido, Eyal, Lital, Dalia, Noam, Assaf, Gal, Shir,
                      Luci, Erez): role drafts committed; blocked on T-0019

R&D (Ido)
- RD-001 blocked      Bridge media support (photo + voice)  due on Ido activation

SECURITY (Rambo)
- T-0014 open         Permission scan of all live agents    due immediate (Rambo live)
- RAM-001 open        Bridge toolset review + perm sweep    unblocked; after T-0014

MARKETING (Hila)
- HIL-001 blocked     Brand basics                          due after cert
- HIL-002 blocked     Agent avatars                         due after cert
- HIL-003 blocked     LinkedIn page                         due after domain+email
- HIL-004 blocked     Secure social handles                 due after domain

=====================================================================
CRITICAL PATH (what unblocks the most)
=====================================================================

Start T-0019 (competency testing). This is the single action that unblocks all 10
P1 agent go-lives. Eco drafts competency specs; managers run 3 test scenarios per
agent; Anat reviews. Parallel with T-0019: Eco tasks Rambo on T-0014 (permission
scan of live agents -- T-0014 is already unblocked). Once T-0019 complete and Anat
signs off, owner gives go-live A1 per /hiring process, and Ido, Dalia, etc. activate.
