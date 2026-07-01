# Enforce-Readiness Gate Design
# Rambo (Security) | 2026-07-01 | Task: owner A1 directive via Eco

Scope: STRICT-MODE (GUARD_MODE=enforce) readiness gate design only.
No changes to guard.py, GUARD_MODE, runner, or any live file in this document.
All claims grounded in files read this session: .claude/hooks/guard.py,
memory/agent-guard.log (lines 1-847), integrations/runner/runner.py,
memory/agent-runs.jsonl (lines 1-20).

---

## PART 1 -- BLOCKER FIX DESIGNS

### B1 -- Owner Red-Path Exemption

**Problem (from guard.py line 333-334):**
`_is_red(rel)` fires for EVERY caller -- no origin distinction.
The owner's own top-level Claude Code session (origin = "") is therefore denied
.claude/agents/ writes in enforce mode. That is the ONLY sanctioned path for role-file
creation and editing (A1, out of band). 89 would-DENY entries in the log confirm the pattern.

**Critical ambiguity to resolve:**
Origin is empty for BOTH (a) the owner's interactive session AND (b) the scheduled runner
(runner.py launches agents with origin absent from the hook event -- RUNNER_CONTEXT=1 is
set on env, not on the agent_type field). A bare `origin == ""` exemption would also
exempt runner sessions, which must NOT write Red paths.

**Exact condition for the exemption:**

```python
# Proposed insert in evaluate(), REPLACING the current Red-path block:
# (current lines 333-334 of guard.py)

# Red paths (5.1) -- owner-only A1, blocked regardless of SAFE_MODE.
# Exception: the owner's live interactive session (origin empty, not runner context)
# may write Red paths -- this is the A1 out-of-band role-file edit channel.
# Sub-agents (origin set) and the scheduled runner (RUNNER_CONTEXT=1) are always denied.
_runner = os.environ.get("RUNNER_CONTEXT") == "1"
if _is_red(rel):
    if origin == "" and not _runner:
        pass  # owner interactive session -- allow; falls through to ungoverned-path ALLOW
    else:
        return DENY, f"Red path '{rel}': owner-only A1 (section 4/5.1)"
```

**Why this is tight:**

1. `origin == ""` is set only when Claude Code runs at top level with no parent agent.
   Sub-agents always populate agent_type.
2. `RUNNER_CONTEXT != "1"` is set by runner.py on every subprocess env (line 228 of
   runner.py: `env = {**os.environ, "RUNNER_CONTEXT": "1", ...}`). The runner's own
   Python process has RUNNER_CONTEXT absent, but the runner never calls Claude tools
   directly -- it only spawns agent subprocesses that DO inherit RUNNER_CONTEXT=1.
   Therefore: any origin-empty session with RUNNER_CONTEXT=1 is a runner-spawned agent,
   not the owner. Any origin-empty session without RUNNER_CONTEXT is the owner's
   interactive session.
3. No other rule is weakened: the exemption affects only the Red-path block. All rules
   below it (SAFE_MODE, append-only, PATH_SCOPE, handoff-secret) still apply normally.
4. Sub-agents (origin set) hitting Red paths are still denied unconditionally.
5. The runner's spawned agents all have RUNNER_CONTEXT=1 so they are still denied.

**Placement:** replace the current two-line block at guard.py lines 332-334 with the
five-line block above. Nothing else in evaluate() changes.

---

### B2 -- Append-Only Method Decision

**The two options:**

(a) Keep rule as-is. Edit tool on append-only files = always DENY. These are genuine
    blocks -- agents MUST use Write-append, not Edit. The 46 would-DENY entries for
    append-only in-place edits are agent-behavior violations, not false-blocks.

(b) Relax the rule to permit Edit calls that only ADD content at the end.

**Recommendation: (a). Keep the rule. These are genuine blocks.**

Justification:
- The append-only rule (5.3) exists to prevent retroactive editing of the audit trail.
  An Edit tool call can target any string anywhere in the file -- the guard cannot
  inspect the edit's position reliably without reading the full content and diff.
  A Write with new content = current content + new rows is mechanically verifiable
  (the `new.startswith(cur)` check already does this). An Edit is not.
- The log shows Edit-on-append-only hits on: company/decisions/decisions-log.md
  (majority of B2 hits) and memory/log.md. These are structural -- agents are using
  Edit for convenience when they must use Write.
- Option (b) would require the guard to parse the Edit old_string/new_string fields,
  verify the old_string appears only at EOF, and that no existing content is removed.
  That is fragile and creates bypass surface. Not worth it.
