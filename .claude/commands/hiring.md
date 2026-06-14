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
3. Direct manager runs test scenarios against the agent. Documents results
   (company/hr/competency/<Name>-test-results.md).
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
3. On A1: Anat certifies (moves from _staging/); decisions-log appended; agent committed.

### If --stage b: start from Stage B (Stage A A1 already exists)

READ decisions-log.md to confirm Stage A entry exists. Then follow Stage B steps above.

### If --stage c: start from Stage C (Stage B complete)

Verify all Stage B file paths exist (do not assert -- READ). Then follow Stage C steps.

## Key files
- Full process: company/processes/agent-hiring.md
- Competency specs: company/hr/competency/
- Anat staging: company/hr/interviews/_staging/
- Decisions log: company/decisions/decisions-log.md
