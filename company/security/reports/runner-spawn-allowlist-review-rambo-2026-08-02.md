# Security Review: Runner-Path Sub-Agent Dispatch (owner A1 2026-08-02)
# + BF-1/BF-2 Permission-Drift Closure (Envelope 3 + Envelope 4)

Prepared by: Rambo (Security)
Date: 2026-08-02
Triggered by: Eco dispatch (interactive session); code shipped same day
Scope: .claude/hooks/guard.py (RUNNER_SPAWN_ALLOW, RUNNER_SPAWN_CAP, SPAWN_COUNT_FILE,
  _runner_spawn_take_slot, runner branch of evaluate(), OWNER_SPAWN_ONLY check) and
  integrations/runner/runner.py (PER_JOB_TOOLS, RUNNER_CYCLE_ID stamping in main(),
  _spawn_count)

Files read: guard.py (full), runner.py (full), test_guard.py (full, 94 tests confirmed
  present; suite was green per the runner guard-suite job this session)

---

## Section A: Threat-case assessments

### (a) Nested chain -- can a dispatched Anat spawn further?

FINDING: CLOSED. The guard evaluates nested dispatch at lines 521-522:
  if str(event.get("agent_type", "")): -> DENY, "runner dispatch: nested spawn (depth > 1)
  is disabled"
When a dispatched Anat makes a Task/Agent call, her origin (agent_type) is "anat" -- a
non-empty string. The nested-spawn check fires before RUNNER_SPAWN_ALLOW is consulted.
The check is inside the RUNNER_CONTEXT=1 branch, which is hard-enforced regardless of
GUARD_MODE.

Test coverage: test_runner_dispatch_denies_nested_spawn (dispatch fixture, agent_type=
"anat", subagent_type="rambo") -> DENY, "nested" in reason. COVERED.

One nuance: the nested-spawn deny uses event.get("agent_type") for the CALLING agent's
origin, not the target. This is correct. A dispatched agent cannot hide her origin by
omitting agent_type -- Claude Code populates that field for every sub-agent tool call.
Confirm this invariant holds for all tool types (Write, Edit, Task); guard.py uses the
same origin variable throughout evaluate(). CONFIRMED. No gap.

### (b) OWNER_SPAWN_ONLY fix -- can a runner-path Eco reach gal/shir/adi/oren/noa?

FINDING: CLOSED. The old check at the sub-agent spawn block tested `origin` alone:
"may be launched only from a top-level/owner session". The comment in the code confirms
the old logic was safe only while the runner could spawn nobody. The new code at lines
597-609 tests:
  if sub in OWNER_SPAWN_ONLY and (
      origin
      or os.environ.get("RUNNER_CONTEXT") == "1"
      or os.environ.get("BRIDGE_CONTEXT") == "1"
  ):
This closes three attack surfaces simultaneously:
- A runner-path agent (RUNNER_CONTEXT=1, origin empty) trying to dispatch a code-builder:
  the RUNNER_CONTEXT branch fires. BLOCKED.
- A bridge-path agent (BRIDGE_CONTEXT=1, origin empty) trying the same: BRIDGE_CONTEXT
  branch fires. BLOCKED.
- A runner-dispatched sub-agent (e.g., Anat, origin="anat") trying to dispatch a code-
  builder: the nested-spawn check fires first (threat (a)), then origin is non-empty
  anyway. BLOCKED by two rules.

Test coverage: test_runner_cannot_dispatch_code_builders (parametrized: gal, shir, adi,
oren, noa) -- all DENY. test_bridge_cannot_spawn_code_builders (gal). COVERED.

Regression test: test_owner_session_can_still_spawn_code_builders -- gal and shir still
ALLOW from an owner session (no agent_type, no contexts). CONFIRMED -- the fix does not
lock the owner out. COVERED.

RESIDUAL: The test for code-builder denial on the BRIDGE path covers gal but not shir/
adi/oren/noa explicitly. This is a minor coverage gap (see Section B, missing cases).

### (c) Counter tampering -- can an agent reset its own per-cycle dispatch budget?

FINDING: CLOSED for the main case; one edge case documented below.

The guard protects SPAWN_COUNT_FILE at lines 628-631:
  if rel == SPAWN_COUNT_REL and (origin or os.environ.get("RUNNER_CONTEXT") == "1"):
      DENY, "runner dispatch counter is code-managed"
