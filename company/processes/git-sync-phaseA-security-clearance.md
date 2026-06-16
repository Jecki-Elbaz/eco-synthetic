# Git-Sync Phase A -- Security Clearance Report (T-0021)

Author: Rambo (Security, L3)
Date: 2026-06-16
Task: T-0021 -- Phase A Security Clearance
Reviewer: Rambo (agent session; Rambo cannot self-clear own tools, but this review
          covers Shir's BUILD of Rambo's own DESIGN -- Rambo is the correct reviewer
          for verifying the build matches the design)
Status: see per-artifact verdicts below
Output to: Eco (for relay to Ido for A2, and to owner for A1)
Plain ASCII. No em dashes. No curly quotes.

---

## Summary verdict

CLEAR-WITH-FIX (2 required fixes before Ido A2; 1 advisory)

No artifact is BLOCKED. All five artifacts are structurally sound and implement
the design faithfully. Two fixes are required before Ido A2 sign-off:
  FIX-1: missing hash file must HALT, not warn (Decision 3 ruling -- see Section 3).
  FIX-2: bridge-git-sync.py NEVER_STAGE is missing integrations/telegram-bridge/outbound/
          to prevent the outbound notification directory from being staged back to origin.

One advisory (no fix required before A2, but owner must confirm at bootstrap):
  ADVISORY-1: the outbound file-drop notification path (Decision 1) is safe as designed
              but requires the bridge daemon to watch and consume files atomically.
              Owner must implement the watcher hook at bootstrap (A1 action).

All required fixes are for Shir to implement. Rambo does not edit the artifacts.

---

## 1. Artifact: scripts/git-sync-runner-prompt.md

VERDICT: CLEAR-WITH-FIX (Fix-1 applies here)

### Criterion 1 -- Fail-closed

PASS. Every branch that can deviate from the happy path routes to QUARANTINE:
- Rambo Agent tool error or timeout -> QUARANTINE (Step 3b.4, explicit).
- Rambo malformed response -> QUARANTINE (Step 3b.4, explicit).
- ff-only merge failure on data-plane path -> QUARANTINE (Step 3a).
- ff-only merge failure after CLEAR -> QUARANTINE (Step 3b.5).
- Any unhandled exception -> QUARANTINE (Step 4 preconditions).
The only structural gap is the integrity-check skip on missing hash file (see
Criterion 7 and Decision 3 ruling).

### Criterion 2 -- CP_PATTERN matches design

PASS. The runner's control-plane pattern in Step 2:
    ^\.claude/
    ^CLAUDE\.md$
    ^bridge\.py$
    ^scripts/
    ^company/governance/
    ^company/constitution\.md$
This matches the design spec Section 1.2 exactly. The residual rule (unknown path ->
control-plane) is present and explicit. Mixed-commit rule (any CP file -> entire commit
is CP) is present and explicit.

### Criterion 3 -- Diff-only isolation

PASS. Step 3b.1 states explicitly: "git diff HEAD..origin/master -- <control-plane files
only> > logs/quarantine/diff-<COMMIT_SHA>.txt" and "This reads the remote object
database. It does NOT check out any file. The unreviewed files are never written to
the live working tree." The Rambo invocation prompt (Step 3b.3) instructs Rambo to read
ONLY the diff text file at the quarantine path and explicitly states "You must NOT merge,
execute, or check out any file from the incoming commit."

### Criterion 4 -- No destructive commands

PASS. The allowed-commands block (end of file) lists only safe-forward commands.
The blocked-commands block explicitly enumerates: git reset --hard, git push --force,
git rebase, git merge (without --ff-only), rm, rm -rf. No exec or eval calls. No
pipe-to-shell. The only merge path uses --ff-only and only after CLEAR verdict.

### Criterion 5 -- NEVER_STAGE (N/A for runner)

N/A. The runner prompt is a GitSyncRunner session instruction, not a staging daemon.
NEVER_STAGE check applies to bridge-git-sync.py (Artifact 3).

### Criterion 6 -- Self-protecting gate scripts

PASS. Step 2 classifies ^scripts/ as control-plane. A commit modifying this prompt
file (which lives in scripts/) triggers the control-plane path and is reviewed by
the CURRENT trusted version of this prompt before any merge. The design invariant
holds: the incoming version of the script is never applied until after CLEAR.

