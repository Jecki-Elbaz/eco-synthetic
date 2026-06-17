# Proposal: Supervised Partial-Autonomy Regime for Eco Agent Orchestration

Status: DRAFT -- pending Security (Rambo) + Legal (Eyal) gate, then owner A1.
Author: Claude Code session, on owner (jecki) direction, 2026-06-16.
Branch: claude/agent-tool-bridge-config-8kotbr
Decision gate: A1 (broad autonomy regime + settings.json change + red-line enforcement). Not A2.

---

## 1. Purpose and owner goal

The owner wants Eco to manage agents -- to task non-code sub-agents and have work
progress continuously -- WITHOUT every action stopping and waiting for the owner.
The owner also requires: clear rules, full logging of every action, and a supervisory
agent that reads the inter-agent exchange and can raise an alarm or halt illegal actions.

This proposal defines how to do that safely. It does not grant any capability by itself;
it is the artifact Rambo and Eyal review before the owner decides.

## 2. The one non-negotiable principle

CODE enforces. AGENTS review.

An LLM agent cannot be the circuit breaker. It is probabilistic -- it can miss, drift,
be talked around, or confabulate (as Eco itself did on 2026-06-15, claiming actions it
had not taken). Therefore the mechanism that PREVENTS an illegal action is deterministic
code (Claude Code hooks + permission deny-lists). The supervisory agent is the smart
second layer that catches what code cannot express -- scope creep, tone, injection
signals -- and trips a deterministic switch. The agent never IS the switch.

Restated: hooks are the circuit breaker; the supervisor is the smoke detector.

## 3. Current gap (verified, not assumed)

- `.claude/settings.json` today denies only `.env`, `.env.*`, `sources/*`, a set of
  destructive Bash commands, and Google write tools. It does NOT deny writes to
  `.claude/agents/`, `.claude/settings.json`, `company/governance/`, or
  `company/decisions/decisions-log.md`.
- The Telegram bridge restricts per-agent paths only via TEXT injected into the system
  prompt (`bridge.py` `_AGENT_ACCESS`, comment lines 128-134). That is honor-system,
  not enforcement.
- Conclusion: today, an agent with Write/Edit could technically modify role files,
  governance, or the audit log. Closing this gap is a prerequisite for ANY autonomy
  expansion -- it is a net security improvement even if autonomy is later declined.

## 4. Action classification: Green / Yellow / Red

Every action an orchestrated agent can take is classified. Mapping to constitution gates
(A3 / A2 / A1). Only Red blocks the owner; Green and Yellow keep the company moving.

### Green -- autonomous, logged, never waits (maps to A3)
- Read any path the agent's role allows.
- Analyze, summarize, draft to the agent's own scratch space.
- `memory/wiki/` routine updates (already A3 for Eco).
- `memory/board.md`: append/update the agent's OWN task rows.
- Spawn a READ-ONLY sub-agent (tools limited to Read/Grep/Glob) for analysis.

### Yellow -- executes now, logged, reviewed async, reversible via git (maps to A2)
- Write/Edit to working files inside `projects/`, `memory/` (non-restricted), drafts.
- `company/decisions/decisions-log.md`: APPEND a new entry (pure append only -- see 5.3).
- Spawn a sub-agent that holds Write/Edit (non-code only -- see 5.2).
- Board updates beyond the agent's own rows.
Yellow actions execute without blocking, but every Yellow action is logged and surfaced
to the supervisor and to the owner digest. The runner auto-commits each batch with a clear
message (no push to main, no force-push, no reset -- red line 3) so every Yellow change is
in git history and the owner can revert. "Reversible via git" holds only because of this
commit step; uncommitted drift is not allowed to accumulate.

### Red -- hard-blocked by hook, queued for owner (maps to A1)
- Any write to `.claude/agents/**` (agent create/retire/re-scope -- red line 6).
- Any write to `.claude/settings.json` (self-granting tools/permissions -- red lines 7, 9).
- Any write to `company/governance/access-matrix.md` or `company/constitution.md`.
- Any RETROACTIVE edit to `decisions-log.md` (append is Yellow; edit is Red -- red line 6).
- Any spend, any external send (Telegram to non-owner, email, marketing publish),
  any customer-data action, any new-tool adoption (red lines 1, 2-pricing, 3, 4, 11).