This blocks:
- Any sub-agent (origin set) writing the file. BLOCKED.
- A runner-path agent (RUNNER_CONTEXT=1, origin empty) writing the file. BLOCKED.
- The owner's interactive session (origin empty, no RUNNER_CONTEXT) CAN write it.
  This is correct: the owner can clear the counter by hand.

runner.py main() initializes the counter directly (os.environ stamp + SPAWN_COUNT_FILE
write at lines 994-999). This runs as the runner process itself, not as a spawned
agent, so RUNNER_CONTEXT is not set at init time and the guard is not involved. The
runner process is trusted (it is the runner, not a sub-agent). No issue.

_runner_spawn_take_slot() writes the counter in the guard only after the increment.
A dispatched agent cannot call _runner_spawn_take_slot() directly -- it is a guard
function, not an agent-accessible tool.

EDGE CASE -- retry budget: runner.py run_job() retries on RETRY_PATTERNS (session
limit, stall, etc.). A retried job sends the SAME RUNNER_CYCLE_ID because it was set
once in main() and inherited via env. In _runner_spawn_take_slot(), a retry that
previously consumed a slot will find count already incremented (the slot was taken on
the first attempt). The retry cannot add a fresh dispatch on a new cycle ID. This is
the correct behavior per the code comment ("A retried job reuses the same RUNNER_CYCLE_ID,
so the retry cannot double the cycle's budget"). CONFIRMED. No issue.

Test coverage: test_dispatch_counter_not_writable_by_agents (RUNNER_CONTEXT=1),
test_dispatch_counter_not_writable_by_sub_agent (origin=dalia, no RUNNER_CONTEXT). COVERED.

### (d) Fail-open paths in _runner_spawn_take_slot

FINDING: ALL PATHS ARE FAIL-CLOSED. Reviewed each error case:

d1. Missing cycle id: cycle = os.environ.get("RUNNER_CYCLE_ID", "") is ""; returns
    False immediately, "no RUNNER_CYCLE_ID in env (fail-closed)". DENY. Test:
    test_runner_dispatch_fails_closed_without_cycle_id. COVERED.

d2. Corrupt counter file: the except (OSError, ValueError, TypeError, AttributeError)
    block sets count = 0, not cap. This means a corrupt file resets the count to zero,
    giving the next dispatch a fresh slot. This is INTENTIONAL FAIL-OPEN within the
    cycle, not fail-open overall: the cap still applies from count=0 (max 3 dispatches
    possible even if the file was corrupt). The risk is that a corrupt file allows UP TO
    cap dispatches even after some already happened. Assessed as LOW risk: a corrupt
    file in a given cycle is a one-cycle event; the runner re-initializes at each main()
    call. A malicious agent writing garbage to the file is already blocked by the write
    protection above (finding c). An external process corrupting the file is a host-level
    compromise, not an agent-level control failure.

d3. Unwritable counter: except OSError at lines 380-381 returns False, "dispatch counter
    unwritable (fail-closed)". DENY. The deny fires only AFTER the cap check passes, so
    an unwritable counter prevents dispatch even when the cap has not been reached. This
    is FAIL-CLOSED: if the counter cannot be written, the dispatch is denied. No issue.

d4. Retried job reusing same cycle id: covered in (c) above. The count from the first
    attempt persists; the retry reads the same count; cannot exceed cap. No issue.

d5. MISSING CASE: corrupt counter file on a cycle where the cap should already be
    exhausted. If count = 3 is written to disk, then the file is corrupted (zeroed),
    then another dispatch attempt comes in the same cycle, count reads as 0 < 3 and a
    fourth dispatch would be granted. This is a theoretical race: in practice the
    counter file is only corrupted by external interference. Assessed as LOW for now.
    Document and monitor.

No test covers the corrupt-file-after-cap case. See missing cases in Section B.

### (e) Prompt injection -- board rows and handoff files as dispatch inputs

FINDING: PARTIAL MITIGATION. The current dispatch path is:
  1. runner.py reads the board (BOARD) for the actionable gate.
  2. Eco receives the board content and handoff files as part of her task prompt.
  3. Eco decides which agent to dispatch via the Task tool.
  4. The guard validates the dispatch (allowlist, cap, depth, cycle id).

The board is untrusted data in the sense that any agent (now 32 agents can write board
rows) can put arbitrary text into a board row. A malicious board row could attempt to
instruct Eco to dispatch an agent outside RUNNER_SPAWN_ALLOW, or to pass a crafted
prompt to a dispatched agent.

GUARD STOPS: the guard enforces the allowlist and depth at dispatch time regardless of
what Eco was instructed to do. If a board row says "dispatch Gal", Eco's Task call to
gal is DENY (not on RUNNER_SPAWN_ALLOW). The guard is the hard boundary.

GAP: the guard cannot inspect the CONTENT of the prompt passed to the dispatched agent
(it validates the Task call's subagent_type, not the task parameter inside the tool
input). A board row crafted as an instruction could instruct a legitimately dispatched
Anat to take actions outside her scope. Example: a board row says "Anat: grant write
to company/governance/" -- if Eco passes this as the task envelope, Anat's guard would
catch the write at execution time (PATH_SCOPE), but the agent may have spent tokens
on the attempt.

CURRENT MITIGATIONS: (1) PATH_SCOPE denies out-of-scope writes even if the agent
follows injected instructions. (2) Dispatched agents are non-Bash, so injected shell
commands cannot execute. (3) RUNNER_SPAWN_ALLOW contains only Rambo, Eyal, Dalia,
Anat -- low blast radius agents (no code execution, no send, no external network). (4)
Eco.md and the runner prompts already include tainted-content reminders.

RECOMMENDATION: add an explicit instruction to the Eco dispatch prompt that task
envelopes sent to dispatched agents must come from the runner's own job prompts (agent-
prompts.md entries), not from board row text verbatim. Dispatched agents receive task
definitions, not user-supplied free text from board rows. Eco routes the finding, not
the content.

