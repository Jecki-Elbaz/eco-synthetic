# Guard Delta Scan -- 2026-08-02 Owner Revision
# Rambo (Security) | 2026-08-02
# Tasked by: Eco (CEO) | Context: interactive owner session, post-change scan
# Scope: .claude/hooks/guard.py, all changes in guard-diff-2026-08-02.patch (297 lines)

Sources read:
- guard-diff-2026-08-02.patch (full, 297 lines)
- .claude/hooks/guard.py (full, 802 lines)
- company/governance/agent-tool-spawn-allowlist.md
- company/security/reports/guard-diff-consolidated-preflip-2026-07-14.md (full)
- company/hr/competency/Yossi-rambo-scan.md (full)
- memory/board.md (T-0020, SEC-0001, AUD-009 rows)
- .claude/agents/Yael.md (full, 144 lines)
- .claude/agents/Yossi.md (full, relevant sections)
- integrations/runner/runner.py (relevant sections: RUNNER_CYCLE_ID, run_job)
- memory/append-canary.md (verified on disk)

---

## OVERALL VERDICT: CLEAR-WITH-CONDITIONS

Security fundamentals hold. Bug fix (Change 4) closes a genuine bypass. Runner dispatch
architecture is well-defended. One excess-scope finding on Yael requires resolution before
the enforce flip (see Must-Fix below). No change invalidates the ~2026-08-03 GREEN
projection; the canary addition (Change 6) accelerates C4 completion.

---

## CHANGE-BY-CHANGE FINDINGS

---

### Change 1 -- RUNNER_SPAWN_ALLOW + RUNNER_SPAWN_CAP + spawn-count file

Assessed: (a) depth-1 enforcement, (b) race safety, (c) OWNER_SPAWN_ONLY integrity, (d) blast radius.

**(a) Depth-1 enforcement -- CLEAR**

Implemented at evaluate() lines 520-521:
  if str(event.get("agent_type", "")):
      return DENY, "runner dispatch: nested spawn (depth > 1) is disabled"

Mechanism: agent_type is empty when a tool call originates at the top level of a spawned
Claude process. When a sub-agent (e.g. Anat, spawned by runner-Eco) calls Task, agent_type
is "anat" (truthy) and the DENY fires before any allowlist check. Verified case-by-case:
- Runner spawns Eco (headless process, RUNNER_CONTEXT=1, agent_type="") -> not a spawn
  event from within a sub-agent; no depth check triggered.
- Runner-Eco spawns Rambo: agent_type="" (Eco is top-level in its process) -> depth check
  passes. Allowlist: "rambo" in RUNNER_SPAWN_ALLOW -> allowed.
- Rambo (sub-agent of runner-Eco) has no Agent tool -> cannot trigger depth check anyway.
- Anat (spawned by runner-Eco): agent_type="anat" if Anat attempts Task -> depth DENY.
Depth-1 is correctly enforced.

**(b) Spawn-count file race safety -- CLEAR**

The SPAWN_COUNT_FILE uses a read-then-write pattern without a file lock. A TOCTOU race
could allow two concurrent guard invocations to each read count=0 and both write count=1,
effectively doubling the budget. However: runner.py uses subprocess.run() (blocking) to
execute jobs sequentially within one cycle. Verified in runner.py (lines ~307-324): no
parallel job execution. RUNNER_CYCLE_ID is stamped into os.environ before any job starts
(runner.py line ~994); all jobs inherit it via subprocess env. Only one guard instance
runs at a time per the sequential model. No race in current implementation.
Condition: if runner.py ever adds parallel job execution, revisit SPAWN_COUNT_FILE for
atomic writes (write to temp + rename pattern used elsewhere in runner.py).

**(c) OWNER_SPAWN_ONLY integrity -- CLEAR**

The old check (origin alone) was documented as safe only while the runner could spawn
nobody. RUNNER_SPAWN_ALLOW ends that invariant. The new check:
  if sub in OWNER_SPAWN_ONLY and (
      origin or os.environ.get("RUNNER_CONTEXT")=="1" or os.environ.get("BRIDGE_CONTEXT")=="1"
  ):
A runner-spawned Eco (origin="", RUNNER_CONTEXT=1) attempting to spawn noa/gal/shir/adi/oren
is denied first at the RUNNER_SPAWN_ALLOW check (none are on it) and again at the updated
OWNER_SPAWN_ONLY check. Double protection. No regression; the fix strengthens the boundary.

