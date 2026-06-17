# Owner Dashboard -- Eco-Synthetic

Single view of every task queue across the company, plus what needs your action.
Maintained by Eco. Refreshed each wake-up cycle and whenever the board changes.
Source of truth: memory/board.md. Last refreshed: 2026-06-15 (overnight session v3 -- independent verification pass).

This is the INTERIM dashboard (a maintained markdown view) so you have control now.
The engineered version (auto-refresh / live surface) is tracked as DASH-001, scoped by Ido.

=====================================================================
NEEDS YOUR ACTION (do these to unblock the company)
=====================================================================

1. Open a Claude Code session -- single biggest unblock.
   Follow company/hr/onboarding-runbook.md step by step.
   What Eco prepped overnight (v2):
   - All 11 test-results shells created in company/hr/competency/<Name>-test-results.md.
     Each shell: scenarios pre-structured, pass criteria loaded, B6 role-file accuracy
     pre-confirmed by Eco. CC session operator just fills in outputs + results.
   - Stage A batch approval formally logged in decisions-log.md.
   - Onboarding section added to board.md with ONB-001 to ONB-012 (all 12 agents
     including Rambo/done and Gal/Shir/Luci/Erez which were missing).
   What the CC session delivers: B3 tests for all 11 agents -> B4 (Anat) -> B5 (Rambo
   scan) -> B6 sign-offs -> B7 final go-recommendations -> Stage C packages presented to
   you for A1 per agent.

2. T-0002 -- Design-decisions brief. OVERDUE (was due 2026-06-15).
   Read company/memos/design-decisions-brief-2026-06-14.md and tell Eco
   which of the 4 items to proceed with: concurrency rule, task-log storage
   (JSONL -> SQLite), durable chat memory, Gemini for research.
   Eco executes immediately after your call.

3. T-0014 -- Rambo permission scan. Rambo is LIVE and ready.
   This task can run in the same CC session alongside B3 tests.
   Rambo scans: Eco, Anat, Hila, Shelly, Designer role files.

4. Tools for this Telegram channel (jecki requested while sleeping -- see full memo at
   company/memos/eco-channel-tools-assessment-2026-06-15.md).
   Three requests, prioritized:
   - Priority 1: Agent tool. Lets Eco run B3 tests + task agents directly from here.
     Eliminates the Claude Code session dependency for all future agent work.
     Gate: Rambo risk review (A2 likely -- no new terms, subset of approved runtime).
   - Priority 2: Bash read-only. Lets Eco run git status/pwd/log without needing you
     to run commands. Would have caught the Windows vs WSL clone problem immediately.
     Gate: Rambo review; scope to read-only commands only. Destructive ops stay A1.
   - Priority 3: Google Calendar write (create-only). Lets Eco set reminders for you
     on the company calendar. Low risk; Eyal to confirm Google Workspace terms.
   Not requesting: WebSearch (Erez covers research), .claude/agents/ write (stays A1).
   Your direction needed to start the gate review.

=====================================================================
PENDING APPROVALS (waiting on your A1)
=====================================================================

- 11 agent go-lives: each requires B3-B7 complete + your A1 per agent (or batch if all
  clear). One CC session delivers the packages; you then review and approve.
- Tools for this channel: Agent tool + Bash read-only (see memo above).
- Domain purchase (S-0002): A1 + payment before buying (Shelly handles).

=====================================================================
ALL TASK QUEUES (by group)
=====================================================================

OWNER-OFFICE (Shelly)
- S-0001 in-progress  Operate owner Telegram channel        due recurring
- S-0002 open         Domain check + recommendation         due ASAP
- S-0003 blocked      Company email + drive after domain    due after S-0002
- S-0004 in-progress  Owner queue triage + reminders        due recurring
- S-0005 open         WhatsApp adoption evaluation          due later (P3)
- S-0006 open         Owner dashboard surfacing (full)      due see DASH-001
- S-0006a open        Surface pending approvals in dash     due with dash build

COMPANY (Eco)
- T-0001 in-progress  Go-live structure + R&R review        due immediate
- T-0002 open         Design-decisions brief                due OVERDUE -- needs owner call
- T-0003 open         Backlog QUEUE items by priority       due queued
- T-0004 open         Model router Phase A skeleton         due queued (R&D when staffed)
- T-0005 open         Compliance backlog tracking           due queued (Eyal+Lital when live)
- T-0006 open         WhatsApp-transcript comparison        due queued
- T-0007 open         Owner presentations intake            due waiting-on-owner
- T-0008 open         Wiki seed + maintenance               due ongoing
- T-0009 open         Monthly on-demand agent review        due monthly
- T-0010 open         Shelly separation assessment          due queued
- T-0011 blocked      Wiki feature evaluation               due after wiki setup complete
- T-0012 blocked      Access-matrix reconciliation          due when Dalia live (auto-start)
- T-0013 blocked      Gate-register bootstrapping review    due when Eyal live (auto-start)
- T-0014 open         Permission scan all live agents       due immediate -- Rambo is live
- T-0015 in-progress  P1 agent drafts (11 agents)           B1+B2 done; B3 shells done
- T-0016 done         Wiki refresh backlog+roster           done 2026-06-15
- T-0017 open         Israeli law + finance tools process   due on-need
- T-0018 open         Assaf .claude/agents/ access          due with T-0012
- T-0019 in-progress  Competency testing (11 P1 agents)     B1+B2 done; B3 shells done; B3 needs CC

