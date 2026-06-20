# Agent Hiring Process

Version: 1.0 | Created: 2026-06-14 | Owner: Eco (CEO) + Anat (HR)

Three-stage process. No stage may be skipped. Owner A1 required at Stage A and Stage C.
Build does not start before A1 at Stage A. Go-live does not start before A1 at Stage C.

---

## Stage A -- Hire Decision

Owner approves the DECISION TO HIRE, not the agent itself.

### Who runs it
- Direct manager: proposes + provides justification.
- Eco (CEO): reviews + adds recommendation.
- Owner (jecki): approves or rejects (A1).

### Inputs required
1. Role gap being filled and why this role now.
2. Why an agent vs alternatives (process change, tool, no action).
3. Group, level, phase, reporting line.
4. Proposed tools and model (least-privilege draft).
5. Dependency: which other agents or processes must exist first.

### Steps
1. Direct manager submits justification to Eco.
2. Eco reviews. Adds CEO recommendation: approve build / hold / reject, with rationale.
3. Eco sends to owner: manager justification + CEO recommendation.
4. Owner decides (A1). If approved: log in decisions-log.md. If rejected: log reason; done.
5. On A1: Eco triggers Stage B.

### Gate
Nothing is built until owner A1 at Stage A.

---

## Stage B -- Build and Competency Testing

The full hiring process. No owner action required until Stage C package is complete.

### Who runs it
- Eco (CEO): coordinates; owns delivery timeline.
- Direct manager: writes competency spec, runs tests, signs off.
- Anat (HR): doc review, soul compliance, constitution compliance, test result review.
- Rambo (Security): permission scan.

### Steps

**B1. Role file build** (via /new-agent)
- Draft role file following company standard (any current role file shape, e.g. Eco.md, md-style.md rules). (Shelly.md is retired -- Shelly separated 2026-06-20, now an external customer, see company/customers/shelly/profile.md.)
- Soul Core Block verbatim from company/soul.md.
- All template sections complete: Identity, Purpose, Responsibilities, KPIs, Authority, Boundaries, Chain of command, Triggers, Inputs, Outputs, Tools, Data access, Red lines, Loop caps, Escalation path, Voice, AI model, Certification status.
- File: .claude/agents/<Name>.md

**B2. Competency spec** (direct manager writes)
File: company/hr/competency/<Name>-spec.md
Sections:
- Domain knowledge requirements: explicit list of what the agent must know or be able to reason about.
- 3 test scenarios: representative tasks from the role's core responsibilities. Each scenario: inputs given, task description, what a passing output looks like (pass criteria).
- Evaluator: direct manager (L4 agents) or Eco (L3 agents).
- Pass threshold: all 3 scenarios must pass. Partial pass = conditions applied before go-live.

**B3. Competency test execution** (direct manager + agent)
- Direct manager runs each scenario against the agent in a fresh session.
- Agent sees only the scenario inputs -- no hints, no pre-briefing.
- Manager evaluates output against pass criteria. Documents result (pass / fail / conditional).
- File: company/hr/competency/<Name>-test-results.md
  Sections: scenario, input given, output received, pass criteria, result, evaluator name, date.

**B4. Anat (HR) review**
- Doc completeness check (all template sections present).
- Soul Core Block verbatim match.
- Constitution compliance (all 13 red lines addressed).
- Test results review: results plausible, criteria clear, no gaps.
- Output: certify / certify-with-conditions / reject.
- File: company/hr/interviews/_staging/<Name>-interview.md

**B5. Rambo (Security) permission scan**
- Review tools list for excess permissions.
- Review data access scope for least privilege.
- Flag any concern to Eco before Stage C.
- Output: clear / clear-with-conditions / block.

**B6. Direct manager sign-off**
- Manager confirms: role file is accurate, competency tests confirm the agent can do the job.
- Written sign-off appended to company/hr/competency/<Name>-test-results.md.

**B7. Eco go-recommendation**
- Eco reviews all B1-B6 findings.
- Eco writes go-recommendation (or hold with conditions).
- Stage C package assembled.

### Gate
Stage C does not start until all of B1-B7 are complete. No partial packages to owner.

---

## Stage C -- Go-Live Approval

Owner approves GOING LIVE, having seen all hiring process documentation.

### Who runs it
- Eco: assembles and presents package.
- Owner (jecki): approves or rejects (A1).

### Package contents (all required)
1. Stage A approval record (decisions-log.md entry).
2. Role file (final draft) -- path to .claude/agents/<Name>.md.
3. Competency spec -- path to company/hr/competency/<Name>-spec.md.
4. Competency test results -- path to company/hr/competency/<Name>-test-results.md.
5. Anat HR review findings -- path to company/hr/interviews/_staging/<Name>-interview.md.
6. Rambo permission scan result (inline or file reference).
7. Direct manager sign-off (inline or file reference).
8. Eco go-recommendation.
9. Open items or conditions (none, or listed with owner decision required).

### Steps
1. Eco presents package to owner via Telegram (summary) + file references.
2. Owner reviews. Approves go-live (A1). Or: requests changes, which sends back to Stage B.
3. On A1:
   - Anat issues formal certification; moves interview record from _staging/ to company/hr/interviews/.
   - Decisions-log.md appended (go-live entry).
   - Agent file committed and merged to master.
   - Agent goes live.

---

## Escalation rules

- Stage A rejected: Eco logs, closes loop with manager.
- Stage B condition not resolved after 2 rounds: Eco decides; escalate to owner if A1 required.
- Stage C conditions: owner decides what changes are required before approval.
- Disagreement between Anat and direct manager on competency result: Eco decides.

---

## Key files

- .claude/agents/<Name>.md -- role file
- company/hr/competency/<Name>-spec.md -- competency spec
- company/hr/competency/<Name>-test-results.md -- test results
- company/hr/interviews/_staging/<Name>-interview.md -- Anat staging
- company/hr/interviews/<Name>-interview.md -- certified (post Stage C)
- company/decisions/decisions-log.md -- Stage A + Stage C log entries
- company/governance/gate-register.md -- tool clearances