- Spawning a code/Bash-capable agent (Gal, Shir, Ido, or any `*`-tool agent).
- GRANTING Eco (or any agent) the Agent tool in the first place. This capability grant is
  itself A1 -- it is the enabler of the whole regime, not a routine A2 tool grant
  (constitution section 3 "grant a tool... borderline A1"; red line 7). [Eyal Finding 1]
- Any change to the spawn allow-list in 5.2 (adding/removing an agent) -- A1, owner-only,
  logged in decisions-log; not sub-delegable to Eco or to Yellow (red line 6 re-scope).
  [Eyal Finding 2]
- Routing RAW PERSONAL DATA (names, emails, contact details, any data identifying a
  natural person) in a task envelope to a sub-agent, unless that sub-agent's role file
  already covers the data type AND Eyal has cleared the data-flow. Personal-data decisions
  are A1 (constitution section 3; red line 9; Israeli PPL purpose-limitation). [Eyal Finding 3]
Red actions never execute autonomously. The hook denies them and writes them to an
owner approval queue. The owner approves in-session (A1), then they run.

## 5. Enforcement layer (deterministic -- the real stop)

All of the below live in `.claude/settings.json` hooks and permission lists. They apply
to every agent in every session, including the parent Eco session.

### 5.1 Path deny hooks (PreToolUse on Write/Edit)
Deny, regardless of which agent, writes to the Red paths in section 4. This is a single
matcher list; a denied call returns a clear message and is queued, not silently dropped.

### 5.2 Agent allow-list hook (PreToolUse on the Agent tool)
The Agent tool, once granted to Eco, can in principle spawn ANY defined agent -- including
Bash-capable ones (Gal, Shir, Ido) and the `*`-tool catch-alls (`claude`,
`general-purpose`, `MeetingPrep`). The hook inspects `subagent_type` and DENIES any agent
not on the explicit allow-list. Initial allow-list (non-code staff only):
Anat, Assaf, Dalia, Eyal, Rambo, Lital, Noam. No Bash agents. No `*`-tool agents.
This is the enforcement behind "non-code agents only" -- not Eco's good intentions.
Changing this list is a Red, owner-only, A1 action (see section 4).

### 5.3 Append-only enforcement for the audit trail (PreToolUse on Write/Edit)
Applies to `decisions-log.md`, `memory/log.jsonl`, `memory/log.md`, and the new
`memory/agent-runs.jsonl` (section 6 -- the agent must not be able to rewrite its own
audit trail):
- Edit is DENIED outright (no in-place change = no retroactive edit).
- Write is allowed ONLY if the new content begins with the entire existing content
  (a pure append). The hook reads the current file and verifies the prefix. This gives a
  deterministic append-only guarantee, which today is only a policy.

### 5.4 SAFE_MODE flag protection (PreToolUse on Write/Edit/any delete)
The halt flag `memory/SAFE_MODE` must not be self-clearable. SETTING it is allowed for
the supervisor and owner; CLEARING or emptying it is a Red action -- owner-only,
hook-enforced. An agent that could turn off its own kill switch has no kill switch.

### 5.5 Fail-closed and caps
- FAIL CLOSED: if any enforcement hook errors or cannot evaluate the request, the action
  is DENIED, not allowed. Security failures must not fail open.
- The hooks are GLOBAL (settings.json) and therefore apply recursively to nested spawns:
  even an allow-listed agent that itself holds the Agent tool (e.g. Anat) can only spawn
  allow-listed non-code agents. There is no path to a Bash agent through nesting.
- Fan-out cap: a maximum sub-agent count and nesting depth per batch. Honest limitation:
  hooks cannot perfectly count across separate agent processes, so this cap is enforced
  primarily by the runner plus Assaf cost alerts plus the SAFE_MODE kill switch, not by a
  single hook. This residual is detection-and-kill, not prevention -- called out for Rambo.