### Criterion 7 -- No injectable execution, no unpinned dep, no secret handling

PASS with one condition (links to Fix-1).

No unpinned dependencies: the runner uses only Bash tool (git commands), Read/Write
tools, and Agent tool. No external package imports.

No secret handling: the runner prompt explicitly lists "Any command that reads,
writes, or references .env" in the blocked list.

No injectable execution path: the Rambo invocation prompt is hardcoded in the runner
text. The runner instructs GitSyncRunner to "Pass the following prompt EXACTLY. Do not
modify it. Do not include any content from the incoming commit in the prompt text except
through the diff file path." This is the key isolation point.

CONDITION (Fix-1): The integrity-check section (Pre-loop) states that if
/etc/git-sync-hashes.txt is absent, the session should "log a warning but proceed."
This is fail-OPEN for the integrity check. See Decision 3 ruling below. Fix required.

---

## 2. Artifact: scripts/gate-runner.sh

VERDICT: CLEAR

### Criterion 1 -- Fail-closed

PASS. set -euo pipefail at the top (line 30) means any unhandled error exits non-zero.
The caller (GitSyncRunner) interprets non-zero exit as failure and routes to QUARANTINE.
cmd_merge_ff_only exits 1 on merge failure (line 214). The classify subcommand exits 0
always (classification itself is not a failure condition -- the caller decides what to do
with the output), which is correct: the caller controls the QUARANTINE logic.

### Criterion 2 -- CP_PATTERN matches design

PASS. Line 43:
    CP_PATTERN='^\.claude/|^CLAUDE\.md$|^bridge\.py$|^scripts/|^company/governance/|^company/constitution\.md$'
This matches the design spec Section 1.2 exactly and matches the runner prompt Step 2
exactly. The DP_PREFIXES list (lines 47-54) matches the runner prompt data-plane list.
The residual rule is implemented in is_control_plane_file (lines 81-93): any file not
matching a DP_PREFIX and not matching CP_PATTERN is treated as control-plane. Correct.

Design spec mentions ".claude/settings.json (redundant with .claude/ but called out
explicitly)". It is correctly captured by the ^\.claude/ prefix in CP_PATTERN. No gap.

### Criterion 3 -- Diff-only isolation

PASS. cmd_diff_to_quarantine (lines 150-192) runs:
    git diff "HEAD..origin/master" -- $all_cp > "$diff_file" 2>&1
This reads the remote ref by hash only. No checkout, no file extraction from the
incoming commit into the working tree. The diff goes to logs/quarantine/ (a
pre-existing directory, not a file in the working tree that could affect agent behavior).

One note: line 188 uses unquoted $all_cp in the git diff command. This is a word-split
issue -- if any control-plane filename contains whitespace, the split will be wrong. In
practice, none of the control-plane paths in this project contain spaces, and this is
not a security gap (it would cause a failed diff, not an unsafe merge). Not flagged as
a required fix, but Shir should be aware.

### Criterion 4 -- No destructive commands

PASS. The header comment (lines 27-28) states: "NO DESTRUCTIVE COMMANDS. This script
never runs: git reset --hard, git push --force, git rebase, rm -rf, DROP TABLE."
grep confirms: no instance of reset, push --force, rebase, or rm -rf anywhere in the
file. The only write to the filesystem is: append to AUDIT_LOG, mkdir -p QUARANTINE_DIR,
and write diff to quarantine file. All safe. Merges use --ff-only only.

### Criterion 5 -- NEVER_STAGE

N/A for this script (gate-runner.sh does not stage files).

### Criterion 6 -- Self-protecting gate scripts

PASS. The script lives in scripts/ which is CP_PATTERN-matched. Any modification to
gate-runner.sh is itself classified control-plane and reviewed by the CURRENT version
before the new version is applied. The self-protection invariant holds.

### Criterion 7 -- No injectable execution, no unpinned dep, no secret handling

PASS. No external dependencies beyond git and standard bash builtins. No curl, wget,
or external network calls. No .env reads. No eval or dynamic exec patterns. REPO_ROOT
is set from environment variable with a hardcoded default (line 36); the owner sets it
at bootstrap. No credential handling anywhere in the script.

---

