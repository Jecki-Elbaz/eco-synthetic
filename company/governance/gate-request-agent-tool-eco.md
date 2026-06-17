# Gate Request: Agent Tool for Eco (CEO) on Telegram Bridge

**Requested by:** Eco (CEO)
**Date:** 2026-06-15
**Gate task:** T-0020
**Route:** Eco -> Rambo (security risk review) -> Eyal (legal terms review) -> Eco (A2 or A1 if borderline) -> jecki (A1 final)

---

## What is being requested

Add the **Agent tool** to Eco's toolset specifically on the **Telegram bridge channel**
(the Claude Code session that powers the jecki-to-Eco Telegram bot).

The Agent tool is a built-in Claude Code capability. It allows an agent to spawn and task
other named agents (e.g., Rambo, Anat, Ido) and receive their output synchronously in the
same session. No new software, no new vendor, no new subscription -- it is part of the
existing Claude Code runtime already approved by jecki (A1, gate-register.md).

---

## Why it is needed

Without the Agent tool, Eco cannot reach any other company agent from the Telegram channel.
Every inter-agent task requires the owner to open a separate Claude Code session manually.
This makes the Telegram channel functionally incomplete as a command channel.

With the Agent tool, Eco can orchestrate the full company from the Telegram bridge -- the
channel becomes a real control center, and jecki no longer needs to relay between sessions.

---

## Scope

- **Who gets it:** Eco only. No other agent is being added or changed.
- **Where:** Telegram bridge session only. Not a global permission change to all sessions.
- **Which agents can Eco spawn:** Only agents already defined in `.claude/agents/` and
  already approved by jecki. No new agents are created by this grant.
- **What spawned agents can do:** Each spawned agent operates under its own existing role
  file and toolset. Eco cannot grant a spawned agent more than it already has.

---

## Risks for Rambo to assess

Rambo: please assess each of the following and provide CLEAR, PARTIAL-CLEAR, or FLAG with findings.

### R1 -- Prompt injection via Telegram

The Telegram channel is the entry point for this session. A malicious actor who can send
a message through the Telegram bot could attempt to craft a message that tricks Eco into
spawning an agent and issuing a harmful instruction.

Questions:
- Is the Telegram input already sanitized or passed raw to the session?
- Does the Claude Code Agent tool call the spawned agent with the raw user message, or
  only with a structured Eco-generated prompt?
- What is the injection surface? (Can a Telegram message reach a spawned agent's system prompt?)

### R2 -- Blast radius expansion

Currently, Eco in this bridge session has only Read/Write/Edit. The maximum damage from
a compromised Eco session is file reads/writes within the authorized paths.

With the Agent tool, Eco can spawn:
- Rambo (has WebFetch, Grep, Glob -- external network read)
- Gal/Shir when live (have Bash -- arbitrary shell execution)
- Ido when live (has Bash)

A compromised Eco + Agent tool = effective access to Bash and WebFetch even though Eco
does not have those tools directly.

Questions:
- Does the Claude Code Agent tool sandbox spawned-agent calls to prevent privilege escalation?
- Can Eco's session instruct a Bash-capable agent to run destructive commands if prompted?
- What is the actual blast radius increase?

### R3 -- Chain of command integrity

The Agent tool should only be usable to spawn agents in the company roster and chain of
command. It should not allow spawning arbitrary or external agents.

Questions:
- Is the Agent tool scoped to named agents in `.claude/agents/`?
- Can it be used to spawn agents by arbitrary description (not just by name)?
- Can a spawned agent re-task Eco or spawn further agents (loop risk)?

### R4 -- Audit and logging

For constitutional compliance (immutable audit log, §2), every Agent tool call should
be traceable.

Questions:
- Does the Claude Code runtime log Agent tool calls (who spawned what, when, what prompt)?
- Are spawned-agent outputs captured in the session transcript?
- Is there any gap in the audit trail?

### R5 -- Session isolation

The Telegram bridge session is persistent (recurring 2h wakeup). A spawned agent runs
within that session.

Questions:
- Does a spawned agent's context bleed into the parent session after the call ends?
- Can a spawned agent modify the parent session's memory or context?

---

## Relevant files for Rambo's review

- `.claude/agents/*.md` -- all role files (permissions per agent)
- `.claude/settings.json` -- current tool permissions / settings
- `company/constitution.md` -- §6 (tool gate), §2 (red lines), §3 (A2/A1 matrix)
- `CLAUDE.md` -- security deny-list; bridge context rules
- `company/governance/gate-register.md` -- existing approved tools
- `company/governance/access-matrix.md` -- who has what access
- `integrations/` -- bridge code (Shir's domain; read for context if needed)

---

## Eco's preliminary risk read (for Rambo's consideration, not a finding)

R1 and R2 are the material risks. If the Telegram input passes raw to spawned agents,
and Rambo finds no sanitization layer, this may be borderline A1 (not just A2) because
the blast radius expansion is significant. I am not pre-determining the finding --
that is Rambo's job. I flag it so the finding is calibrated.

---

## Output expected from Rambo

Per Rambo's output spec:
- CLEAR / PARTIAL-CLEAR / FLAG verdict on each risk (R1-R5)
- Overall: CLEAR, PARTIAL-CLEAR (with conditions), or FLAG (blocked)
- If CLEAR or PARTIAL-CLEAR: draft gate-register.md row for Eco to confirm
- If FLAG: findings and recommendation for Eco to escalate to jecki

Deliver to Eco. Eco will relay to jecki with a recommendation on A2 vs A1.

---

## Legal scope note (for Eyal when live)

The Agent tool is part of the Claude Code runtime, already licensed and approved (A1,
gate-register.md). No new vendor. No new terms. Eyal's review: confirm that expanding
an existing approved tool's usage within the same subscription and same platform
does not require a separate terms review. If it does, flag it.