### 5.6 Permission deny-list additions
Extend the existing `deny` array (which already covers `.env`, `sources/`, destructive
Bash) with the Red paths, as defense-in-depth behind the hooks.

## 6. Audit layer (full logging of every action)

- PostToolUse hook on the Agent tool appends one record per sub-agent invocation to
  `memory/agent-runs.jsonl`: timestamp, parent, sub-agent, task brief, result summary,
  status, tokens. This captures the inter-agent exchange the owner asked to be logged.
- Every Yellow action is already captured by its file diff (git) plus the existing
  `append_log` event record.
- Honest limitation: the log captures each sub-agent's task envelope and result envelope
  (the §5 standard), not its full internal chain-of-thought. That is the right audit unit
  and matches the constitution's result-envelope requirement; it is not a hidden gap.

## 7. Supervisor layer (the smoke detector -- agent review)

- Primary supervisor: Rambo (Security) -- prompt-injection signals, permission creep,
  fan-out beyond cap, attempts at Red actions. This is squarely Rambo's existing mandate.
- Secondary (optional, later): Dalia (Quality and Governance) -- tone and scope drift.
- Cadence: after each fan-out batch, and on a fixed interval. The supervisor READS
  `memory/agent-runs.jsonl` and recent diffs; it does not sit inline in tool calls.
- Halt mechanism: if the supervisor finds a violation it writes `memory/SAFE_MODE`.
  A PreToolUse hook reads that flag and BLOCKS all further Yellow writes and all sub-agent
  spawns until the OWNER clears it (clearing is owner-only -- section 5.4). So the
  supervisor's "halt" works by tripping a deterministic switch -- consistent with section 2.
- Enforcement does not depend on the supervisor. The hooks in section 5 block Red actions
  whether or not the supervisor is running or correct. A compromised or injected supervisor
  degrades DETECTION only -- it can never grant a Red action, because it does not hold the
  enforcement. The worst a bad supervisor does is fail to raise an alarm or raise a false
  one (which only halts, the safe direction).
- Honest limitation: the supervisor is probabilistic. It is the second layer; it never
  replaces the hooks in section 5.

## 8. Runtime separation (important correction)

The Telegram bridge stays the owner I/O and notification channel. It is NOT the
orchestration engine and NOT the approval channel: it is a 120-second one-shot `claude --print` subprocess unsuited to multi-agent
work, and enabling unattended fan-out there would arm the 2-hour wake-up to spawn agents
with no human present.

Autonomous orchestration runs in a scheduled Claude Code / Agent-SDK runner where the
hooks in section 5 are active. The bridge's job is to NOTIFY the owner of queued Red
items -- not to collect the approval. Because the bridge cannot authenticate that the
chat party is really jecki (red line 13), A1 approval of a Red action happens in an
authenticated Claude Code session, not over Telegram. Phase 1 does NOT add the Agent tool
to the bridge.

## 9. Earned-autonomy ledger

Start maximally conservative: only Green is autonomous; Yellow runs attended at first.
Each action-type graduates Red -> Yellow -> Green only by an explicit, logged owner
decision in `company/decisions/decisions-log.md`, tracking the action-type and date.
No self-graduation (red line 9).

Critical: the ledger is documentation; the ENFORCEMENT is the hooks. The classification
in section 4 lives in code (settings.json), not in the ledger. A graduation therefore
takes effect only when the owner makes the corresponding settings.json hook change
(itself a Red, owner-only edit) -- never from a logged note alone. A faked or mistaken
ledger entry cannot loosen enforcement, because the hooks do not read the ledger. This is
the same earned-autonomy model already approved for Shelly (decisions-log, 2026-06-13).

## 10. Owner controls

- One master switch: writing `memory/SAFE_MODE` (by owner or supervisor) pauses all
  autonomy immediately.
- Digest cadence: a bounded periodic summary of Green/Yellow activity to the owner;
  Red items arrive as an approval queue, not a firehose.
- The owner can revoke the whole regime by reverting the settings.json change (git).

## 11. Phasing