## 3. Artifact: integrations/telegram-bridge/bridge-git-sync.py

VERDICT: CLEAR-WITH-FIX (Fix-2 applies here)

### Criterion 1 -- Fail-closed

PASS. has_control_plane_changes() returns (True, ["DIFF_ERROR"]) on git error and
(True, ["EXCEPTION"]) on exception (lines 208-216). Both are fail-closed: the caller
treats any True return as a block on the pull path. pull_data_plane_only() returns False
(blocking further action) on any failure. commit_and_push() aborts if pull-before-push
fails. The daemon does not stage or push if it cannot confirm the data-plane-only
classification.

### Criterion 2 -- CP_PATTERN matches design

PASS. CP_PATTERN at line 94-96:
    r"^(\.claude/|CLAUDE\.md$|bridge\.py$|scripts/|company/governance/|company/constitution\.md$)"
This matches the design spec and the other artifacts exactly. DP_PREFIXES at lines 99-106
match the runner prompt data-plane list.

NOTE: the python CP_PATTERN uses a capturing group but is used only with re.match, which
anchors to the start of the string. This is correct behavior. The regex itself is
functionally equivalent to the shell grep -E pattern in the other artifacts.

### Criterion 3 -- Diff-only isolation

PASS (Direction C only; Direction B is write-out, not read-in from incoming commits).
Direction C pull uses git merge --ff-only only after confirming no control-plane changes
are pending (has_control_plane_changes check). Direction B only stages STAGE_PATHS, never
reads or executes incoming files. The daemon has no code path that checks out or reads
unreviewed incoming files before a CLEAR verdict -- that role belongs entirely to
GitSyncRunner.

### Criterion 4 -- No destructive commands

PASS. The git() helper (lines 142-160) documents: "Destructive commands (reset --hard,
push --force, rebase, rm -rf) are never called anywhere in this file." Confirmed by
inspection: no instance of reset, push --force, rebase, or rm -rf in the file.
All merges use --ff-only (line 270). Push is standard git push origin master (line 350).

### Criterion 5 -- NEVER_STAGE correctness

CLEAR-WITH-FIX (Fix-2).

NEVER_STAGE (lines 84-91):
    ".claude/",
    "CLAUDE.md",
    "company/governance/",
    "scripts/",
    "bridge.py",
    "company/constitution.md",
    ".env",
    "sources/",

Cross-check against design criteria:
- .claude/ -- PRESENT. PASS.
- CLAUDE.md -- PRESENT. PASS.
- company/governance/ -- PRESENT. PASS.
- scripts/ -- PRESENT. PASS.
- bridge.py -- PRESENT. PASS.
- .env -- PRESENT. PASS.
- sources/ -- PRESENT. PASS.

MISSING from NEVER_STAGE:
- integrations/telegram-bridge/outbound/ -- ABSENT. FIX REQUIRED.

The quarantine notification path (Decision 1, runner prompt Step 4.4) writes files to
integrations/telegram-bridge/outbound/. The bridge-git-sync.py watches and stages
integrations/ (STAGE_PATHS includes "integrations/"). If a quarantine notification file
lands in integrations/telegram-bridge/outbound/, the daemon will pick it up, stage it,
and commit it back to origin. This is not a security escalation (the file content is a
plain-text notification), but it is an unintended write-back loop: quarantine alerts
accumulate in the repo history, and more importantly, the outbound directory is a
write-surface that should not be committed.

Fix-2: add "integrations/telegram-bridge/outbound/" to NEVER_STAGE in bridge-git-sync.py
before A2 sign-off.

Also add an explicit safe_stage() check: the current safe_stage() defense-in-depth
check (lines 299-307) compares STAGE_PATHS entries against NEVER_STAGE entries for
prefix overlap. This check is correct for the existing entries but will not catch
sub-directory paths inside an already-whitelisted STAGE_PATH unless the exact string
is in NEVER_STAGE. Adding the outbound path to NEVER_STAGE is necessary; it is not
sufficient to rely on the prefix-overlap check alone for this case.

### Criterion 6 -- Self-protecting gate scripts

