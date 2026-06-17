# Gate Review: Agent Tool for Eco (CEO) -- Telegram Bridge
# Rambo (Security) | T-0020 | 2026-06-15

Verdict: PARTIAL-CLEAR -- conditions required before A1 grant.
Gate level: A1 (owner sign-off required, not A2-sufficient).

---

## Files read for this review

- company/governance/gate-request-agent-tool-eco.md
- .claude/settings.json
- company/constitution.md
- CLAUDE.md
- company/governance/gate-register.md
- .claude/agents/Eco.md
- .claude/agents/Gal.md
- .claude/agents/Shir.md
- .claude/agents/Ido.md

---

## Why A1, not A2

Constitution §3: "grant a tool -- A2 after Security + Legal clear, borderline A1."
Constitution §6: "borderline A1."

The blast radius expansion (R2 below) is material: granting Agent tool to Eco on the
Telegram bridge converts a read/write-only session into a session with effective Bash and
WebFetch access via spawned agents. That is a capability tier jump, not a routine tool add.
Borderline rule applies. A1 required.

Eyal (Legal) review is also pending. Per constitution §6 and gate-register.md, both Security
and Legal must clear before any grant. Eyal is not yet live; Legal gate is incomplete. A1
cannot be issued until Eyal confirms (or owner explicitly waives Legal review at A1).

---

## R1 -- Prompt injection via Telegram

Severity: HIGH

Findings:
1. The Telegram bridge passes user-composed messages to the Eco session. There is no
   sanitization layer visible in any reviewed file. The bridge is a raw-input channel.
2. The Agent tool instructs a spawned agent with a prompt composed by the orchestrator (Eco).
   If a Telegram message manipulates Eco's reasoning, Eco may compose a malicious or
   unintended task envelope and pass it to a spawned agent.
3. Eco's role file (Eco.md) shows no explicit input-sanitization step before spawning.
   The soul rule "STAY IN LANE" and chain-of-command rules are behavioral constraints,
   not technical filters. An adversarial Telegram message does not trigger a hard block;
   it must be resisted by Eco's reasoning alone.
4. At present, only jecki can message the Eco Telegram bot (single-user bot token, .env).
   This substantially limits the injection surface to a trusted channel. However, this
   is an operational fact, not an architectural control. It is not enforced by code visible
   in this review.
5. No reviewed file shows the bridge injecting a context block that explicitly lists
   "available tools include Agent tool" or that forbids false completions in the spawning
   context. The memory/MEMORY.md note on bridge context blocks (feedback_agent_honesty.md)
   is an existing lesson; it is not confirmed applied to Agent tool invocations.

Mitigation required:
C1. Add an explicit AGENT TOOL SAFETY block to the Eco Telegram bridge context injection.
    It must: (a) list which agents Eco may spawn by name, (b) require task envelope
    validation before any spawn, (c) forbid spawning in response to unverified external
    content unless jecki explicitly confirms in-session.
C2. Owner confirms operationally that the Eco Telegram bot is single-user (jecki-only)
    and documents this control. If multi-user access is ever added, a new gate review
    is triggered automatically.

---

## R2 -- Blast radius / indirect privilege escalation

Severity: HIGH (primary risk)

Findings:
1. Eco's current Telegram bridge toolset: Read, Write, Edit, Bash (limited git/python/pytest
   per settings.json allow-list), google-calendar (read-only). No unrestricted Bash.
2. Gal (Lead Dev): Bash -- confirmed in Gal.md tools line. NOT YET LIVE (certification
   pending per Gal.md).
3. Shir (DevOps): Bash -- confirmed in Shir.md tools line. NOT YET LIVE (certification
   pending per Shir.md).
4. Ido (VP R&D): Bash -- confirmed in Ido.md tools line. Certification status: pending
   per Ido.md.
5. Rambo (Security): WebFetch -- confirmed live (bootstrapping A1, 2026-06-14).
   Granting Agent tool to Eco means Eco can spawn Rambo and instruct WebFetch calls.
   Rambo's chain of command rule ("tasked by Eco only") means Rambo WILL respond to Eco.
   This is an existing, live blast-radius vector.
6. Settings.json deny-list blocks rm -rf, curl, wget, force-push, reset --hard, sudo,
   and .env writes at the session level. These denies apply to the Eco session.
   CRITICAL GAP: it is not confirmed whether settings.json deny rules cascade to
   spawned-agent subprocesses or apply only to the parent session. If deny rules do not
   cascade, a spawned Bash-capable agent (when Gal/Shir/Ido go live) operates under
   its own session constraints, not the parent deny-list. Cannot determine from files
   reviewed whether Claude Code Agent tool enforces deny-list inheritance. This is an
   architectural unknown -- must be resolved before go-live for Bash-capable agents.
