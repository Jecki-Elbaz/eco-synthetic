# Git-Sync Phase A -- A2 Sign-Off Record (T-0021)

Author: Ido (VP R&D, L3)
Date: 2026-06-16
Task: T-0021 -- Phase A Build A2 Sign-Off
Status: SIGNED -- A2 APPROVED
Output to: owner (jecki) for A1 deploy decision

Plain ASCII. No em dashes. No curly quotes.

---

## A2 SIGN-OFF STATEMENT

I, Ido (VP R&D, L3), hold A2 authority for build approval under the T-0021
task envelope and the autonomous gate recommendation
(company/processes/git-sync-autonomous-recommendation.md Section 7.1).

Having read all build artifacts and verified each of the four required Rambo
fixes, I find:

  - All four required fixes are present and correct in the built artifacts.
  - The build matches the approved design in architecture, classification logic,
    fail-closed behavior, and access-matrix compliance.
  - No artifact is deployed, scheduled, or executed. All carry the PROPOSAL header.
  - The QREF-placeholder item Shir flagged is a non-issue (see Section 3 below).
  - Gate-register entry is confirmed as a Phase B prereq (not a Phase A blocker).

VERDICT: SIGNED. Phase A build is complete. Artifacts are ready for owner A1
deploy decision (Phase B).

Nothing in Phase A executes or modifies any production system. The gate is
inert on disk until the owner takes the bootstrap actions in Phase B.

---

## 1. PER-FIX VERIFICATION

### FIX-1 -- Halt on missing hash file (REQUIRED before A2)

STATUS: PRESENT AND CORRECT.

Target files:
  - scripts/git-sync-runner-prompt.md (Pre-loop section, lines 44-51)
  - company/processes/git-sync-runbook.md (Step 1.6, lines 110-114)

Evidence:
  Runner prompt Pre-loop, missing-hash-file case now reads:
    Append INTEGRITY-CHECK=FAIL | FILE=/etc/git-sync-hashes.txt |
    REASON=hash-file-absent | ACTION=HALTED to gate-audit.log,
    append to memory/log.md, then "Stop immediately. Do NOT proceed
    with the sync loop."
  The warn-and-proceed (INTEGRITY-CHECK=SKIPPED) text is gone.

  Runbook Step 1.6 carries the explicit sequencing note:
    "IMPORTANT SEQUENCING: Step 1.4 (write /etc/git-sync-hashes.txt) MUST
    be completed BEFORE this step. If the scheduler fires before the hash
    file exists, GitSyncRunner will log INTEGRITY-CHECK=FAIL and halt."

  Rambo's required language from Section 6 Decision 3 ruling is matched
  exactly. Fail-closed holds.

### FIX-2 -- integrations/telegram-bridge/outbound/ in NEVER_STAGE (REQUIRED before A2)

STATUS: PRESENT AND CORRECT.

Target file:
  - integrations/telegram-bridge/bridge-git-sync.py (NEVER_STAGE list, line 91)

Evidence:
  NEVER_STAGE list (lines 82-92) contains:
    "integrations/telegram-bridge/outbound/"
  as the final entry (after "sources/"). The outbound notification directory
  is now blocked from staging by the defense-in-depth NEVER_STAGE check.
  The safe_stage() overlap check (lines 300-309) will also catch any future
  STAGE_PATHS addition that attempts to include this path.

### FIX-3 -- bridge-git-sync.py classified as control-plane in all three files (REQUIRED before A2)

STATUS: PRESENT AND CORRECT IN ALL THREE FILES.

Target files:
  (a) scripts/git-sync-runner-prompt.md -- Step 2, line 101
  (b) scripts/gate-runner.sh -- line 43 CP_PATTERN
  (c) integrations/telegram-bridge/bridge-git-sync.py -- lines 95-97 CP_PATTERN