PASS (for bridge-git-sync.py specifically). The file lives at
integrations/telegram-bridge/bridge-git-sync.py. The runner prompt CP_PATTERN includes
^bridge\.py$ -- but this matches only a file named bridge.py at the repo root, not
bridge-git-sync.py in a subdirectory. However, the "integrations/" prefix is a
data-plane prefix, which means bridge-git-sync.py by itself would be data-plane under
the residual rule.

FINDING: bridge-git-sync.py is NOT currently classified as control-plane by the
existing CP_PATTERN. A commit that only modifies integrations/telegram-bridge/bridge-git-sync.py
would be classified data-plane and auto-merged.

CROSS-CHECK WITH DESIGN: the design spec Section 1.2 lists "bridge.py (execution surface;
hook logic lives here)" as control-plane. The design was written before bridge-git-sync.py
existed as a separate file. The design's intent is clearly that the bridge execution
surface is control-plane. The implementation gap is that bridge-git-sync.py was created
as a separate file in a data-plane directory.

RULING: this is a design-vs-build gap that requires a judgment call before A2.
Two options:
  Option A: Add ^integrations/telegram-bridge/bridge-git-sync\.py$ to CP_PATTERN in
            all three places (runner prompt, gate-runner.sh, bridge-git-sync.py).
  Option B: Accept that bridge-git-sync.py is data-plane auto-mergeable because it is
            separate from bridge.py and its changes go through the standard STAGE_PATHS
            commit path (which is also watched by GitSyncRunner on the next pull).

Rambo ruling: Option A is the correct security posture. bridge-git-sync.py is a daemon
that runs git add and git push. A change to it that introduces a new git push --force
call or removes the NEVER_STAGE check would be auto-merged under the current pattern.
That is a meaningful escalation path. Add bridge-git-sync.py to CP_PATTERN.

This is FIX-3: Add ^integrations/telegram-bridge/bridge-git-sync\.py$ to CP_PATTERN
in: (a) scripts/git-sync-runner-prompt.md Step 2, (b) scripts/gate-runner.sh line 43,
(c) bridge-git-sync.py line 94. All three must be consistent.

Rambo escalates this to Ido (via Eco) as a required fix before A2. The fix itself will
be a control-plane commit (modifying scripts/) and will flow through the gate's own
review on first live session -- but it must be correct in the bootstrap commit.

### Criterion 7 -- No injectable execution, no unpinned dep, no secret handling

PASS with notes.

Dependencies: watchdog==4.0.1 and gitpython==3.1.43 -- both pinned (lines 32-33).
PASS.

No secret handling: no .env reads, no credential references, no token strings.
PASS.

No injectable execution: the git() helper (lines 142-160) passes a fixed list of
args to subprocess.run with a list (not a shell string). This is safe -- no shell
injection via git arguments because subprocess.run with a list does not invoke a shell.
PASS.

The watchdog observer watches memory/ and integrations/ directories for filesystem
events. The on_any_event handler (lines 408-416) does not read or execute any file
content -- it only schedules a commit cycle. PASS.

The polling fallback (lines 505-509) calls commit_and_push() on every poll interval.
This does not introduce injection. PASS.

---

## 4. Artifact: scripts/git-sync-systemd.unit.template

VERDICT: CLEAR

This is a template with placeholder values; it is never executed directly. Security
review covers the template structure.

### Criterion 4 -- No destructive commands

PASS. ExecStart is the only command directive. It runs bridge-git-sync.py under
the configured Python interpreter. No rm, no force-push, no reset.

### Criterion 7 -- No injectable execution, no unpinned dep, no secret handling

PASS. No credentials in the template. All sensitive values are placeholders
(<SERVICE_USER>, <REPO_ROOT_ABSOLUTE_PATH>, <PYTHON_PATH>) filled by the owner
at bootstrap. The security hardening block (lines 78-85) adds NoNewPrivileges=true,
ProtectSystem=strict, ReadWritePaths=<REPO_ROOT>, ProtectHome=read-only. These are
correct least-privilege settings for a systemd service. The verification checklist
at the bottom of the file correctly requires Rambo clearance before starting the
service.

One note: ProtectSystem=strict combined with ReadWritePaths=<REPO_ROOT> allows
writes only to REPO_ROOT. This is correct and consistent with the daemon's function.

No gate concerns with this artifact.

---

## 5. Artifact: company/processes/git-sync-runbook.md