- The fix is behavioral, not a rule change.

**Agents/prompts that must switch from Edit-append to Write-append:**

From the log, the following agent types are observed doing Edit on append-only files:
- Owner's top-level session (origin empty): multiple hits on decisions-log.md and
  memory/log.md. Owner must use Write-append for those files.
- Eco (origin "eco"): line 248, 565, 596, 679, 704, 772, 795 -- decisions-log.md.
  Eco's role prompt must instruct: "Write decisions-log.md using Write tool with full
  current content + new entry, never Edit."
- Rambo (origin "rambo"): line 209 -- memory/log.md (append log entry). Same fix.
- Anat, Ido observed via sub-agent sessions: same files.
- Runner-spawned agents (RUNNER_CONTEXT=1): line 716, 718, 730-733 show memory/log.md
  denials already firing in shadow from runner sessions. The fix: runner agents that
  need to append to log.md must use Write-append, or the runner should write log
  entries directly (runner.py already does RUNLOG writes natively -- log.md appends
  from runner agents should be eliminated, they are redundant).

**Agent-behavior note for Eco to propagate:**
Every agent with decisions-log.md or memory/log.md in their PATH_SCOPE must be updated:
replace Edit calls to those files with Write calls that include the full existing content
plus the new entry. This is a prompt/role-file change, not a guard change.

---

## PART 2 -- READINESS-GATE RULESET

### 2.1 -- Complete Reason Taxonomy

Every distinct DENY reason evaluate() can emit, extracted from guard.py source:

R01: "acting sub-agent '{origin}' is not on the non-code allow-list (5.2)"
     -- origin set, not in ALLOWED_AGENTS, on a governed tool

R02: "path-scope violation: agent '{origin}' may not write '{rel}'"
     -- origin in PATH_SCOPE, governed write outside allowed prefixes

R03: "Red path '{rel}': owner-only A1 (section 4/5.1)"
     -- write targeting RED_PREFIXES or RED_EXACT

R04: "SAFE_MODE active: all sub-agent spawns halted (5.4/7)"
     -- spawn attempt while SAFE_MODE file is non-empty

R05: "agent '{sub}' is OFF the permitted-spawn allowlist"
     -- sub in SPAWN_DENY (currently: redteam)

R06: "agent '{sub}' not on the non-code allow-list (5.2)"
     -- spawn attempt for agent not in ALLOWED_AGENTS

R07: "agent '{sub}' may be launched only from an owner/top-level session"
     -- spawn of OWNER_SPAWN_ONLY agent from a sub-agent (SEC-0001)

R08: "SAFE_MODE may not be edited (clearing is owner-only, 5.4)"
     -- Edit/MultiEdit targeting memory/SAFE_MODE

R09: "clearing/emptying SAFE_MODE is owner-only A1 (5.4)"
     -- Write to SAFE_MODE with empty content

R10: "SAFE_MODE active: writes halted until owner clears (7)"
     -- governed write (not SAFE_MODE path itself) while SAFE_MODE active

R11: "append-only '{rel}': in-place edit denied (5.3)"
     -- Edit/MultiEdit on an APPEND_ONLY file

R12: "append-only '{rel}': write is not a pure append (5.3)"
     -- Write to APPEND_ONLY where new content does not start with current content

R13: "secret pattern detected in handoff write"
     -- Write to shared/handoff/ containing a credential pattern

R14: "secret pattern in Bash targeting handoff"
     -- Bash command targeting shared/handoff containing a credential pattern
     (note: this is hard-enforced in all modes per decide() line 398-399)

R15: "autonomous runner: Bash is disabled on the scheduled path"
     -- Bash call with RUNNER_CONTEXT=1

R16: "autonomous runner: sub-agent spawning is disabled"
     -- Task/Agent call with RUNNER_CONTEXT=1

R17: "readonly runner cycle: all writes blocked"
     -- Write/Edit/MultiEdit with RUNNER_CONTEXT=1 and RUNNER_MODE=readonly

R18: "fail-closed: guard could not evaluate ({exc})"
     -- Exception inside evaluate() while in enforce mode

---

### 2.2 -- Classification: GENUINE vs FALSE-BLOCK

GENUINE = enforce mode SHOULD deny this; does NOT count against readiness.
FALSE-BLOCK = enforce would wrongly break legitimate work; RESETS 7-day counter.