Evidence:
  (a) Runner prompt Step 2 CONTROL-PLANE PATTERN block contains:
        ^integrations/telegram-bridge/bridge-git-sync\.py$
      as the 7th pattern entry.

  (b) gate-runner.sh CP_PATTERN string ends with:
        |^integrations/telegram-bridge/bridge-git-sync\.py$
      appended to the canonical pattern from recommendation.md Section 3.1.

  (c) bridge-git-sync.py CP_PATTERN regex (lines 95-97) is:
        r"^(\.claude/|CLAUDE\.md$|bridge\.py$|scripts/|company/governance/
        |company/constitution\.md$|integrations/telegram-bridge/bridge-git-sync\.py$)"
      The new alternation is the final entry in the group.

  All three are consistent with each other and with Rambo's ruling (Section 6
  Criterion 6, FIX-3). A commit that modifies only bridge-git-sync.py will
  now be classified control-plane and routed to Rambo review, not auto-merged.

### FIX-4 -- security-baseline.md write moved into Rambo sub-session (REQUIRED before A2)

STATUS: PRESENT AND CORRECT.

Target file:
  - scripts/git-sync-runner-prompt.md (Step 3b.3 Rambo invocation prompt block
    and Step 4.2)

Evidence:
  Step 3b.3 Rambo invocation prompt (lines 251-262) contains the instruction:
    "If your verdict is QUARANTINE, additionally append the following structured
    record to company/governance/security-baseline.md (you hold write authority
    on that path; do this inside your own sub-session before returning your
    verdict):"
    [structured record fields listed]
    "Append only. Never edit existing entries in security-baseline.md."

  Step 4.2 (GitSyncRunner quarantine sequence, lines 324-339) now writes only
  to logs/quarantine/security-baseline-entry.txt (local forensic copy) and
  carries the explicit NOTE:
    "GitSyncRunner must NOT write to company/governance/ directly -- the access
    matrix grants that write to Rambo only."

  The company/governance/ write is entirely inside the Rambo sub-session.
  GitSyncRunner writes none of the five company/governance/ paths. Access-matrix
  compliance confirmed.

---

## 2. BUILD-COMPLETE CONFIRMATION

The build matches the approved design (git-sync-autonomous-recommendation.md):

Architecture match:
  - Five-component architecture (fetch-only hook, GitSyncRunner, Rambo-via-Agent,
    bridge-git-sync.py, branch protection + audit log): fully implemented.
  - Classification logic: CP_PATTERN and DP_PREFIXES are consistent across all
    three classification points (runner prompt, gate-runner.sh, bridge-git-sync.py).
    Residual rule (unknown path -> control-plane) is present in all three.
    FIX-3 addition is consistent in all three.
  - Fail-closed: every error, timeout, ambiguous verdict, and ff-only failure
    routes to QUARANTINE. Confirmed across runner prompt, gate-runner.sh, and
    bridge-git-sync.py.
  - Diff-only isolation: the diff is written to logs/quarantine/ before Rambo
    is invoked; Rambo is instructed not to check out or merge any incoming file;
    the merge runs only after CLEAR. Confirmed in runner prompt Steps 3b.1-3b.5.
  - Self-protecting gate scripts: scripts/ is in CP_PATTERN; any commit to
    scripts/ triggers the gate's own review before the new version is applied.
  - No destructive commands: confirmed in runner prompt allowed/blocked list,
    gate-runner.sh header comment, and bridge-git-sync.py git() docstring.

Design Section 3.1 note on bridge-git-sync.py:
  The recommendation's canonical CP_PATTERN in Section 3.1 was written before
  bridge-git-sync.py existed as a separate file. FIX-3 (Rambo-mandated, carried
  into the build by Shir) adds bridge-git-sync.py to all three classification
  points. This is a required correction to the build, not a deviation from
  design intent. Section 1.2 and Section 8 of the recommendation confirm that
  bridge-git-sync.py is a separate process from bridge.py and that bridge.py
  itself (root-level) is control-plane. The security ruling is consistent.

Deployment status:
  Every artifact carries "PROPOSAL -- not deployed. Deployment is owner A1
  per git-sync-autonomous-recommendation.md." in its header. Nothing is
  scheduled, running, or live. The gate is inert on disk.

---

## 3. SHIR'S QREF-PLACEHOLDER ITEM -- NON-ISSUE CONFIRMATION

