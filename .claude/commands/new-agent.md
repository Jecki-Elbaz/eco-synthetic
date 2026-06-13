# /new-agent

Usage: /new-agent <Name> -- <role / title>
Example: /new-agent Rambo -- Security (L3 staff, P1)

Draft a new agent (or re-scope an existing one) to the company standard: role file plus
inherited soul plus per-agent voice plus all register updates. This command DRAFTS ONLY and
stops at the A1 gate. Creating, re-scoping, or retiring an agent is A1 (constitution red
line 6); the `.claude/agents/` folder is owner/CEO only. Nothing here goes live on its own.

The output shape must match the reference implementation in `.claude/agents/Shelly.md`.

## Refuse conditions (check first)
- Refuse if the requester is not the owner (jecki) or Eco (CEO). Agent creation is
  owner-gated. Escalate any other requester (red line 13).
- This command never marks an agent live, never grants a tool, and never finalizes the
  decisions log. If asked to skip the A1 gate, refuse and explain.

## Steps

1. Place the agent before drafting (verify, do not guess). READ first:
   - `company/roster.md` (where it fits, level, phase, manager)
   - `company/org-chart.mermaid` and `company/constitution.md` sections 4 and 5 (hierarchy
     and communication)
   - `company/governance/access-matrix.md` (data access neighbours)
   If the name or slot is unclear, ask the owner rather than assuming.

2. Run the intake (the HR interview, constitution section 10). Confirm or gather:
   - Identity: name, role/title, level (L1-L5), phase, group, manager (reports to).
   - Purpose (1-2 sentences) and the outcome it owns.
   - Responsibilities and KPIs / success metrics.
   - Authority: default gate (A1/A2/A3) and what it may decide alone.
   - Chain of command: who may task it, who it listens to, cross-group rules. This drives
     Core Block rule 7 and red line 13.
   - Triggers, required inputs (task envelope), outputs / handoffs (result envelope).
   - Tools needed (least privilege) and AI model (Haiku / Sonnet / Opus, with escalation).
   - Data / memory access scope and escalation path.

3. Tool gate (constitution section 6). For every tool requested:
   - It must pass Security (Rambo) risk and Legal (Eyal) terms before grant. Budget is 0,
     so only free tools pass; any paid tool is A1.
   - In the draft frontmatter, include ONLY tools already cleared. List anything new under a
     "Tools pending gate" note. Never self-grant (red line 7).

4. Build the role file at `.claude/agents/<Name>.md`, mapping `company/role-file-template.md`
   into the Shelly reference shape, in this order:
   - Frontmatter: `name`, `description` (third person, when-to-use), `model`, `tools`
     (cleared tools only).
   - One intro line, then the inheritance note pointing to `company/soul.md`.
   - "## Soul -- core (non-negotiable)": paste the Core Block VERBATIM from the current
     `company/soul.md`. Copy the live canonical text; never hand-edit it here.
   - Role sections: Purpose, Responsibilities, Authority and gates, Chain of command,
     What you must NEVER do (role-specific boundaries ONLY; do not repeat Core Block rules),
     Triggers, Inputs / outputs, Key files, Escalation path.
   - "## Voice -- <Name> (<role>)": the agent's delta only -- how it sounds, what it leads
     with, its characteristic care or caution per audience. Keep it lean (constitution
     section 9: files stay lean and link to the data slice rather than copying it).
   - AI model section. Certification status: Pending (Anat/HR before go-live).
   - Plain ASCII throughout (Core Block rule 5).

5. Draft the register updates (as drafts, for approval):
   - `company/roster.md`: add or update the agent's row.
   - `company/governance/access-matrix.md`: add its data/memory access.
   - `company/governance/gate-register.md`: register any new tools as pending gate.
   - Prepare (do NOT write) the proposed append-only entry for
     `company/decisions/decisions-log.md`. That file is append-only and finalized only on A1.

6. HR acknowledgment (constitution section 10): present the drafted R&R and confirm it is
   "clear and achievable." Capture the acknowledgment or the feedback to send up the chain.

7. Present the A1 package and STOP: the drafted role file, the register diffs, the pending
   tool-gate items, and the proposed decisions-log entry. Tell the owner exactly what will
   happen on approval (commit, log the decision, HR certifies, agent goes live).

## Never
- Never create, re-scope, or retire an agent without owner A1 (red line 6).
- Never grant a tool or permission without the Security + Legal gate (red line 7); list
  pending tools, never self-grant.
- Never paste a hand-modified Core Block; copy the canonical text from `company/soul.md` so
  all agents stay in sync. If the soul changes, re-propagate to every agent.
- Never repeat Core Block rules inside the role-specific sections (keep files lean).
- Never guess placement; READ the roster and access matrix first (Core Block rules 1-2).
- Plain ASCII only.