AFTER the B1 and B2 fixes are deployed, no remaining reason type should produce
false-blocks under normal operation. The table reflects the post-fix state.

| Code | Reason (summary)                         | Classification | Rule for Python check                                                                                           |
|------|------------------------------------------|----------------|-----------------------------------------------------------------------------------------------------------------|
| R01  | Unlisted sub-agent governed action       | GENUINE        | reason contains "not on the non-code allow-list" AND "acting sub-agent"; agent NOT in ALLOWED_AGENTS set       |
| R02  | Path-scope violation                     | GENUINE        | reason contains "path-scope violation"                                                                          |
| R03  | Red path (pre-fix)                       | FALSE-BLOCK    | reason contains "Red path" AND event origin == "" AND RUNNER_CONTEXT absent from log context (cannot determine from log alone -- see note) |
| R03  | Red path (post-B1-fix)                   | GENUINE        | After fix, origin-empty owner sessions are allowed through; any remaining R03 in log is from a sub-agent or runner -- GENUINE |
| R04  | SAFE_MODE spawn halt                     | GENUINE        | reason contains "SAFE_MODE active: all sub-agent spawns"                                                        |
| R05  | SPAWN_DENY agent                         | GENUINE        | reason contains "OFF the permitted-spawn allowlist"                                                             |
| R06  | Unlisted agent spawn                     | GENUINE        | reason contains "not on the non-code allow-list" AND tool is Task/Agent; sub NOT in ALLOWED_AGENTS             |
| R07  | OWNER_SPAWN_ONLY violation               | GENUINE        | reason contains "may be launched only from an owner/top-level session"                                          |
| R08  | SAFE_MODE edit attempt                   | GENUINE        | reason contains "SAFE_MODE may not be edited"                                                                   |
| R09  | SAFE_MODE clear attempt                  | GENUINE        | reason contains "clearing/emptying SAFE_MODE"                                                                   |
| R10  | Write while SAFE_MODE active             | GENUINE        | reason contains "SAFE_MODE active: writes halted"                                                               |
| R11  | Append-only in-place edit (pre-fix)      | FALSE-BLOCK    | reason contains "in-place edit denied" AND origin == "" (owner editing; agents should not edit these either but owner doing so is the primary false-block) |
| R11  | Append-only in-place edit (post-B2-fix)  | GENUINE        | After agent behavior fixed, any R11 remaining is a genuine retroactive-edit attempt                             |
| R12  | Non-pure-append write                    | GENUINE        | reason contains "write is not a pure append"; this is always a structural error, even for the owner             |
| R13  | Secret in handoff write                  | GENUINE        | reason contains "secret pattern detected in handoff write"                                                      |
| R14  | Secret in Bash to handoff                | GENUINE        | reason contains "secret pattern in Bash targeting handoff"                                                      |
| R15  | Runner Bash                              | GENUINE        | reason contains "autonomous runner: Bash is disabled"                                                           |
| R16  | Runner sub-agent spawn                   | GENUINE        | reason contains "autonomous runner: sub-agent spawning is disabled"                                             |
| R17  | Runner readonly write                    | GENUINE        | reason contains "readonly runner cycle: all writes blocked"                                                     |
| R18  | Fail-closed eval error                   | GENUINE        | reason contains "fail-closed: guard could not evaluate"                                                         |

**Note on R03 disambiguation in the readiness check:**
The log JSON does not record RUNNER_CONTEXT. After B1 is deployed, R03 entries should
stop appearing entirely for legitimate sessions (owner passes through; sub-agents and
runner are already covered by R01 and R15/R16/R17 respectively). Therefore: after B1
deploy date, ANY R03 entry in the log is GENUINE (it means a sub-agent tried to write
a role file, which is a real violation). The readiness check should use deploy date as
the boundary: R03 entries before B1 deploy = exclude from counter; R03 entries on or
after B1 deploy = GENUINE.

**Note on R11 disambiguation:**
After B2 behavioral fix is propagated (role files and owner habit changed to Write-append),
R11 should also drop to zero for legitimate workflows. Any R11 after that is a genuine
retroactive-edit attempt. Same deploy-date boundary applies.

**Summary count:**
- Reason types total: 18 (R01-R18, with R03 and R11 having pre/post states)
- Post-fix GENUINE: 16 (R01, R02, R03-post, R04, R05, R06, R07, R08, R09, R10,
  R11-post, R12, R13, R14, R15, R16, R17, R18)
