# Gate Report: File-and-Flush -- Telegram-Triggered Full-Power Flush Session

Target: integrations/runner/file-and-flush-design-2026-07-25.md (PROPOSAL ONLY -- not built)
Gate type: Security posture change -- Telegram trigger -> full-power local Claude session
Tasked by: Eco (CEO) on owner A1 2026-07-27
Reviewer: Rambo (Security)
Date: 2026-07-27
Model: Sonnet (standard gate; Opus threshold not triggered -- no new LLM provider)

Files read this session:
- integrations/runner/file-and-flush-design-2026-07-25.md
- .claude/hooks/guard.py
- integrations/runner/runner.py
- memory/run-queue.md
- CLAUDE.md (project)
- company/governance/gate-register.md (full file)
- integrations/telegram-bridge/bridge.py (FOUND -- confirmed at this path)
- .claude/settings.json
- company/security/reports/inbox-triage-rescope-scan-rambo-2026-07-26.md
- company/security/reports/permission-drift-2026-07-27.md
- memory/board.md (partial -- task context)

---

## VERDICT: PASS-WITH-CONDITIONS

The design is sound in principle. No fundamental architectural flaw. Six mandatory
conditions (M1-M6) must all be true before Phase 2 (build) begins. The most critical
is M1: GUARD_MODE must be in enforce before the flush command is built or enabled.
In the current shadow state, the flush session would be effectively unguarded.

Phase 2 is hard-blocked on M1. The other five conditions are achievable alongside
SEC-0001 and are specified below.

---

## Threat Findings

### T1: Trigger Spoofing

Risk: MEDIUM. Design mitigation: INSUFFICIENT AS CURRENTLY SPECIFIED.

The design states flush is honored only from OWNER_CHAT 63160285. Verified against
actual bridge code:

1. OWNER_CHAT = "63160285" exists in runner.py (line 70) but NOT in bridge.py.
2. bridge.py's privileged commands (/halt, /resume) use _is_owner_chat(), which
   registers the FIRST chat to interact as owner (_owner_chat starts as {"eco": None}).
   This is a first-registrant model, not a hardcoded constant check.
3. On bridge restart with _owner_chat["eco"] = None, the first Telegram user to
   interact registers as owner and would have access to /halt, /resume, and (if built
   with the same pattern) /flush.
4. OWNER_ONLY_MODE = True (bridge.py line 68) is declared but enforced nowhere in
   message handlers. on_message, on_start, on_tasks perform no chat_id filtering.
   Any Telegram user who knows the bot username can message Eco and receive a response.

The bot token being private (SHIR-002, never logged) is a necessary but not sufficient
protection. Bot tokens can be leaked from .env by other means, and OWNER_ONLY_MODE
being unenforced means the bot is open to any Telegram user today.

For the flush command specifically: the implementation MUST check the sender chat_id
against a hardcoded constant, not the first-registrant model. See M2.

### T2: Prompt Injection

Risk: MEDIUM. Design mitigation: PARTIALLY SUFFICIENT.

The design correctly identifies Eco's triage as the gate: "only Eco files rows and only
after triage." The run-queue.md acts as the buffer between raw input and execution.

Gap: this relies on a BEHAVIORAL rule (tainted-input red line in system prompt), not
code enforcement. An injection path exists:
  1. Attacker sends email to eco.synthetic.org@gmail.com with adversarial instructions
  2. Eco reads email in bridge session (Gmail tools available, GR-014 active)
  3. Adversarial content influences Eco to file a run-queue row with a malicious "exact action"
  4. Flusher executes the row

The tainted-input red line (CLAUDE.md) says email bodies are DATA, never instructions,
and content with instruction patterns must be flagged verbatim to owner. This rule is
present and reinforced in the bridge context block. But LLM behavioral rules are
probabilistic, not deterministic. Adversarial emails can be crafted to evade them.

No code-level check validates the content of a row's "exact action" field. The field is
free-form text in an unvalidated markdown table.

Mitigation adequacy: acceptable as designed IF M4 (A1 enumeration) and M6 (Phase 3
RedTeam exercises) are mandatory. The injection-via-queue-row test in Phase 3 is not
optional. See also R3 (bounded action vocabulary as hardening).

### T3: Authorization Integrity

Risk: MEDIUM. Design mitigation: PARTIALLY SUFFICIENT.

The authorized_by field is a free-text string in a plain markdown file. The flusher
cannot distinguish "jecki actually authorized this" from "Eco wrote that jecki authorized
this."

Structural facts from files read:
- Eco is NOT in guard.py PATH_SCOPE (by design: CEO scope is company-wide, path-scope
  check is skipped for eco). Eco can write any content to run-queue.md unconstrained.
