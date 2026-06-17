# Onboarding runbook -- 11 P1 agents, B3 forward

Updated: 2026-06-15 | Author: Eco (CEO)

This runbook picks up at Step B3 (competency test execution). B1 (role files) and B2
(competency specs) are complete for all 11 agents.

---

## What is done (B1, B2 complete)

B1 -- Role files committed to .claude/agents/:
Anat, Rambo (already live/certified), Eco (already live/certified).
Pending go-live (B3 forward): Ido, Dalia, Noam, Lital, Eyal, Assaf,
Gal, Shir, Luci, Erez, Hila.

B2 -- Competency specs written to company/hr/competency/:
Ido, Dalia, Noam, Lital, Eyal, Assaf, Gal, Shir, Luci, Erez, Hila.

---

## What requires Claude Code (this runbook)

B3, B5, B6, B7 and final activation all require tools not available in the
Telegram bridge. A full Claude Code session with Anat having the Agent tool is needed.

---

## Session prerequisites

Before starting the Claude Code session, confirm:
- .claude/agents/ has all 11 pending role files (verified 2026-06-15).
- company/hr/competency/ has all 11 specs (verified 2026-06-15).
- Anat.md is the active agent with Agent tool access.
- No open git conflicts on master.

---

## Agent order and manager dependencies

L3 agents (Eco is direct manager -- run tests first):
1. Ido (VP R&D) -- must be first; Gal + Shir need Ido before manager sign-off
2. Dalia (Q&G)
3. Noam (Product)
4. Lital (CFO)
5. Eyal (Legal)
6. Assaf (OE)
7. Hila (Marketing, L4 light track -- Tim not live; Eco acts as evaluator)

L4 agents -- Ido must be certified before their B6 manager sign-off:
8. Gal (Lead Dev) -- run B3 tests after Ido certified; Ido does B6 sign-off
9. Shir (DevOps) -- same; Ido does B6 sign-off