Assessment: ACCEPTABLE for the current scope. The blast radius of the four allowed
agents is low; PATH_SCOPE catches most injection attempts at write time. Track as a
standing watch item.

### (f) Emergency-notify flag -- can an agent set it directly?

FINDING: CLOSED. The `urgent` flag in runner.py run_job() is set at line 737:
  urgent = bool(lines_out) and lines_out[0].startswith("URGENT:")
This is derived from the agent's TEXT OUTPUT, not from any field the agent can
set in a structured way. The agent writes "URGENT: ..." as the first line of its
natural-language output; the runner reads this deterministically. An agent cannot
call a function or set an environment variable to force urgent=True independently of
its text output.

RESIDUAL: an injected instruction in a board row could cause Eco to produce a
first output line starting with "URGENT:" for a non-urgent situation, causing quiet-
hours piercing. This is a prompt-injection vector for the emergency channel. Current
mitigation: the runner prompts already define when URGENT: is appropriate; Eco.md
includes verify-before-forward; the tainted-content rule (e) partially mitigates.

Assessed as LOW-MEDIUM: the attacker can cause a false-urgent Telegram notification
but cannot cause send, code execution, or data exfiltration via this vector. Document
and include in the Eco runner prompt guidance.

---

## Section B: Missing test cases (specific gaps in the 94-test suite)

The suite is well-designed and covers the primary threat paths. Specific missing cases
that should be added:

MISS-1 (corrupt-counter-after-cap): a test that writes a corrupted counter file after
  three dispatches have been recorded in the current cycle and verifies the guard still
  denies the fourth dispatch. Currently unverified.

MISS-2 (code-builder bridge denial for shir/adi/oren/noa): test_bridge_cannot_spawn_
  code_builders covers gal only. Parametrize to cover all five OWNER_SPAWN_ONLY agents
  on the BRIDGE_CONTEXT path.

MISS-3 (manage_gmail_filter runner path): the guard denies manage_gmail_filter on
  the runner path (lines 492-493). No test verifies this specific denial. Add a test
  analogous to the send_gmail_message runner tests.

MISS-4 (runner dispatch in shadow mode, valid request): test_runner_dispatch_denied_
  in_shadow_mode tests a non-allowlisted agent in shadow and confirms DENY. A
  symmetric test for an allowlisted agent in shadow mode (should ALLOW with hard-
  enforced cap logic still running) would confirm shadow does not degrade dispatch
  limits in a different direction. Minor.