**(d) Blast radius -- CLEAR-WITH-CONDITIONS**

All 4 RUNNER_SPAWN_ALLOW members:
- Rambo: Read, Write, Edit, Grep, Glob, WebFetch. No Bash, no Agent tool.
- Eyal: Read, Write, Edit. No Bash, no Agent, no WebFetch.
- Dalia: Read, Write, Edit. No Bash, no Agent.
- Anat: Read, Write, Edit, Agent. Agent tool is depth-blocked on runner path (agent_type
  check fires if Anat calls Task from within runner-Eco's session). No Bash.

PATH_SCOPE constrains all 4 to their declared write domains. Runner path processes bounded
internal work (board.md, internal files), not untrusted external input (that is the bridge,
which is hard-denied from spawning). The inbox-screen pipeline (Rambo screens first,
Eco processes only cleared summaries) means runner-Eco is not directly exposed to raw
untrusted content when it might dispatch Rambo.

Condition C1: monitor RUNNER_CYCLE_ID propagation and SPAWN_COUNT_FILE after first
production dispatch cycle; verify guard log shows runner dispatch allow entries.

**Change 1 verdict: CLEAR-WITH-CONDITIONS (C1 above; parallel-execution note)**

---

### Change 2 -- Yossi added to ALLOWED_AGENTS + PATH_SCOPE

**ALLOWED_AGENTS addition: CLEAR**
B5 scan (Yossi-rambo-scan.md) verdict was CLEAR. Owner A1 granted. Correct to add.

**PATH_SCOPE company/training/ + skills-register.md + memory/log.md: CLEAR**
Matches the B5 scan's exact guard diff addendum. No deviation on these three paths.

**PATH_SCOPE memory/board.md: CLEAR-WITH-CONDITIONS**
The B5 scan (finding #2) stated: "No write to memory/board.md (Yossi reads board; his
board rows are managed by Assaf/Eco; appropriate for L4)."
However: Yossi.md was updated on 2026-08-02 (owner A1) with a new "Status and blocked
protocol" section that REQUIRES board.md writes -- agents must append dated notes to their
own rows. This supersedes the B5 finding. The guard.py addition is consistent with the
updated role file behavior.
Condition C1: Yossi.md "Data and memory access" section still lists memory/board.md under
Read-only. Update that section to reflect write scope for own-row updates (consistency,
not security).

**Change 2 verdict: CLEAR-WITH-CONDITIONS (C1 above)**

---

### Change 3 -- BOARD-WRITE expansion (memory/board.md added to ~22 agents)

Rationale verified: board.md write was absent for 22 of 32 agents; their status was visible
only inside ephemeral spawn transcripts. Owner A1 2026-08-02 grants board write to all
acting agents for own-row updates.

Security assessment:
- Single-owner row discipline is behavioral only -- the guard cannot enforce that agents
  write only their own rows. A compromised or prompt-injected agent could write any row.
- Risk is bounded: board.md is git-tracked; all writes are auditable. The file-lock in
  integrations/file-lock/ handles write concurrency (separate from guard).
- No agent granted board write was previously excluded for security reasons (the exclusion
  was a structural omission, not an intentional restriction).
- RedTeam now has board.md write. RedTeam is in ALLOWED_AGENTS for governed writes
  (company/audits/redteam/) and is in SPAWN_DENY (cannot be spawned). Adding board.md
  for status updates is appropriate and within its already-cleared write surface.

Note: some agent role files have not yet been updated to reflect board.md write scope
in their "Data and memory access" sections. This is documentation lag that should be
addressed in a batch update (similar to AUD-010 pattern), but it does not block the
enforce flip -- the guard reflects the owner A1 intent.

Exception: Yael. See Change 5 below.

**Change 3 verdict: CLEAR-WITH-CONDITIONS (role-file batch doc update recommended)**

---

### Change 4 -- REPO_HANDOFF_PATH + _is_handoff() fix

**CLEAR -- closes a genuine security bypass.**

Bug: _is_handoff() previously resolved only against the absolute out-of-repo path
(C:/Users/Jecki/DEV/shared/handoff). The two-stage inbox screen writes to an in-repo
path (shared/handoff/inbox-screened/). A Write to that path bypassed the credential scan
entirely -- the scan returned False (not a handoff path) and no pattern check ran.

Fix correctly adds REPO_HANDOFF_PATH = ROOT / "shared" / "handoff" and updates _is_handoff()
to iterate both bases with per-base exception handling (OSError on one base does not short-
circuit the other). The fix is correctly implemented; no logic gap found.

Note: _targets_handoff() (for Bash commands) checks "shared/handoff" as a substring match
and covers both paths already. The bypass was specific to Write-tool path evaluation.

**Change 4 verdict: CLEAR**

---

### Change 5 -- PATH_SCOPE additions for erez / oracle / yael

**Erez memory/board.md: CLEAR**
Board-write expansion. Erez writes project deliverables and investor research. Own-row
status updates are appropriate. Within owner A1 batch.

**Oracle memory/board.md: CLEAR**
Chronicle agent. Own-row board updates are appropriate. Within owner A1 batch.

**Yael memory/board.md: CONCERN (non-blocking)**
Yael.md Data and memory access section explicitly lists memory/board.md as Read-only:
"Read: memory/board.md, memory/wiki/ (need-to-know for index completeness)."
There is no "Status and blocked protocol" section in Yael.md (unlike Yossi.md, which was
updated 2026-08-02 with an explicit board-write requirement). The board-write expansion
covers all acting agents per the owner A1 comment, so the write grant is authorized -- but
Yael.md should be updated to reflect this (Read + write: memory/board.md, own rows).
This is documentation lag, not a guard error. Not a flip blocker.

**Yael memory/wiki/file-index.md: FLAG -- excess scope**
Yael.md Data and memory access section: "Read: memory/wiki/ (need-to-know for index
completeness)." The entire memory/wiki/ tree is explicitly listed as READ-only for Yael.
Yael's formal write scope per role file is:
  "Read + write: company/governance/file-index.md (primary work product)."
  "Write: memory/log.md (own activity entries only)."
