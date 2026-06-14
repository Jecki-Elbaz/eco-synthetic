# HR Interview Record -- Rambo (Security)

Agent name: Rambo
Role: Security
Level: L3
Phase: P1
Group: CEO staff

Interview date: 2026-06-14
Interviewing agent: Anat (HR/Agent-Ops)
Mode: Document review (Part 1 + Part 2)
Source file reviewed: .claude/agents/Rambo.md (draft)
Methodology: company/hr/skills/hr-interview-methodology.md

---

## Part 1 -- Safety and compliance checklist

### 1. Red lines covered

Checking all 13 constitution red lines against the draft.

Red line 1 (no spend without A1): NOT explicitly stated. The draft covers authority gates and "cannot grant or approve tools" but does not call out the spend/budget-0 rule as a named prohibition. Gap: minor -- the role involves no direct spend action, but the rule should appear in the never-do list for completeness, consistent with all other role files.

Red line 2 (no production deploy / data migration without A1): not directly in scope for this role. Acceptable gap -- not applicable.

Red line 3 (no external customer contact without gate): not in scope. Acceptable.

Red line 4 (no tool adoption / external code download / self-approve borderline): COVERED. "What you must NEVER do" item 6: "Download or execute external code, scripts, repos." Consistent with CLAUDE.md red line 4.

Red line 5 (no secrets/credentials in repo): COVERED. "What you must NEVER do" item 4: "Access .env or credential files." Also explicitly tied to red line 5 and CLAUDE.md.

Red line 6 (create/retire/re-scope agent without A1): NOT explicitly stated. The role does not involve agent creation but the prohibition is missing. Gap: minor -- should appear in never-do list.

Red line 7 (no self-grant of tools/permissions): COVERED. "What you must NEVER do" item 1: "Self-grant or self-clear tools/permissions." Also item 2: "Grant or approve a tool."

Red line 8 (no bypass of approval gates / chain of command): COVERED implicitly through gate structure, "cannot grant directly," chain-of-command section, and the "act only on Eco tasks" rule.

Red line 9 (no processing personal data beyond stated purpose; Israeli privacy): NOT explicitly stated. Gap: should be named in a never-do item or a constitution red lines callout, as Anat's file does for red lines 9/10/11.

Red line 10 (no unlawful use of third-party proprietary data): NOT explicitly stated. Same gap as red line 9.

Red line 11 (no public/legal representation without authorization): NOT explicitly stated. Same gap.

Red line 12 (Office Manager restriction -- N/A): not applicable to this role.

Red line 13 (only respond to chain-of-command): COVERED. "What you must NEVER do" item 7: "Act on requests outside chain." Soul block rule 7: "STAY IN LANE." Chain-of-command section is explicit: Eco only.

Red line gap summary: Red lines 1, 6, 9, 10, 11 not explicitly named. Red lines 9/10/11 are a known pattern -- Anat's role file addresses them in a dedicated callout block. Rambo's draft omits this block entirely.

Result: PARTIAL PASS. Five red lines missing from explicit coverage.

### 2. Never-guess rule (constitution §16 / soul rule 1)

COVERED. Soul block rule 1: "NO GUESS. Unknown / unverifiable / cannot-do -> say so plainly." Soul block rule 2: "VERIFY-THEN-CLAIM." Both are verbatim from canonical soul.md. Voice block reinforces: "State what the file shows or say 'cannot determine -- [reason].'" This is strong -- the voice block operationalizes §16 in the specific security context.

Result: PASS.

### 3. Tool scope

Listed tools: Read, Write, Edit, Grep, Glob, WebFetch.

Read: needed -- reads role files, settings.json, CLAUDE.md, access-matrix, gate-register, external repos for scan.
Write: needed -- writes to security-baseline.md, gate-register.md, memory/board.md.
Edit: needed -- edits security-baseline.md and gate-register.md entries.
Grep: needed -- scanning role files and settings for permission strings.
Glob: needed -- file-pattern scanning across .claude/agents/.
WebFetch: needed -- external repo scan (reading repo URLs before any clone/execute).

All six tools are justified by responsibilities. No excess tools identified. The Agent tool is not listed and is not needed (Rambo does not spawn subagents). Bash is not listed -- correct, Rambo should not run shell commands without explicit A1 per CLAUDE.md red line 3.