OWNER CONTROL
- DASH-001 blocked    Owner dashboard (engineered build)    due within 24h of Ido go-live

ONBOARDING (Anat + Eco) -- all require A1 go-live after B3-B7 complete
- ONB-001 open        Certify Hila                          OVERDUE -- needs CC session
- ONB-002 done        Rambo live                            done 2026-06-14
- ONB-003 open        Bring up Ido (VP R&D)                 due 2026-06-16 -- needs CC session
- ONB-004 open        Bring up Dalia (Q&G)                  due 2026-06-16 -- needs CC session
- ONB-005 open        Bring up Lital (CFO)                  due 2026-06-17
- ONB-006 open        Bring up Eyal (Legal)                 due 2026-06-17
- ONB-007 open        Bring up Noam (Product)               due 2026-06-17
- ONB-008 open        Bring up Assaf (OE)                   due 2026-06-17
- ONB-009 open        Bring up Gal (Lead Dev)               due after Ido go-live
- ONB-010 open        Bring up Shir (DevOps)                due after Ido go-live
- ONB-011 open        Bring up Luci (Devil's Advocate)      due next CC session
- ONB-012 open        Bring up Erez (Investor, on-demand)   due next CC session

SECURITY (Rambo)
- T-0014 open         Permission scan all live agents        due immediate (Rambo is live)
- RAM-001 open        Bridge toolset review + perm sweep    due next CC session

MARKETING (Hila -- all blocked on certification)
- HIL-001 blocked     Brand basics (logo, palette, type)    due after Hila cert
- HIL-002 blocked     Agent avatars style choice            due after Hila cert
- HIL-003 blocked     LinkedIn page setup                   due after domain + email
- HIL-004 blocked     Secure social handles                 due after domain

=====================================================================
WORK DONE OVERNIGHT (2026-06-15, sessions v2 + v3)
=====================================================================

v2 session (Eco autonomous):
- All 11 test-results shells created (company/hr/competency/<Name>-test-results.md).
  Each shell: 3 pre-structured scenarios with pass criteria, B6 role-file accuracy
  pre-confirmed by Eco, PENDING markers for B3 outputs. CC session just fills in blanks.
- Stage A batch hire approval formally logged in decisions-log.md for all 10 new P1 agents.
- Onboarding section added to board.md (ONB-001 to ONB-012; was missing from board).
  ONB-009 (Gal), ONB-010 (Shir), ONB-011 (Luci), ONB-012 (Erez) are new additions.
- B7 preliminary go-recommendations written for all 11 agents (eco-b7-preliminary.md).
- Onboarding runbook rewritten to v2.0 (B3-forward, 11 agents, correct sequencing).
- Tools assessment memo (eco-channel-tools-assessment-2026-06-15.md) written.

v3 session (tonight, while you slept -- jecki request: do all agents + tools suggestion):
- Independent file-by-file verification of all v2 work: confirmed complete and solid.
  Checked: decisions-log Stage A entry, eco-b7-preliminary.md, Ido spec, Ido test shell,
  onboarding runbook v2.0, wiki (roster + backlog), owner dashboard, tools memo.
- Confirmed: NOTHING is left to do from this bridge. B3-B7 require Claude Code + Anat.
- Tools suggestion compiled (see TOOLS section below and the assessment memo).

HONEST STATUS: All prep that CAN be done from this channel is done.
The remaining step (B3 test execution) requires one Claude Code session.

=====================================================================
CRITICAL PATH (what unblocks the most)
=====================================================================

1. Open a Claude Code session -> follow onboarding-runbook.md -> B3-B7 for all 11 agents
   -> Stage C packages -> your A1 per agent -> company comes fully online.
   Tonight's prep makes that session faster: shells are built; nothing to create from scratch.

2. T-0002 decision -> unblocks 4 architecture choices Eco is waiting on.

3. Tools assessment decision -> if you approve Agent tool for this channel, the CC session
   dependency is eliminated for future agent work and all ongoing tasking.

=====================================================================
MORNING BRIEF (when you wake up -- what to do in order)
=====================================================================

Step 1: Read the tools assessment. company/memos/eco-channel-tools-assessment-2026-06-15.md
  Tell Eco: "proceed with gate review for Agent tool + Bash read-only" or "not yet."
  This takes 30 seconds and starts a gate review that runs without you.

Step 2: Open Claude Code with Anat active. Run:
  "Follow company/hr/onboarding-runbook.md starting at B3.
   Agent sequence: Ido first, then Dalia, Noam, Lital, Eyal, Assaf, Hila.
   Then Luci and Erez. Then Gal and Shir (after Ido certified).
   All test-results shells are ready -- just fill in outputs and results."
  Rambo runs B5 permission scans in parallel.
  Output: Stage C packages, one per agent, ready for your A1.

Step 3: Review Stage C packages. Approve go-live per agent (or batch if all clear).
  On each A1: Anat issues cert, decisions-log updated, agent goes live.

That's it. One Claude Code session + your reviews = full company online.

Notes for the CC session:
  - All B2 specs in: company/hr/competency/<Name>-spec.md
  - All B3 shells ready: company/hr/competency/<Name>-test-results.md
  - Eco B7 preliminary: company/hr/competency/eco-b7-preliminary.md
  - Runbook: company/hr/onboarding-runbook.md (v2.0)