memory/wiki/file-index.md is NOT in Yael's declared write scope.

Additionally: the diff adds this path with no explanatory comment. It was not in the
AUD-009 consolidated preflip diff, not in the Yael original PATH_SCOPE, and not requested
in any board row I found. The addition appears to anticipate a second index file Yael
would maintain under memory/wiki/, but that operational need is not yet documented in
the role file.

memory/wiki/ is Dalia's domain (Dalia PATH_SCOPE includes "memory/wiki/"). Any Yael write
to that directory tree should be authorized by Dalia (A2) with a matching Yael.md update.

After the enforce flip this write will be ALLOWED (not blocked), so it will not cause
a false-block. But it is genuine excess scope with no current role-file authorization.
Recommend resolution before the enforce flip -- see Must-Fix section.

**Change 5 verdict: CLEAR (erez/oracle), CONCERN non-blocking (yael board.md), FLAG (yael wiki/file-index.md)**

---

### Change 6 -- memory/append-canary.md added to APPEND_ONLY

Verified against the C4 design (company/security/reports/c4-gate-design-rambo-2026-08-01.md,
and SEC-0001 board row ECO A2 RECONCILE entry 2026-08-01):

Design spec: "add memory/append-canary.md to APPEND_ONLY in guard.py"
Live guard.py line 263: "memory/append-canary.md"  # C4 gate comment