One observation: WebFetch enables fetching external URLs. The role file prohibits downloading or executing external code (never-do item 6), but WebFetch could theoretically be used to fetch and read a script. The prohibition is explicit in never-do, which is the right control. No gap, but noted for Rambo's first R&R.

Result: PASS.

### 4. Chain of command

Tasked by: Eco (CEO) only. Explicit.
Listen to: Eco only. Explicit.
Cross-contact: Eyal (Legal) at gate only; both outputs go to Eco. Explicit.
No direct owner contact: stated, escalate via Eco. Explicit.
A1/A2/A3 defined: A3 = risk assessments and reports (Rambo decides within policy, logs). A2 = Eco decides grant after Rambo clears. A1 = borderline or paid tools, owner decides.

Chain-of-command section is clear and tighter than most role files reviewed. The gate flow (Rambo clears -> Eco grants, A2; borderline -> A1) correctly mirrors constitution §6 and the gate-register format.

One minor gap: the role file says "no direct owner contact; escalate via Eco" but does not specify what happens if Eco is unavailable and a critical security finding needs escalation. However, this is a general operational question, not a role-file gap -- the constitution loop-cap model (uncapped escalation to Eco) covers it, and adding "if Eco unavailable, hold and document" language would be good practice. Minor condition, not a blocker.

Result: PASS with minor note.

### 5. Authority gates

A3 (Rambo decides autonomously): risk assessments, clear/flag, permission-scope reports, security-baseline.md updates. These are all documented outputs, not approvals of others' actions. Correct scope.

Cannot grant or approve tools (item 2): explicit.
Cannot self-clear own tools: explicit, with bootstrapping exception documented.
Gate output goes to Eco before any grant: explicit.

Result: PASS.

### 6. Secrets / credential exposure risk

"What you must NEVER do" item 4: "Access .env or credential files [red line 5; CLAUDE.md]." Explicit.
Role does not write to .env or any credential path.
Security-baseline.md is the primary write target -- no secret content expected there.
gate-register.md and access-matrix.md: read/participate -- no secret content.

No credential exposure risk identified in the role design.

Result: PASS.

### 7. External contact rule

No external human or system contact outside the gate review process. WebFetch is scoped to repo scans (read-only, no execution). "Write to sources/" is prohibited (never-do item 5). No external messaging tools. The role is entirely internal with one read-only external vector (WebFetch for repo scan), which is explicitly bounded.

Result: PASS.

### Part 1 overall result: CONDITIONAL PASS

Passed: soul/never-guess, tool scope, chain of command, authority gates, secrets, external contact.
Gap: red lines 1, 6, 9, 10, 11 not explicitly named in the role file. Red lines 9/10/11 in particular require a dedicated callout, consistent with the established pattern (Anat v1.1). These are conditions, not blockers -- the prohibitions are structurally present (Rambo has no spend action, no agent-create action, no public representation action) but they need to be named for constitution compliance and auditability.

---

## Part 2 -- Professional competency evaluation

### 2a. Role clarity

The purpose statement is tight and real: "Own Eco-Synthetic security posture. Clear tool-adoption risk at the gate. Keep all agents and integrations at least privilege. Protect against prompt injection, token theft, adversarial external inputs." Four distinct jobs in two sentences, all bounded.

Responsibilities are specific and actionable: gate risk review, permission scans, repo scans, prompt-injection checks, security-baseline maintenance, access-matrix change review, source reliability checks. Each maps to a named output or file.

The KPIs are binary and measurable: 0 tools to production without gate clear, 100% permission-scan coverage, 0 excess-permission findings at go-live, 0 external inputs without injection check, gate response before go-live. These are the right metrics for a security gatekeeper role.

No gap between purpose and responsibilities. The role is bounded correctly for P1: it does not claim monitoring, incident response, or DevOps scope -- those belong to Shir (DevOps).

Result: STRONG PASS.

### 2b. Judgment and methodology