Shir flagged that the Rambo invocation prompt (Step 3b.3) contains the literal
string "<QREF>" where the actual quarantine ref value would go.

This is correct behavior. The QREF ref is created by GitSyncRunner in Step 4.1,
AFTER Rambo returns its verdict. Rambo's structured record (written inside the
Rambo sub-session on QUARANTINE) contains "<QREF>" as a placeholder; GitSyncRunner
then creates the actual quarantine ref (Step 4.1) and the placeholder value in
security-baseline.md records the fact that the ref was not yet known at the time
Rambo wrote the entry. This is the same pattern shown in Rambo's own FIX-4 ruling
(Section 6 Decision 4), which uses exactly the same placeholder language:
"QUARANTINE_REF: <QREF> (will be written by GitSyncRunner after you return)."

The design is consistent. The placeholder is intentional. Non-issue confirmed.

---

## 4. BUILT ARTIFACTS

All artifacts are proposals committed to the repo, inert until Phase B deploy.

| Artifact | Path | Phase A status |
|----------|------|----------------|
| GitSyncRunner system prompt | scripts/git-sync-runner-prompt.md | BUILT, A2 SIGNED |
| Gate-runner shell script | scripts/gate-runner.sh | BUILT, A2 SIGNED |
| Bridge git-sync daemon | integrations/telegram-bridge/bridge-git-sync.py | BUILT, A2 SIGNED |
| Systemd unit template | scripts/git-sync-systemd.unit.template | BUILT, A2 SIGNED |
| Operator runbook | company/processes/git-sync-runbook.md | BUILT, A2 SIGNED |

Note: the recommendation (Section 7.1) also listed rambo-review.sh as a Phase A
artifact. Rambo's clearance report reviewed gate-runner.sh in its place (consistent
with recommendation Section 3.5 ruling: shell scripts are called by GitSyncRunner
via Bash tool; the Rambo invocation is via Agent tool inside the runner prompt).
No gap; the Rambo-review function is embedded in the runner prompt Step 3b.3.

---

## 5. OWNER A1 DEPLOY CHECKLIST (Phase B)

Carried forward from git-sync-autonomous-recommendation.md Section 7.2
and git-sync-runbook.md Section 1. All items below require explicit owner
approval in the deploy session. None may be executed without that approval.

### 5.1 Branch protection (prerequisite -- do this first)

Configure in GitHub repo settings before any gate goes live:
  - Settings -> Branches -> Add branch protection rule -> master
  - Require pull request reviews before merging: YES (1 approval minimum)
  - Restrict who can push: owner (jecki) only
  - Block force pushes: YES
  - Allow deletions: NO

Without this, the gate provides no meaningful trust boundary.

### 5.2 One-time bootstrap (owner reads all scripts before this commit)

  cd <REPO_ROOT>
  git checkout master
  git pull origin master
  mkdir -p logs/quarantine
  touch logs/.gitkeep
  touch logs/quarantine/.gitkeep
  git add scripts/ integrations/telegram-bridge/bridge-git-sync.py logs/
  git status       # REVIEW staged files before committing
  git diff --cached  # READ the full diff -- this is the bootstrap trust step
  git commit -m "bootstrap: autonomous git-sync gate artifacts (T-0021, owner A1)"
  git push origin master

### 5.3 Write /etc/git-sync-hashes.txt (MUST complete before Step 5.5)

After the bootstrap commit:

  sha256sum <REPO_ROOT>/CLAUDE.md <REPO_ROOT>/.claude/agents/Rambo.md \
      > /etc/git-sync-hashes.txt
  chmod 644 /etc/git-sync-hashes.txt

If this step is skipped or done after the scheduler is active, GitSyncRunner
will log INTEGRITY-CHECK=FAIL and halt on every session.

### 5.4 Wire the bridge outbound watcher

bridge-git-sync.py does not currently implement an outbound directory watcher
(noted by Shir, confirmed as ADVISORY-1 by Rambo). The owner must add a hook
at bootstrap so that files written to integrations/telegram-bridge/outbound/
are consumed atomically (read, send to Telegram, delete) by the bridge daemon.