- Phase 0 (this doc): design + Rambo + Eyal gate + owner A1. No capability granted.
- Phase 1: build and unit-test the enforcement hooks (sections 5, 6) and the supervisor
  mandate, in SHADOW mode -- supervisor reviews, nothing auto-executes beyond Green.
  Verify every Red path is actually blocked by an automated test before any autonomy.
- Phase 2: enable Yellow autonomy for a small, named set of action-types, attended,
  with the owner watching the digest.
- Phase 3: scheduled unattended runner; expand the ledger as trust is earned.

## 12. Cost note (budget 0)

The supervisor reading logs and the digest both consume tokens on the subscription.
Assaf (Operational Excellence) and Lital (CFO) track this per constitution section 8.
Cadence is bounded; no paid tool is introduced. No spend is authorized by this proposal.

## 13. What this proposal explicitly does NOT do

- Does not grant Eco the Agent tool yet. That grant is a Red / A1 action (section 4) and
  happens only after the Phase 1 hooks are built and tested (section 15, C1-C2).
- Does not modify the Telegram bridge in Phase 1.
- Does not change any role file, the access matrix, or the constitution (those are Red;
  any such change remains a separate A1).
- Does not authorize spend or any external/customer-facing action.

## 14. Gate questions for the reviewers

For Rambo (Security): Is the enforcement layer (sections 5-7) sufficient to make autonomy
safe? Specifically -- the agent allow-list hook (5.2), the append-only guarantee (5.3),
and the SAFE_MODE halt (7). What attack surface or permission-creep path remains?

For Eyal (Legal): Does this regime stay within the constitution and red lines? Any
issue around the audit-log integrity, the A1/A2/A3 mapping in section 4, Israeli privacy
law if sub-agents ever touch personal data, or terms exposure? Does anything here need to
be A1 that I have mapped as A2/A3?

## 15. Gate-review outcome and binding conditions (Rambo + Eyal, 2026-06-16)

Both reviews completed via the Agent tool in the authoring Claude Code session.

- Rambo (Security): CLEAR-WITH-CONDITIONS.
- Eyal (Legal): CLEARED-WITH-CONDITIONS.

Eyal's three text corrections are applied above (Agent-tool grant = A1; allow-list change
= A1; personal-data-in-task-envelope = A1). The following conditions are BINDING and must
be met before the corresponding step; none is a redesign.

Before owner A1 to begin Phase 1:
- (none -- Phase 1 is build-and-test in shadow mode; A1 to start building is the owner's call.)

Before any Agent-tool grant / any autonomy is switched on (end of Phase 1):
- C1. All PreToolUse hooks (5.1-5.4) built, with an automated test per hook proving the
  denial fires. No grant until every test passes. [Rambo C1]
- C2. Prototype confirms a hook can actually intercept Agent-tool calls and read the
  sub-agent identifier; if the Claude Code hook API cannot do this, the allow-list design
  (5.2) is revised before proceeding. Until proven, the "non-code only" guarantee is
  unverified. [Rambo C2, HIGH]
- C5. Confirm settings.json hooks actually apply to sub-agent spawns in the real runner
  architecture (same-session vs separate-process); if not, add compensating controls.
  [Rambo C5]

Documented residual risks requiring explicit owner acceptance:
- C3. Fan-out cap is detection-and-kill, not prevention. State the token-cost threshold at
  which Assaf alerts, and the worst-case spend per batch before the alert fires. [Rambo C2/C3]
- C4. Prompt injection into a Yellow-capable sub-agent: external content in task envelopes
  must be clearly delimited, and the supervisor must pattern-scan agent-runs.jsonl for
  injection markers before acting. [Rambo C4]
- Append-only hook must handle concurrent-append race conditions (read-then-write staleness)
  so no entry is lost. [Rambo Finding 6]
- Supervisor reads potentially adversarial log content; sanitize entries it consumes. [Rambo F5]

Phase 3 (unattended runner) precondition:
- Data-processing review by Eyal before go-live; the DPA template (Eyal compliance backlog)
  must cover sub-agent processing as a defined use case. [Eyal Finding 5]