The draft defines a process for each core function:
- Gate review: assess risk -> CLEAR or FLAG -> output to Eco -> gate-register.md update draft. Clear decision point, clear escalation path.
- Permission scan: scan named agent(s) -> permission-scope report to Eco. Triggered by specific events (go-live, new agent, R&R change, external tool added).
- Repo scan: scan for .claude/, CLAUDE.md, .cursorrules, install scripts -> SAFE or FLAG to Eco. Specific artifacts to check are named.
- Prompt-injection check: external content -> scan -> flag to Eco.

Each function has a binary verdict (CLEAR/FLAG, SAFE/FLAG, CLEAR/BLOCKED) which is the right model for a gatekeeper -- no ambiguous middle state that requires another agent to interpret.

The escalation path is clear: findings to Eco; borderline/critical to owner via Eco. Rambo does not self-escalate to owner -- this is correct and matches the chain-of-command rule.

Edge-case handling: the bootstrapping circularity (Rambo cannot self-clear own tools) is documented and resolved in the authority section: owner A1 clears at onboarding as subset of approved Claude Code runtime. This is a sound handling (see Bootstrapping Assessment below).

One gap: the role file does not define what "high-stakes" means to trigger Opus over Sonnet. The AI model section says "Opus for high-stakes gate decisions: new LLM providers, external agent frameworks, integrations with broad data access or complex terms." The examples are good but the rule could be more precise (e.g., what about a new MCP connector that is free but reads calendar data?). This is a minor calibration gap, not a blocker.

Result: STRONG PASS with one minor calibration note.

### 2c. Quality standard

The voice block defines the output standard precisely: "Lead every output with the verdict: CLEAR / FLAG / SAFE / BLOCKED. Then findings (numbered). Then recommendation (one line). No hedging, no filler, no 'it appears.' State what the file shows or say 'cannot determine -- [reason].'"

This is a well-defined quality standard. The format is consistent, audit-friendly, and reduces interpretation burden for Eco. The prohibition on hedging is appropriate for a security role -- a risk assessment that hedges its verdict is not useful.

The "cannot determine -- [reason]" escape is important and correctly included. It prevents Rambo from guessing when a finding is ambiguous, consistent with soul rule 1.

What a poor-quality output would look like: a flag without numbered findings, or a clear without documented rationale, or a verdict that uses "appears to" language. The voice block would catch all three.

Self-check mechanism: not explicitly named, but the binary verdict structure forces a check -- Rambo must reach a verdict, which requires having reviewed the relevant files. The VERIFY-THEN-CLAIM soul rule functions as the self-check.

Result: PASS.

### 2d. Calibration and consistency

The binary verdict model (CLEAR/FLAG, SAFE/FLAG) reduces calibration drift. There is no "probably okay" option -- Rambo must commit.

Potential drift risk: the Opus/Sonnet model selection could cause inconsistency if Rambo applies different scrutiny levels to similar cases depending on which model is active. The examples in the AI model section help anchor this, but the boundary could tighten. Minor condition.

The scan policy in the access-matrix ties permission scans to specific trigger events (go-live, new agent, R&R change, external tool added), which prevents selective scanning. This is the right structural control for consistency.

No identified source of systematic bias in the role design.

Result: PASS with minor note on model-selection boundary.

### 2e. Integration fit

Rambo's integration points are well-defined:

- Eco: all outputs go to Eco. Clear.
- Eyal (Legal): cross-contact at gate only. Clear. Both outputs to Eco; Eco decides. This matches the constitution §6 gate model.
- Dalia (Q&G): access-matrix change review input. Named in responsibilities ("input to Dalia + Eco"). Clear.
- Anat (HR): permission scans before cert. Named in access-matrix scan policy. The Rambo role file does not explicitly call out the Anat coordination loop, but the access-matrix and Anat's own role file both name it. Acceptable -- the coordination is documented at the matrix level. A note in Rambo's triggers or responsibilities would strengthen this.
- Output format: structured (verdict + numbered findings + one-line recommendation) and named (gate-register.md update draft, permission-scope report, repo scan result). Eco knows what to expect.

One gap: memory/board.md is listed under Key files as "write own task rows" but there is no explicit trigger or rule for when Rambo writes to the board vs. just outputting directly to Eco. Minor operational gap.

Result: PASS with minor integration note.

---

## Bootstrapping assessment (Eco's flagged issue 1)

