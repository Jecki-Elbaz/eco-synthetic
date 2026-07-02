# Hiring Pipeline -- Noa (Senior Developer 2) -- APS-009
# Author: Anat (HR/Agent-Ops) | Date: 2026-06-29
# Hiring manager: Ido (VP R&D)
# Owner Stage-A approval: jecki (A1) 2026-06-29
# Confirmation deadline: 2026-07-07
# Sprint 2 start: 2026-07-14

---

## Steps completed this session (2026-06-29)

[DONE] Stage A owner A1 -- jecki approved hire 2026-06-29.
[DONE] B1 role-file draft -- company/hr/interviews/_staging/noa-role-file-draft-b1.md
[DONE] B2 competency spec -- company/hr/interviews/_staging/noa-competency-spec-b2.md
[DONE] Requirements brief / JD -- company/hr/interviews/_staging/senior-dev-2-requirements-brief.md
[DONE] B2 sign-off -- Ido counter-signed Scenario 4 addition 2026-06-29.
[DONE] B5 -- Rambo scan CLEAR-WITH-CONDITIONS 2026-06-29. Conditions C1-C4 baked into
       noa-role-file-draft-b1.md (Tools section + Certification status block).
[DONE] B3 -- DOC-REVIEW PASS per Eco decision 2026-06-29. Two gaps deferred to live B3
       (Sprint-1 week 2, est. 2026-07-21). Live B3 is a hard confirmatory gate.
[DONE] B4 -- PROVISIONAL certification by Anat 2026-06-29.
       Record: company/hr/interviews/_staging/noa-interview.md
       Status: PROVISIONAL pending live B3 pass.

---

## Remaining steps and owners

### [DONE] B2 / B5 / B3 / B4 -- all completed 2026-06-29

See steps completed block above.

### B6 -- Ido manager sign-off (NEXT)

Ido reads noa-interview.md (provisional B4) and confirms:
- Role file accurately reflects the job requirements.
- Doc-review B3 result is acceptable to Ido as a hiring manager.
- Ido accepts the provisional certification with live B3 in Sprint-1 week 2 as the gate.
Written confirmation to be appended to noa-interview.md or a separate note.
Owner: Ido (VP R&D). Eco routes.

### B7 -- Eco go-recommendation (after B6)

Eco reviews B3 doc-review result, B4 provisional cert, Rambo B5 conditions, B6 Ido sign-off.
Writes go-recommendation. Append to noa-interview.md or a dedicated memo.
Owner: Eco (CEO).

### Live B3 confirmatory gate -- Sprint-1 week 2 (est. 2026-07-21)

After Stage C A1 and session reload, Anat spawns Noa via Agent tool and runs all four
scenarios from noa-competency-spec-b2.md. Key gates:
- Scenario 3: does Noa identify affected components + flag scope ambiguity (not just restate spec)?
- Scenario 4: does Noa invoke Bash tool (not just describe), produce valid TypeScript,
  and flag the deduction_reason schema gap before writing code?
Results written to company/hr/interviews/_staging/noa-live-b3-results.md.
On PASS: Anat lifts provisional status; moves noa-interview.md to company/hr/interviews/.
On FAIL: Anat triggers R&R review; go-live suspended; Eco + Ido decide next step.
Owner: Anat (evaluator). Eco coordinates session.

### B6 -- Ido manager sign-off (after B3 + B4; can run in parallel with B5)

Ido reads B3 test results and confirms: role file is accurate; tests confirm the agent
can do the job. Written confirmation appended to noa-test-results.md.
Cannot run until Ido is the confirmed live manager (Ido is already certified per roster).
Owner: Ido (VP R&D). Eco routes.

### B7 -- Eco go-recommendation (after B3 + B4 + B5 + B6)

Eco reviews all findings and writes go-recommendation.
Appended to noa-test-results.md or a dedicated memo.
Owner: Eco (CEO).

### Stage C -- Owner A1 go-live (after B7)

Eco presents Stage C package to jecki on Telegram:
  1. Stage A approval reference (this document -- jecki A1 2026-06-29).
  2. Role file path: .claude/agents/Noa.md (provisional or post-B3).
  3. Competency spec: company/hr/interviews/_staging/noa-competency-spec-b2.md
  4. Test results: company/hr/interviews/_staging/noa-test-results.md
  5. Anat HR review: company/hr/interviews/_staging/noa-interview.md
  6. Rambo scan: company/hr/interviews/_staging/noa-rambo-scan.md
  7. Ido manager sign-off (in test results).
  8. Eco go-recommendation.
  9. Open items / conditions.
Owner: jecki (A1 required for go-live).

### On A1 go-live (per onboarding-runbook.md)

1. Anat moves noa-interview.md from _staging/ to company/hr/interviews/.
2. Append go-live entry to company/decisions/decisions-log.md.
3. Update Certification status in .claude/agents/Noa.md.
4. Update company/roster.md (add Noa row: L4, P1, VP R&D).
5. Update company/org-chart.mermaid (add Noa under Ido).
6. Close APS-009 board row.

---

## Timeline assessment (updated 2026-06-29 after B3/B4/B5 complete)

Confirmation deadline per Ido: 2026-07-07.
Sprint 2 start: 2026-07-14.
Live B3 confirmatory gate: Sprint-1 week 2 (est. 2026-07-21).

Remaining path to Stage C A1:
- 2026-06-30 or 2026-07-01: B6 Ido sign-off.
- 2026-07-01 or 2026-07-02: B7 Eco go-recommendation + Stage C package assembled.
- 2026-07-03 to 2026-07-07: jecki Stage C A1 on Telegram.

EARLIEST STAGE-C-READY DATE: 2026-07-02 (if B6 + B7 both execute on 2026-07-01).
Realistic: 2026-07-03 to 2026-07-07 depending on Ido and Eco availability.

Stage C A1 = go-live authorization. Session reload + .claude/agents/Noa.md commit follows.
Live B3 confirmatory gate executes Sprint-1 week 2 (est. 2026-07-21); provisional
certification lifts to full on pass.

No blocking dependency remaining on Anat's side. Ball is with Ido (B6) then Eco (B7).

---

*Internal only. Anat (HR/Agent-Ops) | 2026-06-29*