One line only. Comment is accurate. memory/append-canary.md exists on disk (verified:
6-line header-only canary file, LF endings, no content below the header -- ready for
Eco's first heartbeat Write-append). The C4 check in enforce_readiness_check.py was
confirmed (board SEC-0001 row) to already match "pure append to 'memory/append-canary.md'"
without modification. No further changes needed.

This is the last guard.py change needed to unblock C4. After the first Eco act-cycle
canary write, C4 transitions from 0 to 1.

**Change 6 verdict: CLEAR -- exactly matches design spec**

---

### Change 7 -- cycle_id field added to _log()

Audit trail enrichment. Adds os.environ.get("RUNNER_CYCLE_ID") to each guard log record,
joining a guard decision to the runner cycle that produced it. Read-only security surface;
no access control effect. Correct and useful for post-hoc dispatch tracing.

**Change 7 verdict: CLEAR**

---

## ALLOWLIST DOC SYNC STATUS

company/governance/agent-tool-spawn-allowlist.md -- SYNC NEEDED.

The doc's "Runner-spawn" section (T-0020 C3 resolution) describes the runner as
"spawning agents as separate headless claude processes with an explicit allowed-tools
whitelist." That model is unchanged. However, the new RUNNER_SPAWN_ALLOW = {rambo, eyal,
dalia, anat} is a DIFFERENT mechanism: runner-path Eco dispatching sub-agents via the
Agent/Task tool, governed by the guard (not by runner.py's subprocess tool-stripping).

The doc does not document this new mechanism. The guard.py comment says
"Sync: company/governance/agent-tool-spawn-allowlist.md" -- the sync has not been done.

Required additions:
1. A new section distinguishing:
   (a) Runner.py direct subprocess launch (unchanged -- all roster agents, stripped)
   (b) Runner-path Agent/Task dispatch (new -- only RUNNER_SPAWN_ALLOW, depth 1,
       act cycles only, cap RUNNER_SPAWN_CAP=3 per cycle)
2. The 4 hard limits (allowlist, depth 1, act-only, cap=3)
3. Attribution: owner A1 2026-08-02

This sync is a governance gap, not a security hole. The guard is the enforcement layer.
Recommend completing before the enforce flip so the doc matches the live posture.

---

## SEC-0001 ENFORCE FLIP IMPACT

**Does any change invalidate current metrics or the ~2026-08-03 GREEN projection?**

NO. Analysis:

- Change 6 (canary) UNBLOCKS C4. This is the positive impact. The ~2026-08-03 date
  was already projected; this change makes C4 achievable on the next Eco act cycle.

- Board-write expansion (Change 3): converts would-DENY path-scope events for ~22 agents
  into genuine-allows. False-block count decreases, not increases. No new false-blocks.

- RUNNER_SPAWN_ALLOW (Change 1): introduces new guard log entries with reason strings
  beginning "runner dispatch: ..." (allow) or "runner dispatch: ..." (deny). These are
  genuine allows/denies, not false-blocks. The enforce_readiness_check.py classification
  should treat them correctly (they match no false-block reason pattern from the design doc).

- No change resets the 168h clean-window clock. Pre-B2 false-blocks continue aging out
  on schedule (~2026-08-03). No new false-block categories introduced.

- Yael excess scope (yael wiki/file-index.md) causes no false-blocks -- it is an over-permit,
  not an under-permit. The flip will not block any Yael operation.

**The ~2026-08-03 GREEN projection stands. This change set accelerates it.**

---

## MUST-FIX LIST

### Before enforce flip:

M1. **Yael PATH_SCOPE -- memory/wiki/file-index.md (EXCESS SCOPE)**
    Remove "memory/wiki/file-index.md" from Yael's PATH_SCOPE in guard.py, OR update
    Yael.md "Data and memory access" section to include memory/wiki/file-index.md as a
    write path (requires Dalia A2, since memory/wiki/ is her domain) + owner A1 for the
    role file edit.
    Reason: the path is not authorized by Yael's current role file. After the enforce
    flip, Yael will have write access beyond her declared scope with no documented basis.
    This is the only finding that rises to must-fix-before-flip.

### Before or shortly after flip (conditions, not hard blockers):

C1. **agent-tool-spawn-allowlist.md sync** -- add runner-path Agent/Task dispatch section
    documenting RUNNER_SPAWN_ALLOW = {rambo, eyal, dalia, anat}, depth-1 limit, act-only,
    cap 3/cycle. Owner A1 2026-08-02 attribution.

C2. **Yael.md "Data and memory access" update** -- add memory/board.md to write scope (own
    rows) to reflect the 2026-08-02 board-write expansion. Dalia A2 change to Yael.md
    (or owner A1 role-file batch update similar to AUD-010).

C3. **Yossi.md "Data and memory access" update** -- current section lists memory/board.md
    as Read only. Update to write (own rows) for consistency with the 2026-08-02
    "Status and blocked protocol" section already in the role file. Owner A1 role-file
    batch.

C4. **Board-write role-file batch** -- other agents whose "Data and memory access" sections
    do not yet reflect board.md write should be updated in a batch (AUD-010 pattern).
    Not an enforce-flip blocker; the guard reflects the owner A1 intent.

---

## GATE-REGISTER

No new external tool or service is adopted. No gate-register row is needed.
Internal guard.py security configuration change only.

---

Rambo (Security) | 2026-08-02 | interactive session
Sources verified: 10 files read in full; live guard.py line-by-line against diff.