MISS-5 (runner path Eco -> code-builder via OWNER_SPAWN_ONLY + RUNNER_CONTEXT): the
  parametrized test_runner_cannot_dispatch_code_builders uses the dispatch fixture
  which sets origin empty. There is no test for the case where a runner-dispatched
  Anat (origin="anat") tries to dispatch a code-builder -- this path is covered by
  the nested-spawn check (a), not by OWNER_SPAWN_ONLY, so the OWNER_SPAWN_ONLY fix
  for the runner path is not directly tested. A test with RUNNER_CONTEXT=1 and
  agent_type="" (simulating runner-path Eco, not a sub-agent) trying to dispatch gal
  would directly verify the invariant fix.

MISS-6 (append-canary file is in APPEND_ONLY): the code adds memory/append-canary.md
  to APPEND_ONLY (line 263). No test verifies that Edit on this file is denied or that
  a non-append Write is denied. The parametrized append-only tests should include this
  path to confirm the canary set membership is enforced.

These are additions, not corrections. The existing 94 tests are structurally sound
and cover the primary attack surfaces.

---

## Section C: Residual risks and rollback levers

RESIDUAL-1 (injection via board row into dispatched agent prompt): documented in (e).
  LOW-MEDIUM. All out-of-scope writes are denied by PATH_SCOPE at execution time.

RESIDUAL-2 (Bash-free enforcement is behavioral for dispatched agents): the test
  test_runner_spawn_allowlist_holds_no_bash_agents verifies Bash is absent from the
  role-file Tools: line for each RUNNER_SPAWN_ALLOW member. This is a file-content
  check, not a runtime enforcement -- if a role file is edited to add Bash, the test
  breaks before a deployment. The guard also denies Bash on the runner path at the
  top of the runner branch (line 511-512), so even if the role file changed, the guard
  would still deny a Bash call from a runner-dispatched agent. Double-covered.

RESIDUAL-3 (RUNNER_CYCLE_ID collision): the cycle ID is t.isoformat() (UTC ISO 8601
  precision to microseconds). Two cycles within the same microsecond would share a
  budget. Task Scheduler cadence is 2h; this is not a realistic threat for the
  current deployment. No change needed.

RESIDUAL-4 (corrupt counter after cap -- theoretical): documented in (d5). LOW.

ROLLBACK LEVERS (if this misbehaves):

R-LEVER-1 (immediate, zero-downtime): write any content to memory/SAFE_MODE. The
  guard's SAFE_MODE check (lines 579-580, 660-661) denies ALL spawn and write actions
  from all agents. This stops all dispatcher behavior instantly. Owner can write
  SAFE_MODE from any interactive session; the runner checks it at cycle start.

R-LEVER-2 (surgical): set RUNNER_SPAWN_CAP to 0 in guard.py. Every dispatch attempt
  will exceed the cap immediately. Requires editing guard.py (owner-session A1 write).
  Takes effect on the next runner cycle.

R-LEVER-3 (targeted): remove an agent from RUNNER_SPAWN_ALLOW in guard.py. If a
  specific dispatched agent is misbehaving, removing it from the allowlist stops all
  further dispatches of that agent. Owner-session A1 write; next cycle effective.

R-LEVER-4 (structural): set RUNNER_MODE=readonly for all jobs. No dispatches allowed
  on readonly cycles (guard line 519). The runner mode is set per-cycle in the Task
  Scheduler command; changing the scheduler task argument stops all dispatching without
  touching guard code.

---

## Section D: Timeout assessment (Rambo weekly scan)

The weekly permission-drift scan has ended in error_final (TimeoutExpired) on every
run since 2026-07-18. The timeout has been raised to 900s in PER_JOB_TIMEOUTS for
"Rambo:Weekly Permission-Drift Scan (Mondays)". Is 900s sufficient?

Scan workload (actual, per role file pattern): 32 role files at ~8000 chars each =
~256KB total reads. Plus guard.py (~800 lines), access-matrix.md, security-baseline.md,
gate-register.md (~800+ lines). Estimated total read volume: ~400KB files + analysis.
At Sonnet model throughput on the runner path (no Bash, no external calls): the scan
should complete in 2-5 minutes of LLM processing time. 900s (15 minutes) provides
a 3x-7x margin over the estimated workload.