7. Indirect privilege escalation path (live today): Eco + Agent -> Rambo -> WebFetch(any URL).
   This is real and active. Rambo's role file prohibits acting on requests outside chain of
   command -- but Eco IS in Rambo's chain. The escalation path is legitimate by design.
   The risk is that a compromised Eco session can use Rambo to fetch arbitrary external content
   bypassing any future WebFetch restrictions on Eco directly.
8. When Bash-capable agents (Gal, Shir, Ido) are certified: blast radius expands further.
   A compromised Eco session + Agent tool could instruct Shir (DevOps) to run infra commands.
   Shir's own role file prohibits acting on requests from outside chain (Ido only; Eco only
   when Ido explicitly delegates). This is a behavioral constraint, not a technical one.

Mitigation required:
C3. Before granting Agent tool, owner must confirm (or Eyal/jecki must test and document)
    whether settings.json deny rules apply to spawned-agent subprocesses. If deny rules
    do NOT cascade, the grant of Agent tool to Eco is blocked until cascade is confirmed
    or until a compensating control is in place.
C4. For currently-live spawnable agents: Rambo is the only agent who is both live and
    has an elevated tool (WebFetch). Condition: Eco bridge context block must explicitly
    state that spawning Rambo for WebFetch is only authorized for security gate review
    tasks, not for general web access on behalf of Eco.
C5. When Gal, Shir, or Ido are certified: a new permission-scope scan and blast-radius
    re-assessment is required before those agents are reachable via Eco's Agent tool
    in the Telegram bridge. This condition survives this gate review and applies at each
    future certification.

---

## R3 -- Chain of command integrity

Severity: MEDIUM

Findings:
1. Claude Code Agent tool targets named agents by their agent file name in .claude/agents/.
   It does not spawn arbitrary external agents -- it is scoped to the existing roster.
   This is an architectural constraint of the Claude Code runtime, not a policy constraint.
   Assessed as LOW risk on this dimension.
2. Cannot confirm from files reviewed whether the Agent tool accepts a free-text agent
   description (not a name match) or strictly matches .claude/agents/ filenames. If
   free-text matching is possible, adversarial Telegram input could instruct Eco to
   spawn an agent described as a new role. Architectural unknown.
3. Loop risk (spawned agent re-tasks Eco or spawns further agents): Eco's role file
   does not show it accepts tasks from spawned agents; its chain of command is "jecki only."
   Rambo's chain of command is "Eco only." For the current roster, no spawned agent has
   authority to task Eco. Loop risk is LOW by role design. Cannot confirm Claude Code
   enforces this technically.
4. Shir's chain specifies "Eco only when Ido explicitly delegates a specific task + time frame."
   Shir will reject an unsanctioned Eco spawn. Behavioral constraint, confirmed by role file.
5. Gal and Ido can be tasked by Eco directly per their role files. No chain violation for
   Eco spawning them.

Mitigation required:
C6. Eco's bridge context block (per C1) must list specifically which agents Eco is authorized
    to spawn in the Telegram context. Default: Rambo (security tasks), Anat (HR tasks),
    Eyal (legal tasks when live), Ido (R&D escalations). Gal and Shir: via Ido only,
    not direct spawn unless Ido delegates.
C7. Owner to confirm (or test) that Claude Code Agent tool matches strictly on .claude/agents/
    filenames and does not accept free-text agent descriptions. If free-text matching is
    possible, add explicit prompt instruction to Eco forbidding it.

---

## R4 -- Audit trail

Severity: MEDIUM

Findings:
1. Claude Code session transcript captures all tool calls including Agent tool invocations.
   The spawning call, the task envelope, and the spawned agent's output are all in the
   session transcript. This is the primary audit record.
2. The session transcript is not the immutable audit log referenced in constitution §7.
   Session transcripts are ephemeral (cleanupPeriodDays: 30 in settings.json -- after 30
   days, transcript data may be cleaned). The constitution requires an immutable audit log;
   Agent tool calls are not currently written to company/decisions/decisions-log.md or
   memory/log.md automatically.
3. No file reviewed shows an automated mechanism to write Agent tool calls to the
   decisions log or activity log. This is a gap.
4. Eco's role file and soul rules require logging significant actions, but do not
   specifically require logging each Agent tool invocation. A busy Eco session could
   spawn multiple agents without each spawn being captured in the persistent log.

Mitigation required:
C8. Eco must log every Agent tool invocation to memory/log.md at the time of the call:
    agent spawned, task_id, objective summary, timestamp. This is a behavioral rule to add
    to Eco's bridge context block and, if needed, Eco's role file at next R&R.
C9. Owner to assess whether 30-day session cleanup (settings.json cleanupPeriodDays: 30)
    is compatible with the company audit retention requirement. If decisions-log.md is the
    authoritative audit record and Agent calls are logged there per C8, this is satisfied.
    If the session transcript is the only record, 30-day cleanup is a compliance gap.