- Pre-fix FALSE-BLOCK categories: 2 (R03-pre = B1; R11-pre = B2)
- After both fixes deployed: 0 expected false-block reason types

---

### 2.3 -- Coverage Conditions

"0 false-blocks for 7 days" is meaningless if the system was quiet -- no governed actions
taken, no coverage of the rules being tested.

**Coverage must be TRUE for the trailing 7-day window:**

C1 -- Runner coverage: >= 14 distinct runner cycle events (key + "start" event) in
      memory/agent-runs.jsonl with ts in window. At 2h cadence per day this is ~7 act
      cycles minimum (14 covers both readonly and act cycles). Threshold: 14.
      Python check: count lines in agent-runs.jsonl where event == "start" and ts in window.

C2 -- Owner Red-path write observed: >= 1 log entry with reason containing "Red path"
      AND decision == "allow" (not would-DENY, not deny) in window. This proves B1 fix
      is live AND the owner's session actually exercised the exemption.
      If 0 owner Red-path writes occurred naturally in the window, the gate is NOT met --
      the owner must make at least one .claude/agents/ write (e.g. a trivial edit to any
      role file) to validate the B1 path.
      Python check: any line in agent-guard.log where decision == "allow" AND
      reason does NOT start with "[shadow]" AND "Red path" in reason AND ts in window.

C3 -- Sub-agent governed write observed: >= 5 log entries where decision == "allow"
      AND tool in (Write, Edit, MultiEdit) AND origin is a known sub-agent name
      (i.e. the line's reason does not start with "[shadow]" in enforce mode)
      AND ts in window. This proves PATH_SCOPE enforcement ran real agent writes.
      Python check: count allow decisions on governed write tools in window where
      reason contains "ungoverned path" or "pure append" (i.e. passed the guard).
      Threshold: 5.

C4 -- Append-only Write observed: >= 1 log entry where reason contains "pure append"
      AND decision == "allow" AND ts in window. This proves B2 behavioral fix is live
      (agents are using Write-append correctly).
      Python check: any line where reason contains "pure append" and decision == "allow".

---

### 2.4 -- Green Condition (Exact)

All four sub-conditions must be simultaneously TRUE:

GREEN = (
    B1_deployed       # B1 fix is in guard.py (deploy date recorded in decisions-log.md)
    AND B2_deployed   # B2 behavioral fix propagated (role files updated, deploy date logged)
    AND false_blocks_7d == 0   # zero FALSE-BLOCK reason types in trailing 7-day window
    AND C1_met        # >= 14 runner start events in window (agent-runs.jsonl)
    AND C2_met        # >= 1 owner Red-path allow in window (agent-guard.log)
    AND C3_met        # >= 5 sub-agent governed write allows in window
    AND C4_met        # >= 1 pure-append allow in window
)

When GREEN is first TRUE, the readiness check emits a single surface event to Eco,
who presents to owner for A1 flip decision. The check remains silent until then.

**False-block detection rule (Python, enforce mode only):**
A log line is a false-block if ALL of:
- decision == "deny" (in enforce mode, no "[shadow]" prefix)
- The reason matches a pre-fix FALSE-BLOCK pattern:
  - R03-pre: "Red path" in reason AND line ts < B1_deploy_date
  - R11-pre: "in-place edit denied" in reason AND line ts < B2_deploy_date
- After both deploy dates: no reason type remains in the FALSE-BLOCK category,
  so false_blocks_7d will naturally stay 0 once behavior is corrected.

**7-day window definition:** trailing 168 hours from the readiness check run time
(UTC). The check reads the last 168h of agent-guard.log and agent-runs.jsonl.

---

## IMPLEMENTATION NOTES FOR ECO

1. Deploy B1 first. Record deploy date in decisions-log.md (append entry).
2. Update agent role files and owner habit for B2. Record deploy date.
3. Build the readiness check as a pure-Python script that reads agent-guard.log
   and agent-runs.jsonl, applies the rules above, and prints GREEN or SILENT.
4. Wire the readiness check to run daily (add to runner or standalone cron).
5. First GREEN output -> Eco surfaces to owner -> owner A1 flip.
6. The check must be idempotent: running it multiple times in one day is safe.

---

## SOURCES VERIFIED THIS SESSION

- .claude/hooks/guard.py (full file read)
- memory/agent-guard.log (lines 1-847; log ends 2026-06-30)
- integrations/runner/runner.py (full file read)
- memory/agent-runs.jsonl (lines 1-20; structure verified)
- memory/GUARD_MODE (confirms: shadow)