VERDICT: CLEAR

This is an operator runbook (documentation). Security review covers the procedures
specified.

### Operator procedures review

Section 1.3 (bootstrap commit): instructs owner to run git status and git diff --cached
before committing. Correct. This is the trust-root inspection step.

Section 1.4 (integrity hash file): correctly instructs owner to write SHA-256 hashes
of CLAUDE.md and .claude/agents/Rambo.md to /etc/git-sync-hashes.txt outside the repo.
Format matches what the runner prompt expects. Correct.

Section 2.2 (quarantine resolution, Option A): instructs the owner to run
git merge --ff-only refs/quarantine/<timestamp> and then git push origin master.
Does NOT use push --force. Correct. The note about rebase is framed correctly
("consider rebasing your local changes"; "Do NOT git push --force"). Correct.

Section 4.3 (INTEGRITY-CHECK=FAIL response): correctly instructs the owner to treat
an unexpected hash mismatch as a potential security incident, pause the runner schedule
(A1 action), and escalate. Correct.

Section 4.6 (failure mode 4.6): same as above. Consistent. Correct.

No security concerns in the runbook procedures.

---

## 6. Rulings on Shir's Implementation Decisions

### DECISION 1 -- Telegram outbound via file-drop to integrations/telegram-bridge/outbound/

RULING: SAFE AS A NOTIFICATION PATH with one required action (ADVISORY-1).

Rationale:
1. Direct Telegram bot API call via curl is correctly blocked by CLAUDE.md red line 4.
   The file-drop approach is the correct fail-safe given that constraint.
2. The outbound directory is a write surface within the repo, but the content written
   is a structured plain-text notification (no code, no executable, no credentials).
   A prompt-injection attacker cannot use this path to inject instructions because the
   bridge daemon reading the file sends it to Telegram -- it does not parse it as LLM
   instructions.
3. The mechanism creates no new network call from the runner session. The bridge daemon
   (already deployed) handles the actual Telegram send. The isolation between runner
   (cloud) and bridge (local) is maintained.

ADVISORY-1 (owner action at bootstrap): The outbound/ directory must be consumed and
cleared by the bridge daemon atomically (read file, send to Telegram, delete file) to
prevent accumulation. The current bridge-git-sync.py does NOT implement an outbound
watcher -- Shir noted this in Decision 1. The owner must add this hook at bootstrap.
Rambo recommends: process files atomically (read-then-delete before send, or move to a
processed/ subdirectory), and limit file retention to prevent the outbound directory
from growing unbounded.

The outbound path is also not in NEVER_STAGE -- see Fix-2 above. Fix-2 is required
regardless of how Advisory-1 is implemented.

### DECISION 3 -- Missing /etc/git-sync-hashes.txt: warn vs halt

RULING: HALT is required. Warn-and-proceed is rejected.

The current implementation (runner prompt Pre-loop section) says: "If the hash file
does not exist on the bridge host (bootstrap not yet complete): Log a warning to
logs/gate-audit.log but proceed."

Rambo rejects this.

Reason: the integrity check exists to detect tampering with CLAUDE.md or
.claude/agents/Rambo.md before the review session runs. If the hash file is absent,
the check cannot run. Proceeding anyway means the integrity check provides no protection
in exactly the window where it is most needed -- when the system is newly configured and
may not have been properly bootstrapped. A compromised bootstrap commit could omit the
hash file creation step, and the gate would silently skip the check forever.

The "covers the bootstrap window" argument is not sufficient. The bootstrap window is
an A1 owner action. The owner controls when the first GitSyncRunner session fires.
If the owner configures the scheduler (Step 1.6 of the runbook) before writing the
hash file (Step 1.4 of the runbook), that is a sequencing error in the bootstrap
procedure -- the runbook should enforce the correct order, and the gate should halt
rather than silently proceed without the hash check.

FIX-1: change the runner prompt Pre-loop section to treat a missing hash file as a
HALT condition, not a warning. The halt log entry should use the same INTEGRITY-CHECK=FAIL
format so that the runbook's Section 4.6 handling procedure applies. The runbook Step 1
checklist must also note that /etc/git-sync-hashes.txt must be written (Step 1.4) BEFORE
the scheduler is activated (Step 1.6).