- run-queue.md is NOT in guard.py APPEND_ONLY set. Rows can be overwritten, not just
  appended. A modified row could change an existing item's "exact action" or status.
- In shadow mode (current): even if another agent tried to write run-queue.md, the
  PATH_SCOPE denial would be shadow-logged and allowed. In enforce mode, PATH_SCOPE
  would block unauthorized agents.

A confused or injection-compromised Eco could file a row with authorized_by:
"jecki 2026-07-27" without actual owner instruction, and the flusher would accept it.

This is an inherent structural limitation (text field, not cryptographic assertion).
It is not eliminable without a different authorization architecture. Mitigation: M5
(format validation on authorized_by) raises the bar for accidental misfire but does
not eliminate the structural gap. Owner must accept this as a residual risk.

### T4: A1 Auto-Run

Risk: MEDIUM. Design mitigation: STATED CORRECTLY, MECHANISM UNSPECIFIED.

The design correctly states: "A queued authorization is NOT a substitute for the in-session
A1 the constitution requires." This is the right principle.

Gaps:
1. A1 action classification is LLM-determined. The flusher decides what is or is not
   an A1 action. An ambiguously worded row could be misclassified as non-A1 and
   execute autonomously. No code-level enumeration of A1 categories exists in the design.
2. The "one-tap confirm" mechanism for A1 actions is unspecified. The design says
   "surface a one-tap confirm to jecki" but does not specify whether the flush session
   waits (blocking) or exits and leaves the row as blocked-on-A1. Both are acceptable;
   the implementation must choose one explicitly.
3. "Queued authorization" (the authorized_by field) covers pre-authorization of non-A1
   actions. For A1 actions, the in-session confirm via Telegram is a new authorization
   event. The bridge session and flush session are separate processes; the confirm path
   must be designed so the flush session actually receives and validates the owner's reply.

Mandatory: M4 requires a code-level A1 action type list in the flush handler. This is
the only deterministic protection against A1 misclassification.

### T5: Host Trust Boundary

Risk: HIGH (inherent -- existing bridge risk, now with larger blast radius).

The bridge runs as an NSSM Windows service. If the bridge host is compromised:
- Attacker controls the process that receives and interprets Telegram messages
- Attacker can inject flush commands or modify how the flush session is spawned
- CLAUDE_CODE_OAUTH_TOKEN in the service environment gives full Claude Max access
- Google Workspace credentials in eco-creds give full company Gmail/Calendar/Drive access

Blast radius comparison:
- Pre-flush: compromised bridge can make Eco read/write files and draft emails
- Post-flush: compromised bridge can also spawn full-power Claude sessions that execute
  arbitrary queue rows, spawn agents, and run Bash commands

This is a material increase in blast radius. The increase is inherent to the flush
design and cannot be eliminated without abandoning the design.

Existing mitigations (confirmed from files):
- CLAUDE_CODE_OAUTH_TOKEN in .env (gitignored per red line 1, never logged per SHIR-002)
- Bot token in .env (same protections)
- guard.py handoff/google hard-enforcement applies regardless of how session is spawned

The host trust boundary risk must be explicitly accepted by the owner before enablement.
Recommended hardening: see R2 (pre-execution logging before session begins).

NSSM service account privilege cannot be verified from files read. Owner should confirm
the bridge service runs as a non-admin account or least-privilege service identity.

### T6: Kill-Switch (SAFE_MODE)

Risk: MEDIUM. Design mitigation: INSUFFICIENT in current state.

Design claim: "SAFE_MODE HONORED: if the SAFE_MODE flag is set, flush is a no-op."

Traced through actual code:

runner.py main() checks SAFE_MODE at code level at startup (line 751-754) and exits
early. This DOES stop the runner. Confirmed.