Recommended implementation: a filesystem watcher or polling loop in the bridge
daemon that reads any *.txt file in outbound/, sends it to the Telegram bot API,
and deletes the file. Retain no files after send. Implement before activating
the GitSyncRunner schedule, or quarantine alerts will silently accumulate
(they are in NEVER_STAGE, so they will not be committed, but they will not
reach Telegram until the watcher is live).

### 5.5 Schedule GitSyncRunner (AFTER Step 5.3 is complete)

Configure a recurring cloud session in the Claude Code scheduler:
  - System prompt: contents of scripts/git-sync-runner-prompt.md
  - Schedule: every 15 minutes
  - Working directory: <REPO_ROOT>
  - Tools: Read, Write, Edit, Bash (git only), Agent

This is the A1 action that activates the autonomous gate. Until scheduled,
all gate scripts are inert.

After scheduling, wait up to 15 minutes and verify:
  tail -f <REPO_ROOT>/logs/gate-audit.log
Expected: NO_OP | REASON=already-up-to-date (or AUTO-MERGED if commits are pending).

### 5.6 Deploy bridge-git-sync.py and systemd unit

  cp <REPO_ROOT>/scripts/git-sync-systemd.unit.template \
     /etc/systemd/system/bridge-git-sync.service
  # Edit the service file: fill all <ANGLE-BRACKET> placeholders
  sudo systemctl daemon-reload
  sudo systemctl enable bridge-git-sync.service
  sudo systemctl start bridge-git-sync.service
  sudo systemctl status bridge-git-sync.service    # verify Active: active (running)
  journalctl -u bridge-git-sync.service -f          # verify startup logs

Python deps required on bridge host:
  pip install watchdog==4.0.1 gitpython==3.1.43

### 5.7 Verify settings.json fetch-only hook

The fetch-only hook (UserPromptSubmit, git fetch origin 2>&1 | tail -1 || true)
was recommended in git-sync-recommendation.md (the prior document). Confirm it is
already in .claude/settings.json before the bootstrap commit. If not, owner adds
it manually (owner-only file; no agent may write it without A1).

### 5.8 Gate-register entry (before go-live)

Add an entry for the autonomous gate (GitSyncRunner, gate-runner.sh,
bridge-git-sync.py) to company/governance/gate-register.md before the
bootstrap commit is pushed. Rambo flagged this in Section 8 of the clearance
report. It is a Phase B prereq, not a Phase A blocker. Rambo should create
or review the entry.

---

## 6. WHAT REMAINS BLOCKED ON DALIA (Phase C)

The following cannot proceed until Dalia (Q&G) is activated:

  - Define gate-audit.log review cadence (recommended weekly scan; immediate
    on QUARANTINE -- but the threshold for escalation to Eco needs Dalia definition).
  - Define QUARANTINE escalation threshold (e.g., flag to Eco if QUARANTINE rate
    exceeds X% in a rolling window, or backlog exceeds N refs).
  - Define the acceptable audit trail standard for the autonomous gate (Dalia may
    add requirements beyond gate-audit.log).
  - Formal governance closure of T-0021.

Dalia's requirements are expected to be additive. Phase A and Phase B may proceed
before Dalia is live. T-0021 is not fully closed until Phase C completes.

---

## 7. VERIFICATION BASIS

Files read for this A2 sign-off (all read in this session before signing):

  company/processes/git-sync-phaseA-security-clearance.md
    (Rambo's four required fixes and rulings)
  scripts/git-sync-runner-prompt.md
    (FIX-1 halt language, FIX-3 CP pattern, FIX-4 Rambo invocation block)
  scripts/gate-runner.sh
    (FIX-3 CP_PATTERN, overall structure)
  integrations/telegram-bridge/bridge-git-sync.py
    (FIX-2 NEVER_STAGE, FIX-3 CP_PATTERN)
  company/processes/git-sync-runbook.md
    (FIX-1 sequencing note, bootstrap sequence)
  company/processes/git-sync-autonomous-recommendation.md
    (approved design for build-match verification)

---

Ido (VP R&D, L3) -- A2 sign-off 2026-06-16
T-0021 Phase A: COMPLETE. Awaiting owner A1 for Phase B deploy.