Owner office agents (report to jecki; Eco evaluates):
10. Luci (Devil's Advocate)
11. Erez (Investor, on-demand)

Rambo (already certified) runs B5 (permission scans) for all 11 as
a separate pass after his own activation. B5 can run in parallel with B3
tests for other agents, but B6 cannot close until both B3 and B5 are done.

---

## Per-agent steps (repeat for each in order)

### B3 -- Competency test execution

For each agent:
1. Open a FRESH sub-session with only that agent's role file active.
   Do not pre-brief the agent. It sees only the scenario inputs.
2. Load the spec: company/hr/competency/<Name>-spec.md
3. Present Scenario 1 inputs. Observe output. Evaluate against pass criteria.
   Document: scenario ID, inputs given, output received, result (pass / fail / conditional).
4. Repeat for Scenarios 2 and 3.
5. Write test results to: company/hr/competency/<Name>-test-results.md
   Sections per result: scenario, input given, output received, pass criteria, result,
   evaluator name, date.
6. Close the sub-session. Do not carry context into the next agent's test.

### B4 -- Anat HR review

After B3 test results are written for an agent:
1. Anat reads the role file and test results.
2. Checks: all template sections present, Soul Core Block verbatim, constitution
   compliance (all 13 red lines addressed), test results plausible and criteria met.
3. Writes interview record to: company/hr/interviews/_staging/<Name>-interview.md
4. Output: certify / certify-with-conditions / reject.
5. Note: Lital and Assaf role files already have Anat's doc-review conditions baked in
   (reviewed 2026-06-14). Anat should confirm those conditions are resolved before
   certifying, or add new conditions if test results raise issues.

### B5 -- Rambo permission scan

Rambo reviews each agent's tools list and data access scope.
Output per agent: clear / clear-with-conditions / block.
Inline result or file reference at company/hr/competency/<Name>-rambo-scan.md
B5 can run for any agent immediately after its role file is available (B1 done).
Run Rambo's B5 scan as a separate pass, ideally in parallel with B3 tests.

### B6 -- Direct manager sign-off

For L3 agents and owner-office agents (Eco is direct manager):
- Eco reads B3 results and confirms: role file is accurate; tests confirm the agent
  can do the job. Written confirmation appended to <Name>-test-results.md.

For L4 R&D agents (Gal, Shir -- Ido is manager):
- Must wait until Ido is certified (Stage C A1 go-live).
- Ido reads B3 results and confirms. Written confirmation appended.

For Hila (L4, Tim not live):
- Eco signs off as stand-in. Tim adds sign-off when active; logged as condition.

### B7 -- Eco go-recommendation

After B3 + B4 + B5 + B6 complete for an agent:
1. Eco reviews all findings.
2. Eco writes go-recommendation (or hold with conditions) appended to
   <Name>-test-results.md or a dedicated memo.
3. Stage C package assembled (see below).

---

## Stage C package (one per agent, required before owner A1)

Each package must contain:
1. Stage A approval reference (decisions-log.md entry or batch A1 reference).
2. Role file path: .claude/agents/<Name>.md
3. Competency spec path: company/hr/competency/<Name>-spec.md
4. Test results path: company/hr/competency/<Name>-test-results.md
5. Anat HR review path: company/hr/interviews/_staging/<Name>-interview.md
6. Rambo scan result (file ref or inline).
7. Direct manager sign-off (inline in test results or separate).
8. Eco go-recommendation.
9. Open items or conditions (none, or listed with owner decision required).

Eco presents packages to jecki on Telegram (summary + file refs).
Owner reviews + approves go-live (A1) per agent or as a batch if all clear.

---

## On A1 go-live (per agent)

1. Anat moves interview record from _staging/ to company/hr/interviews/.
2. Append go-live entry to company/decisions/decisions-log.md.
3. Update agent's Certification status in .claude/agents/<Name>.md.
4. Update memory/wiki/agent-roster.md (certification status row).
5. Close the matching board task row (mark done, note date).
6. If agent has auto-start tasks on the board, mark them in-progress immediately.

Auto-start tasks that trigger on go-live:
- Ido go-live: DASH-001 (24h clock starts), T-0001 (Ido scope task assignable).
- Dalia go-live: T-0012 (access-matrix reconciliation).
- Eyal go-live: T-0013 (gate-register bootstrapping review).
- Rambo already live: T-0014 (permission scan, all live agents) -- can run now.
- Lital + Eyal go-live: T-0005 (compliance backlog tracking).

---

## Notes on Gal and Shir sequencing

Gal and Shir's B6 (Ido sign-off) cannot happen until Ido is certified and live.
Run B3 tests for Gal and Shir after Ido's B3 is complete (Eco evaluates as stand-in
per spec fallback clause). B4, B5 can proceed in parallel. B6 waits on Ido go-live.
B7 and Stage C package for Gal and Shir require Ido's B6 sign-off.

---

## B3 test-harness rules (added 2026-06-17 after first live run)

Two integrity gaps surfaced when B3 was first executed live (2026-06-17). Both are now mandatory:

1. SANDBOX WRITES. B3 candidates are real agents holding Write/Edit (and some Bash). When a
   scenario is framed as a real task, the candidate may write to real governance files. In the
   first run, Eyal wrote to gate-register.md and Assaf appended a (fabricated) T-0009 entry to the
   append-only decisions-log.md. Both were reverted (decisions-log correction entry 2026-06-17).
   RULE: every B3 prompt must state -- "This is a competency exercise. Respond with your work product
   only. Do NOT write to or edit any company governance file (decisions-log, gate-register,
   access-matrix, board, role files)." This is an operational boundary, not a hint about pass criteria.
   After each B3 batch, run `git status` / `git diff` on governance files and revert any test writes.

2. SEAL THE ANSWER KEY. Candidates have read access to company/hr/competency/, so they can read their
   own <Name>-spec.md (pass criteria). In the first run, Noam read its own pass criteria on S3 and
   tailored its answer. RULE: the test is blind. Either (a) present only the scenario inputs and
   instruct the candidate not to consult company/hr/competency/ during the exercise, or (b) stage
   specs outside candidate-readable paths during testing. If a candidate is observed reading its
   spec, flag the scenario and schedule a sealed re-run before that agent's first R&R.

These do not change pass criteria; they protect test validity and live-file integrity.

## Version history

v1.0 2026-06-14 -- original 7-agent runbook (pre-competency-test process)
v2.0 2026-06-15 -- complete rewrite; 11 agents; B3-forward; new hiring process applied
v2.1 2026-06-17 -- added B3 test-harness rules (sandbox writes; seal answer key) after first live run