Specific fix for git-sync-runner-prompt.md Pre-loop, replace the current text for the
missing-hash-file case:

    CURRENT:
    If the hash file does not exist on the bridge host (bootstrap not yet complete):
      - Log a warning to logs/gate-audit.log but proceed. This covers the window
        between artifact commit and bootstrap completion.
      - Format: <TIMESTAMP> | INTEGRITY-CHECK=SKIPPED | REASON=hash-file-absent

    REQUIRED:
    If the hash file does not exist on the bridge host:
      - Append to logs/gate-audit.log:
          <TIMESTAMP> | INTEGRITY-CHECK=FAIL | FILE=/etc/git-sync-hashes.txt |
          REASON=hash-file-absent | ACTION=HALTED
      - Append to memory/log.md:
          INTEGRITY-HALT <timestamp> /etc/git-sync-hashes.txt not found -- sync aborted.
          Bootstrap must complete before runner activates (see runbook Step 1.4 before 1.6).
      - Stop immediately. Do NOT proceed with the sync loop.

Also update the git-sync-runbook.md Section 1 to add: "Complete Step 1.4 (write hash file)
BEFORE Step 1.6 (activate GitSyncRunner scheduler). The runner halts if the hash file
is absent."

### DECISION 4 -- Who writes security-baseline.md on QUARANTINE

RULING: GitSyncRunner writing to security-baseline.md directly is INCORRECT per the
access matrix. A dedicated Rambo session write is the correct path, and Shir's own note
identifies this question correctly.

Access matrix (company/governance/access-matrix.md, path "company/governance/"):
    Read: Eco, Dalia, Rambo, Eyal
    Write: Dalia (access-matrix), Eyal (gate-register), Rambo (security-baseline)

GitSyncRunner is a separate agent session. It is not Rambo. Writing to
company/governance/security-baseline.md from a GitSyncRunner session violates the
access matrix write restriction. GitSyncRunner is a data-pipeline runner, not a
security agent; granting it write access to company/governance/ is scope creep.

Correct path: when Rambo (invoked via Agent tool in Step 3b.3) issues a QUARANTINE
verdict, Rambo's own session should append the quarantine record to
company/governance/security-baseline.md as part of its verdict output. Rambo already
has write authority over security-baseline.md (A3 write, confirmed in access matrix).
The quarantine record can be part of Rambo's response output, and GitSyncRunner can
pass it back to Rambo for the append, or Rambo can perform the append directly inside
the Rambo sub-session.

Implementation note for Shir: the quarantine record currently described in Step 4.2
of the runner prompt should be moved into the Rambo invocation response. Add to the
Rambo invocation prompt (within the --- BEGIN RAMBO INVOCATION PROMPT --- block):
"If your verdict is QUARANTINE, additionally append the following structured record to
company/governance/security-baseline.md (Rambo owns this file; you are authorized to
write it):
    DATE: <timestamp>
    COMMIT: <sha>
    PUSHER: <email>
    FAILING_CHECKS: <list>
    DIFF_FILE: logs/quarantine/diff-<sha>.txt
    QUARANTINE_REF: <QREF> (will be written by GitSyncRunner after you return)
    DISPOSITION: PENDING-OWNER-REVIEW"

GitSyncRunner then handles only logs/quarantine/security-baseline-entry.txt,
memory/board.md, logs/gate-audit.log, and the quarantine ref -- none of which are
in company/governance/.

This is a required fix before A2 (access-matrix correctness, not just a style point).
Designate this FIX-3-ACCESS.

Wait -- I already used FIX-3 above for bridge-git-sync.py CP_PATTERN. Renumbering:
  FIX-1: halt on missing hash file (runner prompt)
  FIX-2: add integrations/telegram-bridge/outbound/ to NEVER_STAGE (bridge-git-sync.py)
  FIX-3: add bridge-git-sync.py to CP_PATTERN in all three files
  FIX-4: move security-baseline.md append into Rambo sub-session (runner prompt + Rambo
          invocation prompt block)

### DECISION 2 -- Duplicate quarantine detection

Comment only. The git for-each-ref check before creating a new quarantine ref is
correct behavior. No security angle. The idempotent board.md and log.md updates are
also correct. No fix needed.

### DECISION 5 (not explicitly labelled but implied in systemd template)