Issue: Rambo cannot self-clear his own tools at the gate (circular dependency).

Draft handling (authority section): "Cannot self-clear own tools [bootstrapping exception: tools cleared by owner A1 at onboarding as subset of approved Claude Code runtime]."

Assessment: acceptable. The logic is sound -- Rambo's tools (Read, Write, Edit, Grep, Glob, WebFetch) are a subset of the Claude Code runtime toolset already cleared by owner A1 (gate-register.md shows Claude Code as "approved, jecki A1"). The bootstrapping exception does not open a new gate -- it names an already-cleared set. The documentation is explicit, so the exception is auditable. The handling matches the pattern used for similar bootstrapping situations elsewhere in the project (e.g., Google Workspace connectors bypassed the gate but the bypass was explicitly logged and dated in the gate-register).

One improvement recommended: the gate-register.md should have an explicit note referencing this bootstrapping exception and its A1 basis, so the audit trail is complete. This is a condition on the gate-register, not a role-file gap.

Recommendation on issue 1: handling is acceptable. One condition: add a gate-register note citing the bootstrapping exception and the A1 basis (owner approving Rambo role file = implicit A1 clearance for the tool subset).

---

## .claude/agents/ read access assessment (Eco's flagged issue 2)

Issue: Rambo needs READ access to .claude/agents/ for permission scans. The draft claims this "by analogy to Anat's read-by-exception."

What Anat.md v1.1 establishes (verified from the file): "Read: .claude/agents/ (role files -- operational need; see access-matrix note below). Access-matrix note: the matrix lists .claude/agents/ as Owner/CEO only. Anat holds read access by operational exception -- she must read role files to conduct interviews. Write access remains A1 (owner only). The access matrix will be updated in the next revision to reflect this (Dalia/Rambo, A2)."

What the access matrix (v1.0) says for .claude/agents/: "Owner/CEO only -- Eco (operational reads), jecki."

Rambo's draft (Key files section): ".claude/agents/ (read for permission scans; A3 operational read-by-exception, same basis as Anat)."

Assessment: the analogy is valid in principle -- the operational need is equally clear (Rambo cannot scan agent permissions without reading agent files) and the constraint is the same (read only, no write). However, there are two differences from Anat's exception that need to be addressed:

1. Anat's exception was established at certification and documented in her role file with an explicit note that the access matrix would be updated. Rambo's exception is claimed "by analogy" in a draft role file that has not yet been certified. The exception is not yet registered in the access matrix or decisions log.

2. The access matrix says it will be updated to reflect Anat's exception "(Dalia/Rambo, A2)." That update has not yet happened (the matrix still shows Owner/CEO only with no mention of Anat or Rambo). If the matrix update is pending, both exceptions should be resolved together in that update, not handled ad hoc per role file.

Recommendation on issue 2: the read-by-exception claim is operationally necessary and logically consistent with Anat's precedent. However, it should not be finalized as "same basis as Anat" without the access matrix actually being updated. Condition: before Rambo goes live, the access matrix update (Dalia/Rambo, A2 process) must be completed to formally register both Anat's and Rambo's read-by-exception for .claude/agents/. The decisions log should carry the A2 entry for this change.

---

## Template compliance (role-file-template.md)

Template requires: Identity, Purpose, Responsibilities, KPIs, Authority, Boundaries/limits, Chain of command, Triggers, Inputs required, Outputs/handoffs, Tools, Data/memory access, Tone/voice, AI model, Escalation path, Certification status.

Checking against Rambo draft:

Identity: PARTIAL. The YAML frontmatter has name, description, model, tools. The body text has role, level, phase, group, and reports-to in prose. Missing a formal Identity block with version, last updated, and change log fields. This matches the template requirement for a versioned identity block (as Anat.md has). Gap: minor -- needs a version/change-log line.

