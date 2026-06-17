# /hiring

Usage: /hiring <Name> -- <Role/Title> [--stage a|b|c]
Example: /hiring Gal -- Lead Developer
         /hiring Gal -- Lead Developer --stage b
         /hiring --stage c Gal

Lead the 3-stage agent hiring process per company/processes/agent-hiring.md.
Eco (CEO) runs this. Owner (jecki) may invoke directly.

## Refuse conditions (check first)
- Refuse if requester is not Eco or jecki. Agent creation is owner-gated. [red line 6]
- Never skip Stage A -- no build without owner A1 hire decision.
- Never present Stage C to owner until ALL Stage B deliverables exist and are cited.
- Never invent test results, competency assessments, or manager sign-offs.

## Steps

### If no --stage flag: start from Stage A

**Stage A -- Hire Decision (owner A1 required before build)**

1. READ company/roster.md and memory/board.md to verify need and slot.
2. Ask direct manager for justification (role gap, why now, why agent, proposed tools/model).
3. Eco adds CEO recommendation.
4. Present to owner: manager justification + CEO recommendation + proposed role slot.
5. Wait for owner A1. On A1: append to company/decisions/decisions-log.md. Proceed to Stage B.

**Stage B -- Build and Competency Testing**

1. Run /new-agent <Name> -- <Role/Title> to draft role file.
2. Direct manager writes competency spec (company/hr/competency/<Name>-spec.md):
   - Domain knowledge requirements.
   - 3 test scenarios with explicit pass criteria.
3. Direct manager runs test scenarios against the agent (B3). Documents results
   (company/hr/competency/<Name>-test-results.md).
   B3 HARNESS RULES (mandatory; added 2026-06-17 after first live run):
   - SANDBOX WRITES: each scenario prompt MUST say "This is a competency exercise; respond with
     your work product only; do NOT write to or edit any company governance file (decisions-log,
     gate-register, access-matrix, board, role files)." After each batch, run git status/diff on
     governance files and revert any test writes. (First run: Eyal + Assaf wrote test data into
     gate-register and the append-only decisions-log; reverted.)
   - SEAL THE ANSWER KEY: candidates can read company/hr/competency/<Name>-spec.md (their pass
     criteria). Instruct the candidate not to consult that folder during the exercise, or stage
     specs out of reach. If a candidate reads its spec, flag the scenario and schedule a sealed re-run.
   - Run each scenario in a FRESH isolated sub-session (no context carry between scenarios).
4. Task Anat (HR) to review: doc completeness, soul compliance, constitution compliance,
   test result review.
5. Task Rambo (Security) to run permission scan.
6. Direct manager adds written sign-off to test-results file.
7. Eco writes go-recommendation. Assemble Stage C package.

**Stage C -- Go-Live Approval (owner A1 required)**

1. Verify all Stage B files exist (cite paths):
   - .claude/agents/<Name>.md
   - company/hr/competency/<Name>-spec.md
   - company/hr/competency/<Name>-test-results.md (with manager sign-off)
   - company/hr/interviews/_staging/<Name>-interview.md (Anat result)
   - Rambo scan result
   - Eco go-recommendation
2. Present full package to owner. Wait for A1.
   AUTO-GO-LIVE (owner standing rule, jecki 2026-06-17): if an agent passes with ZERO conditions
   (B3 all pass, Anat certify with no conditions, Rambo clear with no conditions, manager sign-off,
   no open items), Eco MAY activate it under the standing A1 without a fresh per-agent approval.
   ANY condition or open item -> HOLD for explicit owner A1. Conservative reading: any flag = hold.
3. On A1 (or zero-condition auto-go-live): Anat certifies (moves _staging/ -> company/hr/interviews/);
   cert-status line updated in .claude/agents/<Name>.md; decisions-log appended; roster + board updated.

### If --stage b: start from Stage B (Stage A A1 already exists)

READ decisions-log.md to confirm Stage A entry exists. Then follow Stage B steps above.

### If --stage c: start from Stage C (Stage B complete)

Verify all Stage B file paths exist (do not assert -- READ). Then follow Stage C steps.

## Key files
- Full process: company/processes/agent-hiring.md
- Competency specs: company/hr/competency/
- Anat staging: company/hr/interviews/_staging/
- Decisions log: company/decisions/decisions-log.md