The systemd template is correct. No security angle beyond what is covered in
Criterion 7 of Artifact 4.

---

## 7. Required fixes before Ido A2

All four fixes are for Shir to implement. Rambo does not edit the artifacts.

FIX-1 (REQUIRED before A2)
Target: scripts/git-sync-runner-prompt.md
Change: In the Pre-loop integrity check section, replace the warn-and-proceed behavior
        for a missing /etc/git-sync-hashes.txt with a halt-and-log behavior using the
        INTEGRITY-CHECK=FAIL format. Also update the runbook to sequence Step 1.4
        (write hash file) before Step 1.6 (activate scheduler).
Reason: fail-open on a missing integrity file breaks the hash-check guarantee entirely.

FIX-2 (REQUIRED before A2)
Target: integrations/telegram-bridge/bridge-git-sync.py
Change: Add "integrations/telegram-bridge/outbound/" to the NEVER_STAGE list (after
        line 90, before the closing bracket of the list).
Reason: the outbound notification directory is inside integrations/ (a STAGE_PATH).
        Without this entry, quarantine alert files written by GitSyncRunner will be
        staged and committed back to origin by the bridge daemon.

FIX-3 (REQUIRED before A2)
Targets: scripts/git-sync-runner-prompt.md (Step 2 CP pattern),
         scripts/gate-runner.sh (line 43 CP_PATTERN),
         integrations/telegram-bridge/bridge-git-sync.py (line 94 CP_PATTERN)
Change: Add bridge-git-sync.py to the control-plane pattern in all three locations.
        Exact pattern to add: ^integrations/telegram-bridge/bridge-git-sync\.py$
        (as an additional alternation in the existing pattern string).
Reason: bridge-git-sync.py is an execution surface (daemon that runs git add, commit,
        push). It is not covered by ^bridge\.py$ (which matches only the root bridge.py).
        A commit that modifies only bridge-git-sync.py would be auto-merged as data-plane
        under the current pattern.

FIX-4 (REQUIRED before A2)
Target: scripts/git-sync-runner-prompt.md
Change: Move the security-baseline.md append (currently Step 4.2 in the QUARANTINE
        section) into the Rambo invocation prompt block. GitSyncRunner must not write
        to company/governance/security-baseline.md directly. Rambo performs that write
        inside its own sub-session as part of the QUARANTINE verdict output. Adjust the
        Rambo invocation prompt (--- BEGIN RAMBO INVOCATION PROMPT ---) to include
        the instruction for Rambo to append the quarantine record to security-baseline.md
        when issuing QUARANTINE. Remove the reference to security-baseline.md from
        Step 4.2 (GitSyncRunner's quarantine sequence).
Reason: access matrix grants write on company/governance/security-baseline.md to Rambo
        only. GitSyncRunner is not Rambo. Violates the access matrix.

---

## 8. Gate-register note

The git-sync autonomous gate (GitSyncRunner, gate-runner.sh, bridge-git-sync.py) is a
new execution surface and integration. Before go-live it must have a gate-register.md
entry (company/governance/gate-register.md). Rambo has not reviewed gate-register.md in
this session; this is a reminder to Ido to confirm the entry exists or is created as
part of the A2 sign-off package.

---

## 9. Clearance summary table

| Artifact | Verdict | Fixes required |
|----------|---------|----------------|
| scripts/git-sync-runner-prompt.md | CLEAR-WITH-FIX | FIX-1, FIX-3 (pattern), FIX-4 |
| scripts/gate-runner.sh | CLEAR | FIX-3 (pattern update to this file) |
| integrations/telegram-bridge/bridge-git-sync.py | CLEAR-WITH-FIX | FIX-2, FIX-3 (pattern) |
| scripts/git-sync-systemd.unit.template | CLEAR | none |
| company/processes/git-sync-runbook.md | CLEAR | FIX-1 sequencing note |

All five artifacts implement the design faithfully in structure and logic. The four
fixes are targeted and do not require redesign -- they are corrections to specific
lines or blocks. Once fixed by Shir, these artifacts can proceed to Ido A2.

---

End of Phase A security clearance. Output to Eco for relay to Ido (A2) and owner (A1).
Rambo sign-off: Rambo (Security, L3), 2026-06-16.