---

## R5 -- Session isolation / context bleed

Severity: LOW-MEDIUM

Findings:
1. Claude Code Agent tool runs a spawned agent as a subagent within the parent session.
   The spawned agent receives only the task envelope passed by the orchestrator; it does
   not receive the parent session's full context unless the orchestrator explicitly passes it.
   This is a Claude Code architectural property. Assessed as LOW risk.
2. The spawned agent's output is returned to the parent session (Eco) and becomes part
   of Eco's context. If the spawned agent's output contains adversarial content (e.g.,
   Rambo returns a WebFetch result containing a prompt-injection payload), that payload
   enters Eco's context.
3. This creates a second-order injection vector: external content fetched by Rambo -> 
   returned to Eco -> Eco acts on adversarial instructions in the response.
   This is real but mitigated by Rambo's role constraints (Rambo does not return raw
   external content; Rambo returns structured security findings). LOW-MEDIUM residual.
4. No evidence of spawned-agent persistent side effects on the parent session's memory
   files beyond what the spawned agent explicitly writes via its own Write/Edit tools.
   A spawned agent could write to shared memory files (e.g., memory/log.md) as authorized
   by its own role. This is expected behavior, not a control gap.

Mitigation required:
C10. Eco must treat spawned-agent output as potentially tainted before acting on it,
     especially for agents that touch external content (Rambo/WebFetch). Eco should not
     pass raw external content back to Telegram without review. Add to Eco bridge context block.

---

## Overall verdict

PARTIAL-CLEAR -- 10 conditions (C1-C10) required before A1 grant.

Gate level: A1. Reasons:
1. Blast radius expansion is material (Bash-capable agents when live; WebFetch via Rambo live today).
2. Settings.json deny-list cascade to subprocesses is an architectural unknown -- must be resolved.
3. Legal gate (Eyal) is incomplete. Cannot grant without Legal clear or explicit owner waiver.

Not FLAG-blocked. The capability is architecturally sound (scoped to named roster agents;
chain-of-command rules behavioral but present; session transcript provides audit evidence).
The risks are manageable with the conditions above.

---

## Conditions summary (C1-C10)

C1.  Add AGENT TOOL SAFETY block to Eco Telegram bridge context: named authorized agents
     list, task-envelope validation requirement, no-spawn-on-unverified-external-content rule.
C2.  Owner confirms Eco Telegram bot is single-user (jecki-only); document as compensating
     control; trigger new gate review if multi-user access is added.
C3.  Confirm (test or Anthropic docs) that settings.json deny rules cascade to spawned-agent
     subprocesses. If they do not cascade, grant is blocked until compensating control exists.
C4.  Bridge context block: Rambo spawn authorized for security gate review tasks only,
     not general web access.
C5.  When Gal, Shir, or Ido are certified: re-run blast-radius assessment before those agents
     are reachable via Eco Agent tool in Telegram bridge. Condition survives this review.
C6.  Bridge context block: explicitly list which agents Eco may spawn in Telegram context
     (Rambo, Anat, Eyal-when-live, Ido). Gal and Shir via Ido only.
C7.  Owner to confirm Claude Code Agent tool matches .claude/agents/ filenames strictly
     (not free-text). If free-text matching is possible, add prompt constraint to Eco.
C8.  Eco must log every Agent tool invocation to memory/log.md: agent spawned, task_id,
     objective, timestamp. Add to bridge context block and Eco R&R at next review.
C9.  Owner to confirm 30-day session cleanup is compatible with audit retention requirement
     given C8 (decisions-log.md / memory/log.md as authoritative record).
C10. Eco must treat spawned-agent output containing external content as potentially tainted;
     no raw external content passed to Telegram without review. Add to bridge context block.

Legal gate condition: Eyal must confirm no new terms apply (same Claude Code subscription,
no new vendor). This is separate from C1-C10. A1 cannot be issued while Legal gate is open
unless owner explicitly waives Eyal review at A1 (documented).

---

## Draft gate-register.md row (conditional -- for owner if A1 granted)

| Agent tool (for Eco, Telegram bridge) | Claude Code built-in capability | free (subscription) | jecki (A1, [DATE]) | Scoped to Eco on Telegram bridge only. Spawnable agents: named roster agents in .claude/agents/ per authorized list in bridge context block. Conditions C1-C10 applied (gate-review-agent-tool-eco-rambo.md, 2026-06-15). Eyal confirm no new terms ([DATE]). Re-assess blast radius at each new Bash-capable agent certification. |

---

## Rambo sign-off

Rambo | Security | L3 | 2026-06-15 | T-0020
Finding delivered to Eco for relay to jecki (A1 decision).