guard.py checks SAFE_MODE for sub-agent spawns and writes. In ENFORCE mode, these
denials are hard. In SHADOW mode (current state), decide() converts them to ALLOW:

  In evaluate(): SAFE_MODE active -> returns DENY, "SAFE_MODE active: spawns halted"
  In decide() with mode="shadow" and not runner:
    handoff_block = False (reason doesn't contain "handoff write")
    google_block = False (reason doesn't start with "google boundary")
    condition: if runner or mode=="enforce" or handoff_block or google_block -> FALSE
    -> falls through to: if decision == DENY: return ALLOW, "[shadow] would-DENY: ..."

In SHADOW mode, SAFE_MODE does NOT halt a flush session launched by the bridge.
The guard logs the would-deny but allows all spawns and writes through.

bridge.py has no SAFE_MODE code check before processing messages or commands. The /halt
command sets SAFE_MODE but the bridge itself does not read SAFE_MODE before acting.

Therefore: in the current state (GUARD_MODE=shadow), SAFE_MODE does NOT reliably halt a
flush session. The kill-switch claim is only true if:
(a) GUARD_MODE is in enforce (SAFE_MODE bites in the guard), OR
(b) the flush handler includes its own SAFE_MODE code check (like runner.py)

Mandatory: M3 requires a code-level SAFE_MODE check in the bridge flush handler before
spawning any session. This must work regardless of GUARD_MODE state.

### T7: Bounded Execution

Risk: LOW-MEDIUM. Design mitigation: ADEQUATE with one gap.

The N=5 rows/flush bound is reasonable. Per-row timeout is correctly identified as
necessary. Logging to agent-runs.jsonl is correct (agent-runs.jsonl is in guard.py
APPEND_ONLY set, enforced in both shadow and enforce modes -- hard protection).

Gap: no concurrency protection is described. Two flush triggers in rapid succession
would spawn two concurrent full-power sessions reading the same queue. Both would see
status=ready on the same rows, causing duplicate execution and race conditions on
status updates.

Mitigation: R1 (flush.lock sentinel file). Not a mandatory blocker if Phase 3 tests
include a concurrent-trigger scenario, but strongly recommended.

Row complexity is not bounded by count. A single row with a complex exact action (spawn
5 agents, run a full gate) is one row. Per-row timeout is the critical control for scope.
The timeout value must be explicit in the implementation.

### T8: Guard Coverage in Flush Session

Risk: HIGH (critical finding). Design mitigation: INSUFFICIENT in current state.

This is the most significant finding in this review.

The PreToolUse hook (settings.json) fires for every governed tool call in any project
session, including a flush session. guard.py IS invoked. But enforcement depends on mode.

Current GUARD_MODE state: shadow. Evidence from run-queue.md arming-status section:
"TODO -- owner A1 -- Flip GUARD_MODE shadow->enforce. ONLY when the gate surfaces GREEN.
Not before." Readiness gate current verdict: "SILENT (correct)" = not yet GREEN.
GUARD_MODE = shadow is confirmed.

The flush session would have:
- No RUNNER_CONTEXT tag (it is not a scheduled runner job, and the bridge does not set it)
- origin = "" (top-level subprocess, same as interactive owner session)

In shadow mode, decide() hard-enforces ONLY:
- RUNNER_CONTEXT=1 path calls
- handoff/ writes with secret patterns
- google_workspace calls to wrong account

Everything else (Bash, sub-agent spawns, Red path writes, SAFE_MODE blocks, PATH_SCOPE,
APPEND_ONLY, SPAWN_DENY) is shadow-logged and ALLOWED.

Specific calls that would be ALLOWED on a flush session in shadow mode today:
- Write to .claude/agents/ (Red path: deny in evaluate(); allowed in decide() shadow)
- Spawn any agent including SPAWN_DENY agents (denied in evaluate(); allowed in shadow)
- Bash arbitrary commands (no runner check, shadow mode = allowed)
- Write memory/GUARD_MODE or memory/SAFE_MODE via Edit (denied in evaluate(); shadow = allowed)
- Any write outside the originating agent's PATH_SCOPE (origin="" means no PATH_SCOPE check)

In enforce mode, the flush session (origin="") gets the B1 owner-session exemption:
- Red path writes (.claude/agents/) ARE allowed for origin="" in enforce mode (B1, guard.py
  line 418-422). This is intended for the owner's interactive session but applies equally
  to the flush session. Owner must accept this explicitly.
- Writes to GUARD_MODE and SAFE_MODE files via Edit are denied (guard.py line 407-408).
  Write (not Edit) of SAFE_MODE with non-empty content is allowed (to SET the flag).
  Clearing SAFE_MODE via Write with empty content is denied.
- All other RED_EXACT paths (.claude/settings.json, .claude/settings.local.json,
  company/governance/access-matrix.md, company/constitution.md) are denied for sub-agents
  but ALLOWED for origin="" (B1 exemption). A flush session acting as origin="" could write
  these files.

The B1 exemption gap: a compromised or misbehaving flush session with origin="" has write
access to .claude/agents/, .claude/settings.json, access-matrix.md, and constitution.md
in enforce mode. This is the same as the interactive owner session, which is accepted as
a design given (the owner runs interactive sessions). But an autonomous session triggered
by Telegram having this access is different in character.

MANDATORY: Phase 2 build cannot begin and flush cannot be enabled while GUARD_MODE is
shadow. The GUARD_MODE flip (SEC-0001 complete) is a hard prerequisite -- see M1.

---

## Additional Threats Found

### T9: OWNER_ONLY_MODE Flag Not Enforced (existing bridge gap)

Risk: LOW (existing, not new -- but relevant to flush trigger surface).

bridge.py OWNER_ONLY_MODE = True (line 68) is not checked in any handler. on_message
processes any Telegram user's text without chat_id filtering. The bridge session is weak
by design (no Agent, no Bash), which limits the blast radius of open access today.

The flush handler must be the exception: it must hard-check the sender chat_id before any
action. The rest of the bridge could remain open to any Telegram user if the bridge session
stays weak, but the flush command must be strictly gated.

### T10: Flush Session Identity -- Guard Treats It as Owner Session

Risk: MEDIUM (inherent -- explicit acceptance needed).

The flush session spawned by the bridge has origin="" (top-level process, no subagent_type).
guard.py treats origin="" as an interactive owner session:
- No PATH_SCOPE constraints (PATH_SCOPE only fires for known sub-agents with origin set)
- B1 exemption for Red path writes in enforce mode
- Full spawn authority for ALLOWED_AGENTS including OWNER_SPAWN_ONLY agents (gal, shir,
  adi, oren, noa) -- because the OWNER_SPAWN_ONLY check is `sub in OWNER_SPAWN_ONLY and origin`
  where origin="" is falsy, so the check does not fire

This means the flush session has effectively the same guard-level powers as the owner's
interactive session. This is the intended design (the flush session IS meant to be
full-power), but it must be accepted as a residual risk explicitly: a Telegram message
from the owner is the trigger; the result is equivalent to owner-level Claude Code access.

### T11: No Pre-Execution Audit Trail

Risk: LOW.

The design mentions logging to agent-runs.jsonl. agent-runs.jsonl is APPEND_ONLY in
guard.py (hard-enforced in both modes). This is correct and good.

Gap: the design does not specify when logging happens. If logging happens only after
execution, a crash or kill of the flush session mid-run produces no audit trail for
rows that started but did not complete. See R2 for the recommended fix.

---

## MANDATORY Conditions (all must be satisfied before Phase 2 build begins)

M1 [GUARD_MODE -- hard prerequisite]: GUARD_MODE must be flipped to "enforce" and the
   SEC-0001 readiness gate must surface GREEN before Phase 2 build begins AND before flush
   is enabled. In shadow mode, the flush session has no deterministic guard protection
   beyond handoff/google-boundary checks. This condition is co-dependent on SEC-0001
   completing. If SEC-0001 is delayed, Phase 2 is delayed.

M2 [TRIGGER AUTH -- hardcoded constant]: The flush handler in bridge.py must check the
   sender's chat_id against a HARDCODED constant (add OWNER_CHAT = "63160285" to bridge.py,
   same value already in runner.py). The first-registrant _is_owner_chat() pattern is NOT
   sufficient for a full-power trigger. Additionally: if _owner_chat["eco"] is None at flush
   time (bridge just restarted, owner has not yet sent a message), reject the flush and log
   a warning. Do not register-and-execute.

M3 [SAFE_MODE CODE CHECK]: The bridge flush handler must check memory/SAFE_MODE at code
   level before spawning the flush session, identical to runner.py main() lines 751-754.
   Pattern: if file exists and content is non-empty, abort flush and report to Telegram.
   This must work regardless of GUARD_MODE state and is not replaceable by guard.py alone.

M4 [A1 ACTION ENUMERATION]: The flush session must carry a code-level enumeration of
   A1-class action categories, not LLM classification alone. Minimum list: agent-create,
   agent-retire, role-file-write (.claude/agents/ write), external-send (email / customer
   comms), production-deploy, spend (any cost), tool-adopt, public-publish. Any row whose
   "exact action" string matches these patterns gets status=blocked-on-A1 and a surface-for-
   confirm, never auto-executed. This list is the only deterministic A1 protection.

M5 [AUTHORIZED_BY FORMAT VALIDATION]: The flush handler must reject (status=blocked, reason
   logged, never executed) any row where authorized_by is empty, blank, or does not contain
   "jecki" (or the owner's canonical name) and a recognizable date string. Malformed or
   missing authorized_by is never treated as a valid grant.

M6 [PHASE 3 REDTEAM REQUIRED]: Phase 3 RedTeam exercises (injection via queued row, spoofed
   trigger chat_id, unauthorized row with empty authorized_by, A1 auto-run attempt) must all
   fail closed. Rambo must review Phase 3 results and issue a go-live clearance before flush
   is enabled for real use. Phase 3 is not optional and is not self-certifiable by the build team.

---

## RECOMMENDED Hardening (non-blocking; implement before or alongside Phase 2)

R1 [CONCURRENCY LOCK]: Write memory/flush.lock before spawning the flush session. Check for
   this file's existence at flush trigger time; if present, reject the second trigger and
   notify the owner. Remove the lock on session exit (use try/finally). Prevents double-execution
   from rapid consecutive flush messages.

R2 [PRE-EXECUTION LOGGING]: Write an agent-runs.jsonl entry with status="in-progress" and
   row details BEFORE executing each row's action. Post-execution, write the result entry.
   This ensures a full audit trail even on crash or mid-run kill.

R3 [BOUNDED ACTION VOCABULARY]: Define an allowed action-type vocabulary for the "exact action"
   field (e.g., spawn-agent:<name>, run-gate, write-file:<path>, draft-email). The flush handler
   rejects rows whose "exact action" does not match a known pattern as status=blocked+reason.
   Free-form text in "exact action" is the widest injection surface; even a rough allowlist
   reduces it materially.

R4 [HARDEN EXISTING COMMANDS]: /halt and /resume should also be updated to use the hardcoded
   OWNER_CHAT constant check. This is a separate fix from M2 and does not gate flush, but closes
   the same first-registrant gap for existing commands.

R5 [NSSM SERVICE ACCOUNT]: Confirm the bridge NSSM service runs as a non-admin or least-privilege
   service identity, not as jecki's own admin account. Cannot verify from files; owner action.

R6 [OVERALL FLUSH SESSION TIMEOUT]: Set an overall wall-clock timeout on the flush subprocess
   in addition to per-row timeouts. A flush session that stalls on a single row should not run
   indefinitely. Suggest: max(N * per_row_timeout * 1.5) as the outer bound.

---

## Eyal (Legal) Note

No new external tool, service, vendor, API, or subscription change is involved. The flush
command uses existing Claude Code runtime tools (Agent, Bash) already covered by the owner
A1 2026-06-12 runtime approval. No new Google Workspace scope. No new third-party data
pipeline. No new Anthropic subscription change. Eyal review is NOT required for this gate.
The existing gate-register entries cover all capabilities the flush session would use.

---

## Gate-Register Entry Draft (do not append -- for Eco/owner to add at the appropriate row)

| File-and-Flush flush session | Autonomous architecture / security posture change | internal design | Eco (CEO) 2026-07-25; owner A1 2026-07-27 | PASS-WITH-CONDITIONS (Rambo 2026-07-27). 6 mandatory conditions M1-M6. M1 (GUARD_MODE enforce) is the hard prerequisite for Phase 2 build. Full findings: company/security/reports/gate-file-and-flush-rambo-2026-07-27.md | Not required -- no new external tool or vendor terms. Existing gate-register entries cover all capabilities. | Phase 2 build hard-blocked until M1-M6 confirmed. Phase 3 RedTeam results must be reviewed by Rambo before go-live clearance is issued. |

---

## Residual Risks (owner to accept explicitly before enabling flush)

RR-1 BRIDGE HOST COMPROMISE: if the bridge host machine is compromised, the attacker gains
  the same full-power Claude Code access as the owner. Flush materially increases the
  autonomous blast radius of this scenario vs. today's weak bridge. Inherent to the design.

RR-2 QUEUE POISONING VIA INJECTION: a sophisticated prompt injection through email -> Eco ->
  run-queue.md could cause the flusher to execute adversarial rows. Behavioral mitigations
  are probabilistic. M4 and R3 reduce but do not eliminate this risk.

RR-3 A1 MISCLASSIFICATION: the flusher's LLM may misclassify an A1-level action as non-A1
  for edge cases not in the code-level enumeration. M4 reduces this materially but cannot
  enumerate every possible A1 scenario. Residual risk is real.

RR-4 FLUSH SESSION AS OWNER-LEVEL: the flush session has guard-level trust equal to an
  interactive owner session (origin="", B1 exemption, full spawn authority). This is the
  intended design but constitutes autonomous owner-level Claude Code action triggered by a
  Telegram message. Owner must accept this explicitly.

RR-5 B1 EXEMPTION IN ENFORCE MODE: in enforce mode, the flush session (origin="") may write
  Red paths including .claude/agents/, .claude/settings.json, access-matrix.md, and
  constitution.md (B1 exemption for top-level sessions). This is the same access the
  interactive owner session has. For a flush session reading queue rows, this access is
  wider than necessary. Accept or narrow the B1 exemption to exclude autonomous sessions.