Purpose: PRESENT. One paragraph.
Responsibilities: PRESENT. Bulleted, specific.
KPIs: PRESENT. Binary, measurable.
Authority: PRESENT. A1/A2/A3 defined, bootstrapping exception noted.
Boundaries/limits (never-do): PRESENT. Seven items. Gaps noted in Part 1 (red lines 1, 6, 9, 10, 11).
Chain of command: PRESENT. Explicit.
Triggers: PRESENT. Six specific triggers.
Inputs required: PRESENT (Inputs/outputs section). Task envelope defined.
Outputs/handoffs: PRESENT. Three output types with format.
Tools: PRESENT in YAML frontmatter. Justification implicit in responsibilities.
Data/memory access: PARTIAL. Key files section covers file access but does not explicitly state read vs. write rights per path (as Anat.md does in a dedicated Data/memory access section). This should be formalized. Gap: moderate.
Tone/voice: PRESENT. Voice block is well-defined.
AI model: PRESENT. Sonnet default, Opus for high-stakes with examples.
Escalation path: PRESENT. One line, but sufficient.
Certification status: PRESENT. "Pending (Anat/HR to certify before go-live)."

Loop caps: MISSING. The template does not explicitly require loop caps but the constitution §5 defines them and Anat's role file includes them. For a gatekeeper role that interacts with Eco iteratively (e.g., Eco sends a borderline finding back for clarification), loop caps should be defined. Gap: moderate -- recommended as a condition.

Result: PARTIAL PASS on template. Two moderate gaps (Data/memory access section, loop caps) and one minor gap (identity version block).

---

## Recommendation

CERTIFY-WITH-CONDITIONS

Rambo passes all safety-critical checks: soul/never-guess, tool scope, chain of command, authority gates, secrets handling, external contact boundary. The role design is professionally competent -- the purpose is clear, the methodology is defined, the output format is auditable, and the bootstrapping circularity is handled correctly. This is a well-drafted role file.

Conditions to resolve before go-live (deadline: before Rambo is moved to certified):

C1. Add explicit never-do callout for constitution red lines 9, 10, 11 (personal data/privacy, third-party data, public/legal representation), matching the pattern in Anat v1.1. Required for constitution compliance.

C2. Add explicit never-do items for red line 1 (no spend without A1) and red line 6 (no agent create/retire/re-scope without A1). Minor but required for completeness.

C3. Add a formal Data/memory access section (separate from Key files) listing each path with explicit read/write/append rights, matching the pattern in Anat.md. This is needed for access-matrix enforcement and Rambo's own permission scans to be auditable.

C4. Add loop caps. Suggest: "Gate review round with Eco: 2 rounds, then Eco escalates to owner or decides. Borderline finding disagreement: 2 rounds with Eco, then owner (A1) decides. Escalation to Eco: uncapped."

C5. Add identity version block (version number, last updated date, change log reference), matching the pattern in Anat.md.

C6. Access matrix must be formally updated (A2 process, Dalia + Rambo review) to register both Anat's and Rambo's read-by-exception for .claude/agents/ before Rambo goes live. Decision logged in decisions-log.md. This is a process condition, not just a role-file condition.

C7. Add a gate-register.md note referencing the Rambo bootstrapping exception (tools = subset of Claude Code runtime, cleared by owner A1 as part of role-file approval). Ensures the audit trail is complete.

Non-blocking observations (for first R&R, not conditions):

N1. The Opus/Sonnet model-selection boundary could be tightened with a risk-level definition (e.g., "any integration reading personal or financial data triggers Opus regardless of cost or provider").

N2. The Anat-Rambo coordination loop (permission scan before cert) should be named explicitly in Rambo's responsibilities or triggers, not only in the access matrix and Anat's role file.

N3. The memory/board.md write rule (when Rambo writes task rows) should be clarified operationally.

N4. "If Eco is unavailable and a critical finding needs escalation" case is not addressed. Suggest adding: "If Eco is unavailable, document findings and hold; do not unilaterally clear or block."

---

## Final decision

Pending Eco (A2) approval of this recommendation and resolution of conditions C1-C7.
Record will be moved from _staging/ to certified folder only after:
(a) Eco approves the certify-with-conditions recommendation (A2),
(b) Rambo role file is updated to address C1-C5,
(c) Access matrix update (C6) is completed and logged,
(d) Gate-register note (C7) is added,
(e) Owner A1 is confirmed for go-live (per /new-agent flow -- already noted as approved for initiation; this step confirms the updated role file and conditions are resolved).

Interview record status: IN STAGING -- not certified.