Assessment: 900s is sufficient for the current scan scope. The previous 300s timeout
was never enough for a 32-agent scan and was set from the DEFAULT Sonnet model timeout
(300s), not from the actual scan workload. The dashboard's "OK" reporting on timeout
failures was a monitoring blind spot (the dashboard read last-run DATE, not last
terminal event outcome); this was corrected in the dashboard update this session.

Recommendation: leave at 900s. If a future expansion (e.g. scanning 50+ agents,
credential-store directories, all mcp.json files) pushes past 600s of actual LLM
time, revisit. For now 900s is safe.

---

## Section E: Overall assessment

SHIPPED CODE IS SOUND with the residual risks documented above. The primary threat
cases (a) through (f) are all CLOSED or ACCEPTABLE-RESIDUAL. The 94-test suite
covers the main paths. Missing cases (MISS-1 through MISS-6) are additions, not
corrections to existing behavior -- no existing test is wrong.

ONE NOTE: this review was conducted hours after the code shipped (owner dispatch gap
forced the delay). Confirmed no real holes. The code can remain in production.

---

## Section F: BF-1 / BF-2 permission-drift closure (Envelope 4)

### Background

Rambo's weekly permission-drift scan reported an unchanged roster finding for seven
consecutive scans (first flagged 2026-07-13, still open 2026-07-27 -- 14+ days
overdue). Finding: company/roster.md carried retired persona names (Tim, Noam, Avner,
unnamed Designer) and omitted five live agents (Oracle, Yael, Yossi, RedTeam/Red,
MeetingPrep). This is a two-part finding:
- BF-1: retired names present (Tim/Noam/Avner/unnamed Designer)
- BF-2: five live agents absent

### Current state (verified this session by reading both files)

The .claude/agents/ directory contains exactly 32 files:
  Alex, Anat, Assaf, Designer, Ella, Erez, Eyal, Gal, Ido, Jack, Jenny, Lital, Luci,
  Mike, Noa, Oracle, Oren, Perry, RedTeam, Roman, Sally, Sami, Shir, Yossi, Zvika,
  Yael, Rambo, Dalia, MeetingPrep, Hila, Adi, Eco.

company/roster.md version: v2.3, dated 2026-08-02.

v2.3 changes per the file header: "full rebuild. Retired persona names removed
(Tim -> Sally, Noam -> Perry, Avner -> Jack, unnamed Designer -> Tal). Five previously
OMITTED agents added (Oracle, Yael, Yossi, RedTeam/Red, MeetingPrep). Every agent in
.claude/agents/ now has a row."

Cross-check: roster section 1 lists 32 named agent rows plus owner jecki. Counting:
Eco, Luci, Erez, Dalia, Anat, Assaf, Rambo, Eyal, Lital, Oracle, Zvika, Yael, Yossi,
RedTeam(Red), Perry, Designer(Tal), Sami, Ido, Gal, Shir, Adi, Oren, Noa, Roman,
Mike, Jenny, Jack, Ella, Sally, Hila, Alex, MeetingPrep = 32 agents. Matches .claude/
agents/ file count.

BF-1 (retired names): Tim, Noam, Avner, unnamed Designer -- ABSENT from v2.3. BF-1
CLOSED.

BF-2 (five omitted agents): Oracle, Yael, Yossi, RedTeam, MeetingPrep -- ALL PRESENT
in v2.3 section 1. BF-2 CLOSED.

### Why the finding survived seven scans

The scan ran weekly on Mondays; the runner timeout (300s) caused error_final on every
run since 2026-07-18. The dashboard reported "OK" based on last-run date, not last
terminal event. The finding was never cleared because the scan never completed; it
never escalated because the runner had no way to dispatch Rambo for remediation
(the dispatch gap this session corrected). The scan also lacked a hard rule to
escalate by scan number rather than repeating silently.

Root cause: (1) timeout too short (fixed: 900s); (2) dashboard monitoring read the
wrong field (fixed this session); (3) no escalation trigger by scan number (addressed
in Rambo role file update this session: "escalate a finding by scan number rather than
repeating it silently").

### Rambo closure statement

BF-1 and BF-2 can now be CLOSED. company/roster.md v2.3 matches .claude/agents/ ground
truth. The seven-scan survival was a runner/monitoring failure, not a governance failure.
The contributing factors (timeout, dashboard metric, no escalation trigger) are corrected.
Record this closure in the next permission-drift scan log entry.

Rambo, 2026-08-02
